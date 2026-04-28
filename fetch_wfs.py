import urllib.request
import json
from pyproj import Transformer

url = "https://parcari3.ro:8443/parcari/api/Parking/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=PS3:v_123_cad_loc_parcare_arie&outputFormat=application/json&srsname=EPSG:3844&bbox=584000,320000,598000,332000,EPSG:3844"

print("Fetching WFS data for Sector 3... this may take 10-20 seconds (58 MB expected).")

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = response.read()
        j = json.loads(data)
        features = j.get('features', [])
        print(f"Successfully downloaded {len(features)} parking spots.")
except Exception as e:
    print('Failed to fetch data:', e)
    exit(1)

# Initialize Transformer from EPSG:3844 (Stereo 70) to EPSG:4326 (WGS84 Lat/Lon)
transformer = Transformer.from_crs("EPSG:3844", "EPSG:4326", always_xy=True)

print("Processing coordinates and cleaning properties...")

clean_features = []
for f in features:
    props = f.get('properties', {})
    
    # Keep only essential data to minimize JSON size
    clean_props = {
        'baterie': props.get('cod_parcare'),
        'numar': props.get('nr_loc_parcare'),
        'ocupat': props.get('ocupat'),
        'zona': props.get('denumire_zona')
    }
    
    geom = f.get('geometry')
    if not geom or geom.get('type') not in ['Polygon', 'MultiPolygon']:
        continue
        
    coords = geom.get('coordinates', [])
    new_coords = []
    
    if geom['type'] == 'Polygon':
        for ring in coords:
            new_ring = []
            for point in ring:
                # pyproj always_xy=True expects (X, Y) -> (Lon, Lat)
                lon, lat = transformer.transform(point[0], point[1])
                new_ring.append([round(lon, 7), round(lat, 7)])
            new_coords.append(new_ring)
    
    # We only care about Polygon for now since parking spots are simple rectangles
    clean_features.append({
        "type": "Feature",
        "properties": clean_props,
        "geometry": {
            "type": "Polygon",
            "coordinates": new_coords
        }
    })

out_json = {
    "type": "FeatureCollection",
    "features": clean_features
}

out_file = "s3_polygons.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(out_json, f, separators=(',', ':'))

print(f"Finished! Processed {len(clean_features)} polygons saved to {out_file}.")

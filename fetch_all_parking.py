import urllib.request
import json
import ssl
from pyproj import Transformer
import sys
import os

def main():
    print("Initializing pyproj transformer EPSG:3844 -> EPSG:4326...")
    transformer = Transformer.from_crs("EPSG:3844", "EPSG:4326", always_xy=True)

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&srsname=EPSG:4326'
    
    print("Fetching data from mobilitateurbana4.ro WFS endpoint. This may take a moment...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            print(f"Successfully fetched {len(features)} features.")
            
            optimized_features = []
            
            print("Processing and converting coordinates...")
            for f in features:
                props = f.get('properties', {})
                geom = f.get('geometry', {})
                
                if not geom or geom.get('type') != 'Polygon':
                    continue
                
                color = "#22c55e" # free
                status_str = "free"
                
                if props.get('ocupat', 0) > 0:
                    color = "#ef4444"
                    status_str = "occupied"
                    
                mentiuni = props.get('mentiuni')
                if mentiuni and 'dizabilitati' in str(mentiuni).lower():
                    color = "#3b82f6"
                    status_str = "handicap"
                    
                optimized_props = {
                    "spot_id": props.get('nr_loc_parcare', 'Unknown'),
                    "address": props.get('delimitare_zona', 'Sector 4'),
                    "status": status_str,
                    "color": color
                }
                
                # Convert coords
                orig_coords = geom.get('coordinates', [[]])[0]
                converted_coords = []
                for pt in orig_coords:
                    # pyproj transformer expects (x, y), always_xy=True makes it (lon, lat)
                    lon, lat = transformer.transform(pt[0], pt[1])
                    # truncate float to 6 decimal places to save massive space
                    converted_coords.append([round(lon, 6), round(lat, 6)])
                
                optimized_features.append({
                    "type": "Feature",
                    "properties": optimized_props,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [converted_coords]
                    }
                })
                
            optimized_geojson = {
                "type": "FeatureCollection",
                "features": optimized_features
            }
            
            out_file = "sector4_parking.geojson"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(optimized_geojson, f, separators=(',', ':'))
            
            file_size = os.path.getsize(out_file) / (1024 * 1024)
            print(f"Data saved successfully to {out_file} (Size: {file_size:.2f} MB)")
            
    except Exception as e:
        print("An error occurred:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()

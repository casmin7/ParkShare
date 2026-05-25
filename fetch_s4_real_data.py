"""
Sector 4 Parking Generator — Vector Squares approach.

Fetches official points from WFS and exports them as 1.5x1.5m Square Polygons
to prevent visual overlaps but also prevent Leaflet DOM lag.
"""
import urllib.request
import json
import ssl
import sys
import os
import math
import time

def distance_meters(lat1, lng1, lat2, lng2):
    lat_mid = (lat1 + lat2) / 2.0
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(math.radians(lat_mid))
    dx = (lng2 - lng1) * scale_lng
    dy = (lat2 - lat1) * scale_lat
    return math.sqrt(dx * dx + dy * dy)

def make_square(lat, lng, size_m=1.5):
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(math.radians(lat))
    dx = (size_m / 2) / scale_lng
    dy = (size_m / 2) / scale_lat
    
    # Return as [lng, lat] for GeoJSON
    return [
        [round(lng - dx, 7), round(lat - dy, 7)],
        [round(lng + dx, 7), round(lat - dy, 7)],
        [round(lng + dx, 7), round(lat + dy, 7)],
        [round(lng - dx, 7), round(lat + dy, 7)],
        [round(lng - dx, 7), round(lat - dy, 7)]
    ]

def fetch_json(url, ctx, label="data", timeout=120):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {label}: {e}")
            if attempt < 2:
                time.sleep(3)
    print(f"FATAL: Could not fetch {label}")
    sys.exit(1)

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("=" * 60)
    print("STEP 1: Fetching official parking spot points")
    print("=" * 60)

    res_url = ('https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0'
               '&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta'
               '&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326')
    res_data = fetch_json(res_url, ctx, "residential points")
    res_features = res_data.get('features', [])
    print(f"  Residential points: {len(res_features)}")

    pub_url = ('https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0'
               '&request=GetFeature&typeName=Sector4_city:nparking_parcari_publice'
               '&outputFormat=application/json&maxFeatures=20000&srsname=EPSG:4326')
    pub_data = fetch_json(pub_url, ctx, "public points")
    pub_features = pub_data.get('features', [])
    print(f"  Public points: {len(pub_features)}")

    # Extract clean raw points
    raw_points = []
    for f in res_features:
        geom = f.get('geometry')
        if not geom or geom.get('type') != 'Point':
            continue
        coords = geom.get('coordinates', [])
        if len(coords) < 2:
            continue
        props = f.get('properties', {})
        raw_points.append({
            'lat': coords[1], 'lng': coords[0],
            'bat': str(props.get('parcare_arondata') or '').strip(),
            'num': str(props.get('nr_parcare') or '').strip(),
            'tip_loc': props.get('tip_loc', 1),
            'type': 'residential',
        })

    for f in pub_features:
        geom = f.get('geometry')
        if not geom or geom.get('type') != 'Point':
            continue
        coords = geom.get('coordinates', [])
        if len(coords) < 2:
            continue
        props = f.get('properties', {})
        raw_points.append({
            'lat': coords[1], 'lng': coords[0],
            'bat': str(props.get('id_parcare') or '').strip(),
            'num': str(props.get('nr_parcare') or '').strip(),
            'tip_loc': props.get('tip_loc', 5),
            'type': 'public',
        })

    print(f"  Raw points (before dedup): {len(raw_points)}")

    # Deduplicate strictly by coordinate proximity (< 0.5m)
    coord_grid = {}
    all_points = []
    for pt in raw_points:
        key = (round(pt['lat'], 5), round(pt['lng'], 5))  # ~1.1m grid
        is_dup = False
        for dk_lat in (-0.00001, 0, 0.00001):
            for dk_lng in (-0.00001, 0, 0.00001):
                nk = (round(key[0] + dk_lat, 5), round(key[1] + dk_lng, 5))
                for existing_idx in coord_grid.get(nk, []):
                    ep = all_points[existing_idx]
                    d = distance_meters(pt['lat'], pt['lng'], ep['lat'], ep['lng'])
                    if d < 0.5:
                        is_dup = True
                        break
                if is_dup:
                    break
            if is_dup:
                break
        if not is_dup:
            idx = len(all_points)
            all_points.append(pt)
            coord_grid.setdefault(key, []).append(idx)

    print(f"  Unique points (after coord dedup): {len(all_points)}")

    # Build GeoJSON feature collection of Polygons (squares)
    features = []
    for pt in all_points:
        if pt['type'] == 'residential':
            props = {
                'id': f"s4r-{pt['bat']}-{pt['num']}",
                'baterie': pt['bat'],
                'numar': pt['num'],
                'ocupat': pt['tip_loc'],
                'zona': f"S4-{pt['bat']}",
            }
        else:
            props = {
                'id': f"s4p-{pt['bat']}-{pt['num']}",
                'baterie': pt['bat'],
                'numar': pt['num'],
                'ocupat': pt['tip_loc'],
                'zona': f"S4-PUB-{pt['bat']}",
            }
            
        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": {
                "type": "Point",
                "coordinates": [round(pt['lng'], 7), round(pt['lat'], 7)]
            }
        })

    out = {"type": "FeatureCollection", "features": features}
    out_file = "s4_points.json"
    with open(out_file, "w", encoding="utf-8") as f:
        # Save compact JSON without spaces
        json.dump(out, f, separators=(',', ':'))

    size_mb = os.path.getsize(out_file) / (1024 * 1024)
    print(f"  Saved {len(features)} polygons to {out_file} ({size_mb:.2f} MB)")
    print("\nDone!")


if __name__ == '__main__':
    main()

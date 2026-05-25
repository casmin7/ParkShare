import urllib.request
import json
import ssl
import math

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("=== Step 1: Fetching points from GeoServer WFS ===")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    res_data = json.loads(urllib.request.urlopen(req, context=ctx).read().decode('utf-8'))
    res_features = res_data.get('features', [])
    print(f"Fetched {len(res_features)} residential points.")

    point_grid = {}
    for f in res_features:
        geom = f.get('geometry')
        if not geom or geom.get('type') != 'Point':
            continue
        coords = geom.get('coordinates', [])
        if len(coords) < 2:
            continue
        lng, lat = coords[0], coords[1]
        key = (round(lat, 4), round(lng, 4))
        if key not in point_grid:
            point_grid[key] = []
        point_grid[key].append({
            'lat': lat,
            'lng': lng,
            'properties': f.get('properties', {}),
            'id': f.get('id', '')
        })

    print("=== Step 2: Fetching lines from WFS ===")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    lines_data = json.loads(urllib.request.urlopen(req_lines, context=ctx).read().decode('utf-8'))
    lines_features = lines_data.get('features', [])
    print(f"Fetched {len(lines_features)} lines.")

    print("\n=== Step 3: Checking join specifically for Simbol '386' ===")
    matched_386 = 0
    unmatched_386 = 0
    
    for f in lines_features:
        line_props = f.get('properties', {})
        if str(line_props.get('Simbol')) != '386':
            continue
            
        geom = f.get('geometry')
        if not geom:
            print("Line 386 has no geometry!")
            continue
            
        coords = geom.get('coordinates', [])
        if not coords or len(coords) == 0:
            continue
        ring = coords[0]
        if not ring or len(ring) < 4:
            print(f"Line 386 spot {line_props.get('Numar Loc')} has ring length < 4 ({len(ring)})")
            continue
            
        lats = [c[1] for c in ring]
        lngs = [c[0] for c in ring]
        cent_lat = sum(lats) / len(lats)
        cent_lng = sum(lngs) / len(lngs)
        
        lat_bucket = round(cent_lat, 4)
        lng_bucket = round(cent_lng, 4)
        
        best_pt = None
        min_dist = 999999.0
        
        for d_lat in [-0.0001, 0, 0.0001]:
            for d_lng in [-0.0001, 0, 0.0001]:
                key = (round(lat_bucket + d_lat, 4), round(lng_bucket + d_lng, 4))
                if key in point_grid:
                    for pt in point_grid[key]:
                        dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
                        if dist < min_dist:
                            min_dist = dist
                            best_pt = pt
                            
        if best_pt and min_dist < 0.00008:
            matched_386 += 1
            pt_props = best_pt['properties']
            print(f"Line 386 spot {line_props.get('Numar Loc')} MATCHED to point. Point parcare_arondata: {pt_props.get('parcare_arondata')}, tip_loc: {pt_props.get('tip_loc')}, dist: {min_dist:.6f}")
        else:
            unmatched_386 += 1
            if best_pt:
                print(f"Line 386 spot {line_props.get('Numar Loc')} unmatched but close pt found (dist: {min_dist:.6f} >= 0.00008)")
            else:
                print(f"Line 386 spot {line_props.get('Numar Loc')} completely unmatched")

    print(f"\nSummary for Simbol '386': Matched={matched_386}, Unmatched={unmatched_386}")

if __name__ == "__main__":
    main()

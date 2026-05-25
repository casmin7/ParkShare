import urllib.request
import json
import ssl
import sys
import os
import math
import time

sys.stdout.reconfigure(encoding='utf-8')

def clean_id(val):
    if not val:
        return ""
    val = str(val)
    for prefix in ["nparking_parcari_linii.", "nparking_parcari_resedinta.", "nparking_parcari_publice."]:
        if val.startswith(prefix):
            return val[len(prefix):]
    return val

def extrude_line_towards_point(ring, point, width=2.3):
    if not ring or len(ring) < 2:
        return None
    p1 = ring[0]
    p2 = ring[-1]
    lngA, latA = p1[0], p1[1]
    lngB, latB = p2[0], p2[1]
    
    lat = (latA + latB) / 2.0
    lat_rad = math.radians(lat)
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(lat_rad)
    
    dx_m = (lngB - lngA) * scale_lng
    dy_m = (latB - latA) * scale_lat
    
    d_m = math.sqrt(dx_m**2 + dy_m**2)
    if d_m < 0.01:
        return None
        
    ux = dx_m / d_m
    uy = dy_m / d_m
    
    # Left perpendicular
    px_l = -uy
    py_l = ux
    
    # Midpoint of AB
    lngM = (lngA + lngB) / 2.0
    latM = (latA + latB) / 2.0
    
    # Vector from midpoint to target point in meters
    pm_x = (point['lng'] - lngM) * scale_lng
    pm_y = (point['lat'] - latM) * scale_lat
    
    # Dot product with left perpendicular
    dot_l = pm_x * px_l + pm_y * py_l
    
    if dot_l >= 0:
        px, py = px_l, py_l
    else:
        px, py = -px_l, -py_l
        
    perp_lng = px * (width / scale_lng)
    perp_lat = py * (width / scale_lat)
    
    return [
        [lngA, latA],
        [lngB, latB],
        [lngB + perp_lng, latB + perp_lat],
        [lngA + perp_lng, latA + perp_lat],
        [lngA, latA]
    ]

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("=== Step 1: Fetching points from GeoServer WFS ===")
    
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    print("Fetching residential spots...")
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        res_features = res_data.get('features', [])
        print(f"Fetched {len(res_features)} residential spots.")

    pub_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_publice&outputFormat=application/json&maxFeatures=20000&srsname=EPSG:4326'
    print("Fetching public spots...")
    req_pub = urllib.request.Request(pub_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_pub, context=ctx, timeout=60) as response:
        pub_data = json.loads(response.read().decode('utf-8'))
        pub_features = pub_data.get('features', [])
        print(f"Fetched {len(pub_features)} public spots.")

    print("\n=== Step 2: Indexing points spatially ===")
    point_grid = {}
    
    # We index points by unique point ID to keep track of matches
    all_points = {}
    
    for f in res_features:
        geom = f.get('geometry')
        if not geom or geom.get('type') != 'Point':
            continue
        coords = geom.get('coordinates', [])
        if len(coords) < 2:
            continue
        lng, lat = coords[0], coords[1]
        
        pt_id = f.get('id', '')
        pt_info = {
            'id': pt_id,
            'lat': lat,
            'lng': lng,
            'type': 'residential',
            'properties': f.get('properties', {})
        }
        all_points[pt_id] = pt_info
        
        key = (round(lat, 4), round(lng, 4))
        if key not in point_grid:
            point_grid[key] = []
        point_grid[key].append(pt_info)

    for f in pub_features:
        geom = f.get('geometry')
        if not geom or geom.get('type') != 'Point':
            continue
        coords = geom.get('coordinates', [])
        if len(coords) < 2:
            continue
        lng, lat = coords[0], coords[1]
        
        pt_id = f.get('id', '')
        pt_info = {
            'id': pt_id,
            'lat': lat,
            'lng': lng,
            'type': 'public',
            'properties': f.get('properties', {})
        }
        all_points[pt_id] = pt_info
        
        key = (round(lat, 4), round(lng, 4))
        if key not in point_grid:
            point_grid[key] = []
        point_grid[key].append(pt_info)

    print(f"Indexed points into {len(point_grid)} spatial cells.")

    print("\n=== Step 3: Fetching lines from GeoServer WFS ===")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx, timeout=120) as response:
        lines_data = json.loads(response.read().decode('utf-8'))
        lines_features = lines_data.get('features', [])
        print(f"Fetched {len(lines_features)} lines.")

    print("\n=== Step 4: Multi-Phase Spatial Join ===")
    clean_features = []
    
    # matched_points maps pt_id -> {'line_id': line_id, 'type': 'closed' | 'open', 'distance': dist, 'line_feat': f, 'pt_info': pt_info}
    matched_points = {}
    
    # Separate lines into closed and open
    closed_lines = []
    open_lines = []
    
    for f in lines_features:
        geom = f.get('geometry')
        if not geom or geom.get('type') != 'MultiLineString':
            continue
        coords = geom.get('coordinates', [])
        if not coords or len(coords) == 0:
            continue
        ring = coords[0]
        if not ring or len(ring) < 2:
            continue
            
        if len(ring) >= 4 and ring[0] == ring[-1]:
            closed_lines.append(f)
        else:
            open_lines.append(f)
            
    print(f"Closed lines: {len(closed_lines)}, Open lines: {len(open_lines)}")
    
    # Helper to find nearest point
    def find_nearest_point(cent_lat, cent_lng):
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
        return best_pt, min_dist

    # Phase 1: Match closed lines to points
    matched_closed_count = 0
    unmatched_closed_count = 0
    
    for f in closed_lines:
        ring = f['geometry']['coordinates'][0]
        lats = [c[1] for c in ring]
        lngs = [c[0] for c in ring]
        cent_lat = sum(lats) / len(lats)
        cent_lng = sum(lngs) / len(lngs)
        
        best_pt, min_dist = find_nearest_point(cent_lat, cent_lng)
        
        clean_props = {}
        # Max matching threshold: ~8.8 meters (0.00008 degrees)
        if best_pt and min_dist < 0.00008:
            matched_closed_count += 1
            pt_props = best_pt['properties']
            pt_id = best_pt['id']
            
            # Record match
            matched_points[pt_id] = {
                'line_id': f.get('id'),
                'type': 'closed',
                'distance': min_dist
            }
            
            if best_pt['type'] == 'residential':
                clean_props = {
                    'id': clean_id(f.get('id') or pt_id or ''),
                    'baterie': str(pt_props.get('parcare_arondata') or ''),
                    'numar': str(pt_props.get('nr_parcare') or ''),
                    'ocupat': pt_props.get('tip_loc', 1),
                    'zona': f"S4-{pt_props.get('parcare_arondata') or ''}"
                }
            else:
                clean_props = {
                    'id': clean_id(f.get('id') or pt_id or ''),
                    'baterie': str(pt_props.get('id_parcare') or ''),
                    'numar': str(pt_props.get('nr_parcare') or ''),
                    'ocupat': pt_props.get('tip_loc', 5),
                    'zona': f"S4-PUB-{pt_props.get('id_parcare') or ''}"
                }
        else:
            unmatched_closed_count += 1
            line_props = f.get('properties', {})
            clean_props = {
                'id': clean_id(f.get('id') or ''),
                'baterie': str(line_props.get('Simbol') or ''),
                'numar': str(line_props.get('Numar Loc') or ''),
                'ocupat': 6,
                'zona': f"S4-{line_props.get('Simbol') or ''}"
            }
            
        rounded_ring = [[round(c[0], 6), round(c[1], 6)] for c in ring]
        if rounded_ring[0] != rounded_ring[-1]:
            rounded_ring.append(rounded_ring[0])
            
        clean_features.append({
            "type": "Feature",
            "properties": clean_props,
            "geometry": {
                "type": "Polygon",
                "coordinates": [rounded_ring]
            }
        })
        
    print(f"Phase 1: Matched closed lines: {matched_closed_count}, Unmatched closed lines: {unmatched_closed_count}")

    # Phase 2: Match open lines to points (only if point not matched to closed line)
    matched_open_candidates = {} # maps pt_id -> best open line match info
    
    for f in open_lines:
        ring = f['geometry']['coordinates'][0]
        lats = [c[1] for c in ring]
        lngs = [c[0] for c in ring]
        cent_lat = sum(lats) / len(lats)
        cent_lng = sum(lngs) / len(lngs)
        
        best_pt, min_dist = find_nearest_point(cent_lat, cent_lng)
        
        if best_pt and min_dist < 0.00008:
            pt_id = best_pt['id']
            # Skip if already matched to a closed line
            if pt_id in matched_points and matched_points[pt_id]['type'] == 'closed':
                continue
                
            # If not matched or this is a closer match, save it
            if pt_id not in matched_open_candidates or min_dist < matched_open_candidates[pt_id]['distance']:
                matched_open_candidates[pt_id] = {
                    'line_id': f.get('id'),
                    'distance': min_dist,
                    'line_feat': f,
                    'pt_info': best_pt
                }
                
    print(f"Phase 2: Found {len(matched_open_candidates)} points matched to open lines.")

    # Phase 3: Extrude matched open lines
    matched_open_count = 0
    for pt_id, info in matched_open_candidates.items():
        f = info['line_feat']
        best_pt = info['pt_info']
        ring = f['geometry']['coordinates'][0]
        
        # Extrude line towards point
        extruded_ring = extrude_line_towards_point(ring, best_pt)
        if not extruded_ring:
            continue
            
        matched_open_count += 1
        pt_props = best_pt['properties']
        
        clean_props = {}
        if best_pt['type'] == 'residential':
            clean_props = {
                'id': clean_id(f.get('id') or pt_id or ''),
                'baterie': str(pt_props.get('parcare_arondata') or ''),
                'numar': str(pt_props.get('nr_parcare') or ''),
                'ocupat': pt_props.get('tip_loc', 1),
                'zona': f"S4-{pt_props.get('parcare_arondata') or ''}"
            }
        else:
            clean_props = {
                'id': clean_id(f.get('id') or pt_id or ''),
                'baterie': str(pt_props.get('id_parcare') or ''),
                'numar': str(pt_props.get('nr_parcare') or ''),
                'ocupat': pt_props.get('tip_loc', 5),
                'zona': f"S4-PUB-{pt_props.get('id_parcare') or ''}"
            }
            
        rounded_ring = [[round(c[0], 6), round(c[1], 6)] for c in extruded_ring]
        
        clean_features.append({
            "type": "Feature",
            "properties": clean_props,
            "geometry": {
                "type": "Polygon",
                "coordinates": [rounded_ring]
            }
        })
        
    print(f"Phase 3: Extruded and added {matched_open_count} open line polygons.")
    print(f"Total features generated: {len(clean_features)}")

    # Check the courtyard in the generated list
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045
    cy_feats = []
    for feat in clean_features:
        coords = feat['geometry']['coordinates'][0]
        lng, lat = coords[0]
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            cy_feats.append(feat)
            
    print(f"\nCourtyard Analysis (Viewport of Image 1):")
    print(f"  Total features inside: {len(cy_feats)}")
    by_bat = {}
    for feat in cy_feats:
        bat = feat['properties'].get('baterie')
        by_bat[bat] = by_bat.get(bat, 0) + 1
    print("  By battery:")
    for bat, count in by_bat.items():
        print(f"    Battery {bat}: {count}")

    # Output to test file
    out_file = "test_s4_polygons.json"
    with open(out_file, "w", encoding="utf-8") as out_f:
        json.dump({
            "type": "FeatureCollection",
            "features": clean_features
        }, out_f, separators=(',', ':'))
    print(f"\nSaved test dataset to {out_file} ({os.path.getsize(out_file)/(1024*1024):.2f} MB).")

if __name__ == '__main__':
    main()

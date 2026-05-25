import urllib.request
import json
import ssl
import sys
import os
import math

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
    
    px_l = -uy
    py_l = ux
    
    lngM = (lngA + lngB) / 2.0
    latM = (latA + latB) / 2.0
    
    pm_x = (point['lng'] - lngM) * scale_lng
    pm_y = (point['lat'] - latM) * scale_lat
    
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
    pub_features = []
    try:
        with urllib.request.urlopen(req_pub, context=ctx, timeout=60) as response:
            pub_data = json.loads(response.read().decode('utf-8'))
            pub_features = pub_data.get('features', [])
            print(f"Fetched {len(pub_features)} public spots.")
    except Exception as e:
        print("Failed to fetch public spots:", e)

    print("\n=== Step 2: Indexing points spatially ===")
    point_grid = {}
    
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
        key = (round(lat, 4), round(lng, 4))
        if key not in point_grid:
            point_grid[key] = []
        point_grid[key].append(pt_info)

    print(f"Indexed points into {len(point_grid)} spatial cells.")

    print("\n=== Step 3: Fetching lines ===")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx, timeout=120) as response:
        lines_data = json.loads(response.read().decode('utf-8'))
        lines_features = lines_data.get('features', [])
        print(f"Fetched {len(lines_features)} lines.")

    print("\n=== Step 4: Multi-Phase Bipartite Spatial Match ===")
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

    # 1. Closed Lines Bipartite matching
    potential_closed_matches = []
    for f in closed_lines:
        ring = f['geometry']['coordinates'][0]
        cent_lat, cent_lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
        
        lat_bucket = round(cent_lat, 4)
        lng_bucket = round(cent_lng, 4)
        for d_lat in [-0.0001, 0, 0.0001]:
            for d_lng in [-0.0001, 0, 0.0001]:
                key = (round(lat_bucket + d_lat, 4), round(lng_bucket + d_lng, 4))
                if key in point_grid:
                    for pt in point_grid[key]:
                        dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
                        if dist < 0.00008:
                            pt_props = pt['properties']
                            line_props = f.get('properties', {})
                            
                            pt_bat = str(pt_props.get('parcare_arondata') or pt_props.get('id_parcare') or '')
                            line_bat = str(line_props.get('Simbol') or '')
                            pt_num = str(pt_props.get('nr_parcare') or '')
                            line_num = str(line_props.get('Numar Loc') or '')
                            
                            bat_match = (pt_bat == line_bat) if (pt_bat and line_bat) else False
                            num_match = (pt_num == line_num) if (pt_num and line_num) else False
                            
                            score = (2 if (bat_match and num_match) else (1 if (bat_match or num_match) else 0))
                            
                            potential_closed_matches.append({
                                'pt_id': pt['id'],
                                'pt_info': pt,
                                'line_feat': f,
                                'dist': dist,
                                'score': score
                            })

    potential_closed_matches.sort(key=lambda x: (-x['score'], x['dist']))
    
    matched_pt_ids = set()
    matched_line_ids = set()
    closed_matches = {}
    
    for m in potential_closed_matches:
        pt_id = m['pt_id']
        line_id = m['line_feat'].get('id')
        if pt_id not in matched_pt_ids and line_id not in matched_line_ids:
            matched_pt_ids.add(pt_id)
            matched_line_ids.add(line_id)
            closed_matches[line_id] = {
                'pt_info': m['pt_info'],
                'distance': m['dist']
            }

    print(f"Phase 1 complete: Matched {len(closed_matches)} points to closed lines.")

    # Generate clean features for closed lines
    clean_features = []
    unmatched_closed_count = 0
    skipped_closed_count = 0
    
    for f in closed_lines:
        line_id = f.get('id')
        ring = f['geometry']['coordinates'][0]
        rounded_ring = [[round(c[0], 6), round(c[1], 6)] for c in ring]
        if rounded_ring[0] != rounded_ring[-1]:
            rounded_ring.append(rounded_ring[0])
            
        if line_id in closed_matches:
            pt_info = closed_matches[line_id]['pt_info']
            pt_props = pt_info['properties']
            pt_id = pt_info['id']
            
            if pt_info['type'] == 'residential':
                clean_props = {
                    'id': clean_id(line_id or pt_id or ''),
                    'baterie': str(pt_props.get('parcare_arondata') or ''),
                    'numar': str(pt_props.get('nr_parcare') or ''),
                    'ocupat': pt_props.get('tip_loc', 1),
                    'zona': f"S4-{pt_props.get('parcare_arondata') or ''}"
                }
            else:
                clean_props = {
                    'id': clean_id(line_id or pt_id or ''),
                    'baterie': str(pt_props.get('id_parcare') or ''),
                    'numar': str(pt_props.get('nr_parcare') or ''),
                    'ocupat': pt_props.get('tip_loc', 5),
                    'zona': f"S4-PUB-{pt_props.get('id_parcare') or ''}"
                }
        else:
            line_props = f.get('properties', {})
            line_bat = str(line_props.get('Simbol') or '')
            # Filter out unmatched background drawings that don't even have a battery Symbol
            if not line_bat or line_bat.strip() == "":
                skipped_closed_count += 1
                continue
                
            unmatched_closed_count += 1
            clean_props = {
                'id': clean_id(line_id or ''),
                'baterie': line_bat,
                'numar': str(line_props.get('Numar Loc') or ''),
                'ocupat': 6, # Loc nenominal
                'zona': f"S4-{line_bat}"
            }
            
        clean_features.append({
            "type": "Feature",
            "properties": clean_props,
            "geometry": {
                "type": "Polygon",
                "coordinates": [rounded_ring]
            }
        })
        
    print(f"Closed lines features added: {len(clean_features)} (unmatched: {unmatched_closed_count}, skipped: {skipped_closed_count})")

    # 2. Open Lines Bipartite matching against remaining points
    potential_open_matches = []
    for f in open_lines:
        ring = f['geometry']['coordinates'][0]
        cent_lat, cent_lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
        
        lat_bucket = round(cent_lat, 4)
        lng_bucket = round(cent_lng, 4)
        for d_lat in [-0.0001, 0, 0.0001]:
            for d_lng in [-0.0001, 0, 0.0001]:
                key = (round(lat_bucket + d_lat, 4), round(lng_bucket + d_lng, 4))
                if key in point_grid:
                    for pt in point_grid[key]:
                        if pt['id'] in matched_pt_ids:
                            continue
                        dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
                        if dist < 0.00008:
                            pt_props = pt['properties']
                            line_props = f.get('properties', {})
                            
                            pt_bat = str(pt_props.get('parcare_arondata') or pt_props.get('id_parcare') or '')
                            line_bat = str(line_props.get('Simbol') or '')
                            pt_num = str(pt_props.get('nr_parcare') or '')
                            line_num = str(line_props.get('Numar Loc') or '')
                            
                            bat_match = (pt_bat == line_bat) if (pt_bat and line_bat) else False
                            num_match = (pt_num == line_num) if (pt_num and line_num) else False
                            
                            score = (2 if (bat_match and num_match) else (1 if (bat_match or num_match) else 0))
                            
                            potential_open_matches.append({
                                'pt_id': pt['id'],
                                'pt_info': pt,
                                'line_feat': f,
                                'dist': dist,
                                'score': score
                            })

    potential_open_matches.sort(key=lambda x: (-x['score'], x['dist']))
    
    matched_open_pt_ids = set()
    matched_open_line_ids = set()
    open_matches = {}
    
    for m in potential_open_matches:
        pt_id = m['pt_id']
        line_id = m['line_feat'].get('id')
        if pt_id not in matched_open_pt_ids and line_id not in matched_open_line_ids:
            matched_open_pt_ids.add(pt_id)
            matched_open_line_ids.add(line_id)
            open_matches[line_id] = {
                'pt_info': m['pt_info'],
                'distance': m['dist']
            }

    print(f"Phase 2 complete: Matched {len(open_matches)} open lines to remaining points.")

    # Extrude and add open lines
    matched_open_count = 0
    for f in open_lines:
        line_id = f.get('id')
        if line_id in open_matches:
            ring = f['geometry']['coordinates'][0]
            pt_info = open_matches[line_id]['pt_info']
            pt_id = pt_info['id']
            pt_props = pt_info['properties']
            
            extruded_ring = extrude_line_towards_point(ring, pt_info)
            if not extruded_ring:
                continue
                
            matched_open_count += 1
            if pt_info['type'] == 'residential':
                clean_props = {
                    'id': clean_id(line_id or pt_id or ''),
                    'baterie': str(pt_props.get('parcare_arondata') or ''),
                    'numar': str(pt_props.get('nr_parcare') or ''),
                    'ocupat': pt_props.get('tip_loc', 1),
                    'zona': f"S4-{pt_props.get('parcare_arondata') or ''}"
                }
            else:
                clean_props = {
                    'id': clean_id(line_id or pt_id or ''),
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
            
    print(f"Phase 3 complete: Extruded and added {matched_open_count} open line polygons.")
    print(f"Total features generated: {len(clean_features)}")

    out_file = "test_s4_polygons.json"
    print(f"Saving to {out_file}...")
    out_json = {
        "type": "FeatureCollection",
        "features": clean_features
    }
    with open(out_file, "w", encoding="utf-8") as out_f:
        json.dump(out_json, out_f, separators=(',', ':'))
        
    file_size = os.path.getsize(out_file) / (1024 * 1024)
    print(f"Finished! Polygon file size: {file_size:.2f} MB")

if __name__ == '__main__':
    main()

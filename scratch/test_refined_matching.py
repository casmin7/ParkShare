import urllib.request
import json
import ssl
import math

def clean_id(val):
    if not val:
        return ""
    val = str(val)
    for prefix in ["nparking_parcari_linii.", "nparking_parcari_resedinta.", "nparking_parcari_publice."]:
        if val.startswith(prefix):
            return val[len(prefix):]
    return val

def get_centroid(coords):
    ring = coords[0]
    lats = [c[1] for c in ring]
    lngs = [c[0] for c in ring]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def get_approx_angle(ring):
    p1 = ring[0]
    p2 = ring[1]
    lngA, latA = p1[0], p1[1]
    lngB, latB = p2[0], p2[1]
    
    lat = (latA + latB) / 2.0
    lat_rad = math.radians(lat)
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(lat_rad)
    
    dx_m = (lngB - lngA) * scale_lng
    dy_m = (latB - latA) * scale_lat
    return math.degrees(math.atan2(dy_m, dx_m))

def polygon_area(ring, lat):
    # Shoelace formula in meters
    lat_rad = math.radians(lat)
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(lat_rad)
    n = len(ring)
    area = 0.0
    for i in range(n - 1):
        x1 = ring[i][0] * scale_lng
        y1 = ring[i][1] * scale_lat
        x2 = ring[i+1][0] * scale_lng
        y2 = ring[i+1][1] * scale_lat
        area += (x1 * y2 - x2 * y1)
    return abs(area) / 2.0

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    # 1. Fetch points
    print("Fetching points...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        
    points_in_cy = []
    active_batteries = set()
    for f in res_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            lng, lat = geom['coordinates']
            pt_props = f.get('properties', {})
            bat = str(pt_props.get('parcare_arondata') or '')
            if bat:
                active_batteries.add(bat)
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                points_in_cy.append({
                    'id': f.get('id', ''),
                    'lat': lat,
                    'lng': lng,
                    'type': 'residential',
                    'properties': pt_props
                })

    print(f"Points in courtyard: {len(points_in_cy)}")
    print(f"Active batteries in sector: {len(active_batteries)}")

    # 2. Fetch lines
    print("Fetching lines...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    closed_lines = []
    open_lines = []
    for f in lines_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'MultiLineString':
            ring = geom['coordinates'][0]
            lat, lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                if len(ring) >= 4 and ring[0] == ring[-1]:
                    closed_lines.append(f)
                else:
                    open_lines.append(f)

    print(f"Closed lines in courtyard: {len(closed_lines)}, Open lines in courtyard: {len(open_lines)}")

    # Bipartite matching for closed lines
    potential_closed_matches = []
    for f in closed_lines:
        ring = f['geometry']['coordinates'][0]
        cent_lat, cent_lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
        
        # Calculate area for generic loops (empty properties)
        line_props = f.get('properties', {})
        line_bat = str(line_props.get('Simbol') or '')
        line_num = str(line_props.get('Numar Loc') or '')
        
        is_generic = (not line_bat or line_bat.strip() == "") and (not line_num or line_num.strip() == "")
        if is_generic:
            area = polygon_area(ring, cent_lat)
            # Skip closed loops that are too large (driveways, courtyard outlines)
            if area > 24.0 or area < 6.0:
                continue
                
        lat_bucket = round(cent_lat, 4)
        lng_bucket = round(cent_lng, 4)
        for d_lat in [-0.0001, 0, 0.0001]:
            for d_lng in [-0.0001, 0, 0.0001]:
                key = (round(lat_bucket + d_lat, 4), round(lng_bucket + d_lng, 4))
                # Note: points database in this script is points_in_cy, let's just search points_in_cy directly for simplicity
                for pt in points_in_cy:
                    # check if point is in cell key bucket
                    if round(pt['lat'], 4) == key[0] and round(pt['lng'], 4) == key[1]:
                        dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
                        if dist < 0.00008:
                            pt_props = pt['properties']
                            pt_bat = str(pt_props.get('parcare_arondata') or '')
                            
                            # Filter 1: Strict battery mismatch check
                            # If both have explicit symbol and they don't match, they belong to different layouts!
                            if pt_bat and line_bat and pt_bat != line_bat:
                                continue
                                
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

    # Sort closed potential matches
    potential_closed_matches.sort(key=lambda x: (-x['score'], x['dist']))
    
    matched_pt_ids = set()
    matched_line_ids = set()
    closed_matches = {}
    
    for m in potential_closed_matches:
        pt_id = m['pt_id']
        line_feat = m['line_feat']
        line_id = line_feat.get('id')
        if pt_id not in matched_pt_ids and line_id not in matched_line_ids:
            matched_pt_ids.add(pt_id)
            matched_line_ids.add(line_id)
            closed_matches[line_id] = {
                'pt_info': m['pt_info'],
                'distance': m['dist']
            }

    print(f"Matched {len(closed_matches)} points to closed lines.")

    # Let's inspect courtyard features that would be added
    added_features = []
    for f in closed_lines:
        line_id = f.get('id')
        ring = f['geometry']['coordinates'][0]
        cent_lat, cent_lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
        
        if line_id in closed_matches:
            pt_info = closed_matches[line_id]['pt_info']
            pt_props = pt_info['properties']
            angle = get_approx_angle(ring)
            added_features.append({
                'id': clean_id(line_id),
                'baterie': str(pt_props.get('parcare_arondata') or ''),
                'numar': str(pt_props.get('nr_parcare') or ''),
                'angle': angle,
                'centroid': [cent_lat, cent_lng]
            })
        else:
            line_props = f.get('properties', {})
            line_bat = str(line_props.get('Simbol') or '')
            
            # Obsolete battery filter
            if not line_bat or line_bat.strip() == "" or line_bat not in active_batteries:
                continue
                
            angle = get_approx_angle(ring)
            added_features.append({
                'id': clean_id(line_id),
                'baterie': line_bat,
                'numar': str(line_props.get('Numar Loc') or ''),
                'angle': angle,
                'centroid': [cent_lat, cent_lng]
            })

    # Sort added features by longitude
    added_features.sort(key=lambda x: x['centroid'][1])
    print("\n--- Refined Added Features in Courtyard ---")
    for af in added_features:
        # Check if they are tilted
        aligned = False
        for base in [-32.0, 148.0, -122.0, 58.0]:
            if abs((af['angle'] - base) % 180) < 5.0 or abs((base - af['angle']) % 180) < 5.0:
                aligned = True
                break
        tag = "ALIGNED" if aligned else "TILTED"
        print(f"ID={af['id']} Bat={af['baterie']} Num={af['numar']} Centroid=[{af['centroid'][0]:.6f}, {af['centroid'][1]:.6f}] Angle={af['angle']:.1f}° {tag}")

if __name__ == '__main__':
    main()

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

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    # 1. Fetch residential points
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        
    points_in_cy = []
    for f in res_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            lng, lat = geom['coordinates']
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                pt_id = f.get('id', '')
                pt_props = f.get('properties', {})
                points_in_cy.append({
                    'id': pt_id,
                    'lat': lat,
                    'lng': lng,
                    'type': 'residential',
                    'properties': pt_props
                })

    print(f"Points in courtyard: {len(points_in_cy)}")

    # 2. Fetch lines
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

    print(f"Closed lines: {len(closed_lines)}, Open lines: {len(open_lines)}")

    # --- Phase 1: Bipartite Matching for Closed Lines ---
    # We want to match points to closed lines.
    # A candidate match is valid if distance < 0.00008.
    potential_matches = []
    for f in closed_lines:
        ring = f['geometry']['coordinates'][0]
        cent_lat, cent_lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
        
        for pt in points_in_cy:
            dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
            if dist < 0.00008:
                # Check property match
                pt_props = pt['properties']
                line_props = f.get('properties', {})
                
                # Check if Simbol and Numar Loc match
                pt_bat = str(pt_props.get('parcare_arondata') or '')
                line_bat = str(line_props.get('Simbol') or '')
                pt_num = str(pt_props.get('nr_parcare') or '')
                line_num = str(line_props.get('Numar Loc') or '')
                
                bat_match = (pt_bat == line_bat) if (pt_bat and line_bat) else False
                num_match = (pt_num == line_num) if (pt_num and line_num) else False
                
                # Score: 2 if both match, 1 if one matches, 0 if neither matches
                match_score = (2 if (bat_match and num_match) else (1 if (bat_match or num_match) else 0))
                
                potential_matches.append({
                    'pt': pt,
                    'line': f,
                    'dist': dist,
                    'score': match_score
                })

    # Sort potential matches:
    # 1. Higher score first
    # 2. Closer distance first
    potential_matches.sort(key=lambda x: (-x['score'], x['dist']))

    matched_points = {}
    matched_lines = set()

    for m in potential_matches:
        pt = m['pt']
        line = m['line']
        pt_id = pt['id']
        line_id = line['id']
        
        if pt_id not in matched_points and line_id not in matched_lines:
            matched_points[pt_id] = {
                'line_id': line_id,
                'type': 'closed',
                'distance': m['dist'],
                'line_feat': line
            }
            matched_lines.add(line_id)

    print(f"Matched {len(matched_points)} points to closed lines.")

    # Check if duplicates are resolved:
    # Let's inspect the point for Battery 272 Num 6:
    # Look for any point with properties.parcare_arondata == 272 and properties.nr_parcare == 6
    target_pt = None
    for pt in points_in_cy:
        p = pt['properties']
        if str(p.get('parcare_arondata')) == '272' and str(p.get('nr_parcare')) == '6':
            target_pt = pt
            break
            
    if target_pt:
        pt_id = target_pt['id']
        if pt_id in matched_points:
            match_info = matched_points[pt_id]
            line_feat = match_info['line_feat']
            print(f"\nTarget Point {pt_id} (Bat 272 Num 6) matched to Closed Line ID: {match_info['line_id']}")
            print(f"  Distance: {match_info['distance']:.6f} degrees")
            print(f"  Line Properties: {line_feat.get('properties')}")
        else:
            print("\nTarget Point (Bat 272 Num 6) NOT matched!")

    # Check the other line nparking_parcari_linii.64746
    print(f"\nIs nparking_parcari_linii.64746 in matched lines? {clean_id('nparking_parcari_linii.64746') in [clean_id(lid) for lid in matched_lines]}")
    print(f"Is nparking_parcari_linii.2818 in matched lines? {clean_id('nparking_parcari_linii.2818') in [clean_id(lid) for lid in matched_lines]}")

if __name__ == '__main__':
    main()

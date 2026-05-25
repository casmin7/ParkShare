import json
import math

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

def main():
    s4_file = 's4_polygons.json'
    with open(s4_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    min_lat, max_lat = 44.3853, 44.3861
    min_lng, max_lng = 26.1026, 26.1040

    features = data.get('features', [])
    in_cy = []
    
    for f in features:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            in_cy.append(f)

    print(f"Total features in courtyard: {len(in_cy)}")
    
    # We want to check if they are from closed lines or open lines.
    # In fetch_s4_real_data.py, extruded lines have ID starting with the line's WFS ID,
    # but wait, closed lines also have IDs starting with their WFS ID.
    # How can we distinguish?
    # Closed lines are matched to points or unmatched. If matched, their properties come from points.
    # Open lines are only added if matched in Phase 3.
    # Wait, we can fetch the original WFS lines to see if their ID in WFS is a closed loop or open segment!
    
    import urllib.request
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    print("Fetching raw lines from WFS for comparison...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))
        
    raw_lines = {clean_id(f['id']): f for f in lines_data.get('features', [])}
    
    # Sort in_cy by Lng
    in_cy.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[1])
    
    print("\nDetailed list of courtyard features:")
    for f in in_cy:
        p = f['properties']
        fid = p.get('id')
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        # Check source in WFS
        raw_feat = raw_lines.get(fid)
        source_type = "UNKNOWN"
        raw_coords = []
        is_closed_loop = False
        if raw_feat:
            raw_geom = raw_feat.get('geometry', {})
            if raw_geom:
                raw_coords = raw_geom.get('coordinates', [[]])[0]
                is_closed_loop = len(raw_coords) >= 4 and raw_coords[0] == raw_coords[-1]
                source_type = "CLOSED_LOOP" if is_closed_loop else "OPEN_LINE"
                
        print(f"ID={fid} Bat={p.get('baterie')} Num={p.get('numar')} Ocupat={p.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}° Source={source_type} RawLen={len(raw_coords)}")

def clean_id(val):
    if not val:
        return ""
    val = str(val)
    for prefix in ["nparking_parcari_linii.", "nparking_parcari_resedinta.", "nparking_parcari_publice."]:
        if val.startswith(prefix):
            return val[len(prefix):]
    return val

if __name__ == '__main__':
    main()

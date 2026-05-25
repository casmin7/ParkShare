"""
Comprehensive diagnostic: understand WHY overlaps happen.
1. How many lines have properties vs empty?
2. How many points exist per battery?
3. How many lines match by (Simbol, Numar Loc) to a point's (battery, number)?
4. How many closed vs open lines exist?
5. Detect centroid-level overlaps in the current s4_polygons.json
"""
import urllib.request
import json
import ssl
import math

def distance_meters(lat1, lng1, lat2, lng2):
    lat_mid = (lat1 + lat2) / 2.0
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(math.radians(lat_mid))
    dx = (lng2 - lng1) * scale_lng
    dy = (lat2 - lat1) * scale_lat
    return math.sqrt(dx**2 + dy**2)

def get_centroid(coords):
    ring = coords[0]
    pts = ring[:-1] if (len(ring) > 1 and ring[0] == ring[-1]) else ring
    lats = [c[1] for c in pts]
    lngs = [c[0] for c in pts]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # --- 1. Fetch lines ---
    print("=== Fetching lines ===")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=120) as response:
        lines_data = json.loads(response.read().decode('utf-8'))
    lines_features = lines_data.get('features', [])
    print(f"Total lines: {len(lines_features)}")

    # Categorize lines
    lines_with_props = 0
    lines_empty_props = 0
    closed_lines = 0
    open_lines = 0
    lines_by_simbol = {}

    for f in lines_features:
        props = f.get('properties', {})
        simbol = str(props.get('Simbol') or '').strip()
        numar = str(props.get('Numar Loc') or '').strip()

        if simbol or numar:
            lines_with_props += 1
        else:
            lines_empty_props += 1

        if simbol:
            if simbol not in lines_by_simbol:
                lines_by_simbol[simbol] = []
            lines_by_simbol[simbol].append(f)

        geom = f.get('geometry')
        if geom and geom.get('type') == 'MultiLineString':
            coords = geom.get('coordinates', [])
            if coords and len(coords[0]) >= 4 and coords[0][0] == coords[0][-1]:
                closed_lines += 1
            else:
                open_lines += 1

    print(f"Lines WITH properties (Simbol or Numar Loc): {lines_with_props}")
    print(f"Lines with EMPTY properties: {lines_empty_props}")
    print(f"Closed lines (polygons): {closed_lines}")
    print(f"Open lines (dividers): {open_lines}")
    print(f"Unique Simbol values: {len(lines_by_simbol)}")

    # --- 2. Fetch points ---
    print("\n=== Fetching residential points ===")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req2 = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2, context=ctx, timeout=60) as response:
        res_data = json.loads(response.read().decode('utf-8'))
    res_features = res_data.get('features', [])
    print(f"Total residential points: {len(res_features)}")

    # Build point lookup by (battery, number)
    point_lookup = {}  # (battery, number) -> point feature
    points_by_battery = {}
    for f in res_features:
        props = f.get('properties', {})
        bat = str(props.get('parcare_arondata') or '').strip()
        num = str(props.get('nr_parcare') or '').strip()
        if bat:
            if bat not in points_by_battery:
                points_by_battery[bat] = []
            points_by_battery[bat].append(f)
        if bat and num:
            key = (bat, num)
            if key in point_lookup:
                pass  # duplicate point - shouldn't happen
            point_lookup[key] = f

    print(f"Unique batteries in points: {len(points_by_battery)}")
    print(f"Unique (battery, number) pairs: {len(point_lookup)}")

    # --- 3. Try to match lines to points by (Simbol, Numar Loc) == (battery, number) ---
    print("\n=== Matching lines to points by battery+number ===")
    matched_lines = 0
    unmatched_lines_with_props = 0

    for f in lines_features:
        props = f.get('properties', {})
        simbol = str(props.get('Simbol') or '').strip()
        numar = str(props.get('Numar Loc') or '').strip()
        if simbol and numar:
            key = (simbol, numar)
            if key in point_lookup:
                matched_lines += 1
            else:
                unmatched_lines_with_props += 1

    print(f"Lines matched by (Simbol, Numar Loc) to a point: {matched_lines}")
    print(f"Lines with props but NO matching point: {unmatched_lines_with_props}")
    print(f"Lines with empty props (need spatial match): {lines_empty_props}")

    # --- 4. Check for duplicate (Simbol, Numar Loc) in lines ---
    print("\n=== Checking for duplicate lines (same Simbol + Numar Loc) ===")
    line_key_count = {}
    for f in lines_features:
        props = f.get('properties', {})
        simbol = str(props.get('Simbol') or '').strip()
        numar = str(props.get('Numar Loc') or '').strip()
        if simbol and numar:
            key = (simbol, numar)
            line_key_count[key] = line_key_count.get(key, 0) + 1

    duplicates = {k: v for k, v in line_key_count.items() if v > 1}
    print(f"Unique (Simbol, Numar Loc) pairs: {len(line_key_count)}")
    print(f"Duplicate pairs (same battery+number, multiple lines): {len(duplicates)}")
    if duplicates:
        sample = list(duplicates.items())[:10]
        for k, v in sample:
            print(f"  Battery {k[0]} Spot {k[1]}: {v} lines")

    # --- 5. Analyze current s4_polygons.json for centroid overlaps ---
    print("\n=== Analyzing current s4_polygons.json for overlaps ===")
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        poly_data = json.load(f)

    polys = poly_data.get('features', [])
    print(f"Total polygons in s4_polygons.json: {len(polys)}")

    # Compute centroids
    centroids = []
    for feat in polys:
        coords = feat['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        p = feat['properties']
        centroids.append({
            'lat': lat, 'lng': lng,
            'bat': p.get('baterie', ''),
            'num': p.get('numar', ''),
            'id': p.get('id', ''),
            'ocupat': p.get('ocupat', '')
        })

    # Find pairs within 2 meters of each other
    overlap_count = 0
    overlap_pairs = []
    for i in range(len(centroids)):
        for j in range(i+1, len(centroids)):
            d = distance_meters(centroids[i]['lat'], centroids[i]['lng'],
                              centroids[j]['lat'], centroids[j]['lng'])
            if d < 2.0:
                overlap_count += 1
                if len(overlap_pairs) < 20:
                    overlap_pairs.append((centroids[i], centroids[j], d))

    print(f"Polygon pairs with centroids < 2m apart: {overlap_count}")
    for a, b, d in overlap_pairs:
        print(f"  [{a['bat']}/{a['num']} (ID {a['id']})] vs [{b['bat']}/{b['num']} (ID {b['id']})] dist={d:.2f}m")

    # Count polygons per (battery, number)
    poly_key_count = {}
    for c in centroids:
        key = (c['bat'], c['num'])
        poly_key_count[key] = poly_key_count.get(key, 0) + 1

    dup_polys = {k: v for k, v in poly_key_count.items() if v > 1}
    print(f"\nDuplicate polygon entries (same battery+number): {len(dup_polys)}")
    for k, v in list(dup_polys.items())[:15]:
        print(f"  Battery {k[0]} Spot {k[1]}: {v} polygons")

    # --- 6. Summary ---
    total_points = len(res_features)
    print(f"\n=== SUMMARY ===")
    print(f"Total official points (spots): {total_points}")
    print(f"Total generated polygons: {len(polys)}")
    print(f"Difference (extra polygons): {len(polys) - total_points}")
    print(f"Close-proximity overlaps (< 2m): {overlap_count}")

if __name__ == '__main__':
    main()

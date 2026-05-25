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

    # Let's inspect features on the outer boundary of the courtyard
    # BBox: Lat [44.3850, 44.3865], Lng [26.1020, 26.1045]
    min_lat, max_lat = 44.3848, 44.3866
    min_lng, max_lng = 26.1018, 26.1047

    features = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features.append(f)

    print(f"Total features: {len(features)}")
    
    # Print outer border groups
    # 1. Top outer row (Lat > 44.3861)
    print("\n--- Top Outer Row ---")
    top_row = [f for f in features if get_centroid(f['geometry']['coordinates'])[0] > 44.3861]
    top_row.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[1])
    for f in top_row:
        p = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

    # 2. Bottom outer row (Lat < 44.3852)
    print("\n--- Bottom Outer Row ---")
    bot_row = [f for f in features if get_centroid(f['geometry']['coordinates'])[0] < 44.3852]
    bot_row.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[1])
    for f in bot_row:
        p = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

    # 3. Left outer col (Lng < 26.1023)
    print("\n--- Left Outer Col ---")
    left_col = [f for f in features if get_centroid(f['geometry']['coordinates'])[1] < 26.1023]
    left_col.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[0], reverse=True)
    for f in left_col:
        p = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

    # 4. Right outer col (Lng > 26.1042)
    print("\n--- Right Outer Col ---")
    right_col = [f for f in features if get_centroid(f['geometry']['coordinates'])[1] > 26.1042]
    right_col.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[0], reverse=True)
    for f in right_col:
        p = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

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
    test_file = 'test_s4_polygons.json'
    with open(test_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = data.get('features', [])
    b272 = [feat for feat in features if feat['properties'].get('baterie') == '272']
    
    print(f"Battery 272 features count in test file: {len(b272)}")
    
    # Sort by number as integer
    b272.sort(key=lambda x: int(x['properties'].get('numar', 0)) if x['properties'].get('numar', '').isdigit() else 999)
    
    for feat in b272:
        p = feat['properties']
        coords = feat['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

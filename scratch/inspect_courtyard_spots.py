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

    # Courtyard bbox
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    features = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features.append(f)

    print(f"Total features in courtyard bbox: {len(features)}")
    
    # Group by battery
    by_bat = {}
    for f in features:
        bat = f['properties'].get('baterie', 'None')
        by_bat[bat] = by_bat.get(bat, 0) + 1
    
    print("Features by battery:")
    for bat, count in by_bat.items():
        print(f"  Battery {bat}: {count}")

    # Find tilted features: those whose angles are not close to 0, 90, 180, -90, etc.
    # Actually, let's print all features in this courtyard with their angles and battery
    print("\nListing all features in courtyard sorted by Battery, Numar:")
    
    def sort_key(f):
        bat = f['properties'].get('baterie', '')
        num = f['properties'].get('numar', '')
        try:
            num_val = int(num)
        except:
            num_val = 999
        return (bat, num_val)
        
    features.sort(key=sort_key)
    
    for f in features:
        props = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        # Check alignment (horizontal or vertical)
        # Perfect horizontal: angle around 0, 180, -180
        # Perfect vertical: angle around 90, -90
        is_horiz = abs(angle) < 5 or abs(abs(angle) - 180) < 5
        is_vert = abs(abs(angle) - 90) < 5
        align_str = "H" if is_horiz else ("V" if is_vert else f"TILTED ({angle:.1f}°)")
        
        print(f"ID={props.get('id')} Bat={props.get('baterie')} Num={props.get('numar')} Centroid=[{lat:.6f}, {lng:.6f}] Shape={align_str}")

if __name__ == '__main__':
    main()

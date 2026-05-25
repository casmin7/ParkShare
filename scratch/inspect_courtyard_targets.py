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

    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    target_bats = {'270', '272', '3002', '237', '4173'}

    features = []
    for f in data.get('features', []):
        props = f['properties']
        bat = str(props.get('baterie', ''))
        if bat in target_bats:
            coords = f['geometry']['coordinates']
            lat, lng = get_centroid(coords)
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                features.append(f)

    print(f"Total target features in courtyard: {len(features)}")
    
    # Sort by battery and number
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
        print(f"Bat={props.get('baterie')} Num={props.get('numar')} ID={props.get('id')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}° Ocupat={props.get('ocupat')}")

if __name__ == '__main__':
    main()

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

    features = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features.append(f)

    print(f"Total features: {len(features)}")
    
    # Check alignment relative to -32.0 degrees
    base_angles = [-32.0, 58.0, 148.0, -122.0]
    
    misaligned = []
    for f in features:
        props = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        # find min difference modulo 180
        min_diff = 180.0
        for base in base_angles:
            diff = abs((angle - base) % 180)
            if diff > 90:
                diff = 180 - diff
            if diff < min_diff:
                min_diff = diff
                
        if min_diff > 5.0:
            misaligned.append((f, angle, min_diff))
            
    print(f"Misaligned features (diff > 5° from grid): {len(misaligned)}")
    for f, angle, diff in misaligned:
        props = f['properties']
        lat, lng = get_centroid(f['geometry']['coordinates'])
        print(f"ID={props.get('id')} Bat={props.get('baterie')} Num={props.get('numar')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}° Diff={diff:.1f}°")

if __name__ == '__main__':
    main()

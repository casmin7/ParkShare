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
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Courtyard BBox
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045
    grid_angle = -122.0

    features = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features.append(f)

    print(f"Total features in courtyard: {len(features)}")
    
    misaligned = []
    for f in features:
        p = f['properties']
        coords = f['geometry']['coordinates']
        angle = get_approx_angle(coords[0])
        
        # Calculate diff to grid
        best_snap = angle
        min_diff = 180.0
        for k in range(-4, 5):
            snap = grid_angle + k * 90.0
            diff = abs(angle - snap)
            if diff < min_diff:
                min_diff = diff
                best_snap = snap
        
        diff_to_grid = best_snap - angle
        # Normalize diff to [-180, 180]
        diff_to_grid = (diff_to_grid + 180) % 360 - 180
        
        lat, lng = get_centroid(coords)
        
        if abs(diff_to_grid) > 5.0:
            misaligned.append({
                'id': p.get('id'),
                'numar': p.get('numar'),
                'baterie': p.get('baterie'),
                'centroid': [lat, lng],
                'angle': angle,
                'diff': diff_to_grid
            })

    print(f"Total misaligned features (>5°): {len(misaligned)}")
    misaligned.sort(key=lambda x: x['centroid'][1]) # Sort by longitude
    for m in misaligned:
        print(f"ID={m['id']} Num={m['numar']} Bat={m['baterie']} Centroid=[{m['centroid'][0]:.6f}, {m['centroid'][1]:.6f}] Angle={m['angle']:.1f}° Diff={m['diff']:.1f}°")

if __name__ == '__main__':
    main()

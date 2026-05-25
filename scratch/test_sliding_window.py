import json
import math

def get_centroid(coords):
    ring = coords[0]
    pts = ring[:-1] if (len(ring) > 1 and ring[0] == ring[-1]) else ring
    lats = [c[1] for c in pts]
    lngs = [c[0] for c in pts]
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

def distance_meters(lat1, lng1, lat2, lng2):
    lat_mid = (lat1 + lat2) / 2.0
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(math.radians(lat_mid))
    dx = (lng2 - lng1) * scale_lng
    dy = (lat2 - lat1) * scale_lat
    return math.sqrt(dx**2 + dy**2)

def main():
    # Read raw-ish s4_polygons.json or check what happens if we apply it to s4_polygons.json
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Let's inspect features inside the courtyard bbox
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045
    grid_angle = -122.0

    features = data.get('features', [])
    courtyard_feats = []
    for f in features:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            courtyard_feats.append(f)

    print(f"Features in courtyard: {len(courtyard_feats)}")

    # We will simulate the sliding window algorithm for each feature in the courtyard
    print("\n--- Sliding Window Simulation for Courtyard Features ---")
    
    # Store centroids and angles of all features in courtyard to avoid recomputing
    feat_data = []
    for f in courtyard_feats:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        feat_data.append({
            'feat': f,
            'id': f['properties'].get('id'),
            'numar': f['properties'].get('numar'),
            'baterie': f['properties'].get('baterie'),
            'lat': lat,
            'lng': lng,
            'angle': angle
        })

    # For each feature, find its local snap angle
    aligned_count = 0
    for fd in feat_data:
        # 1. Find neighbors of same battery within 30 meters
        same_bat_neighbors = []
        for other in feat_data:
            if other['baterie'] == fd['baterie']:
                dist = distance_meters(fd['lat'], fd['lng'], other['lat'], other['lng'])
                if dist <= 30.0:
                    same_bat_neighbors.append(other)
        
        # Calculate snap base
        if len(same_bat_neighbors) >= 3:
            # Median of same-battery neighbors
            angles_mod = []
            for n in same_bat_neighbors:
                angle_mod = ((n['angle'] + 45) % 90) - 45
                angles_mod.append(angle_mod)
            angles_mod.sort()
            base = angles_mod[len(angles_mod)//2]
            source_type = "same_bat"
        else:
            # Fallback 1: Neighbors of ANY battery within 30 meters
            any_bat_neighbors = []
            for other in feat_data:
                dist = distance_meters(fd['lat'], fd['lng'], other['lat'], other['lng'])
                if dist <= 30.0:
                    any_bat_neighbors.append(other)
            
            if len(any_bat_neighbors) >= 3:
                angles_mod = []
                for n in any_bat_neighbors:
                    angle_mod = ((n['angle'] + 45) % 90) - 45
                    angles_mod.append(angle_mod)
                angles_mod.sort()
                base = angles_mod[len(angles_mod)//2]
                source_type = "any_bat"
            else:
                # Fallback 2: Use own angle
                base = ((fd['angle'] + 45) % 90) - 45
                source_type = "own"
        
        # Snap the angle to base + k * 90
        best_snap = fd['angle']
        min_diff = 180.0
        for k in range(-4, 5):
            snap = base + k * 90.0
            diff = abs(fd['angle'] - snap)
            if diff < min_diff:
                min_diff = diff
                best_snap = snap
        
        diff_to_snap = best_snap - fd['angle']
        diff_to_snap = (diff_to_snap + 180) % 360 - 180
        
        # Calculate deviation from the courtyard grid_angle (-122.0)
        grid_snap = best_snap
        min_grid_diff = 180.0
        for k in range(-4, 5):
            snap = grid_angle + k * 90.0
            diff = abs(best_snap - snap)
            if diff < min_grid_diff:
                min_grid_diff = diff
                grid_snap = snap
        
        final_grid_diff = (grid_snap - best_snap + 180) % 360 - 180
        
        if abs(diff_to_snap) > 0.1 or abs(final_grid_diff) > 0.1:
            print(f"ID={fd['id']} Num={fd['numar']} Bat={fd['baterie']} RawAngle={fd['angle']:.1f}° Snap={best_snap:.1f}° Diff={diff_to_snap:.1f}° Source={source_type} GridDiff={final_grid_diff:.1f}°")
            aligned_count += 1
            
    print(f"Total features requiring rotation adjustments: {aligned_count}")

if __name__ == '__main__':
    main()

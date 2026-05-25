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
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Courtyard BBox
    cy_min_lat, cy_max_lat = 44.3850, 44.3865
    cy_min_lng, cy_max_lng = 26.1020, 26.1042
    courtyard_grid_base = -32.0

    features = data.get('features', [])
    all_feat_data = []
    for f in features:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        all_feat_data.append({
            'id': f['properties'].get('id'),
            'numar': f['properties'].get('numar'),
            'baterie': f['properties'].get('baterie'),
            'lat': lat,
            'lng': lng,
            'angle': angle,
            'feat': f
        })

    print(f"Total features: {len(all_feat_data)}")
    
    # Run the hybrid rotation algorithm
    rotated_count = 0
    misaligned_remaining = 0
    
    # We will check features inside the broader courtyard area (up to Lng 26.1045) to see if they align perfectly.
    check_min_lat, check_max_lat = 44.3850, 44.3865
    check_min_lng, check_max_lng = 26.1020, 26.1045
    grid_angle = -122.0

    for fd in all_feat_data:
        lat, lng = fd['lat'], fd['lng']
        
        # Check if inside courtyard BBox
        if cy_min_lat <= lat <= cy_max_lat and cy_min_lng <= lng <= cy_min_lng + (cy_max_lng - cy_min_lng):
            # Force courtyard grid base
            base = courtyard_grid_base
            source_type = "courtyard_bbox"
        else:
            # 1. Look at same battery within 40 meters
            same_bat_neighbors = []
            for other in all_feat_data:
                if other['baterie'] == fd['baterie']:
                    dist = distance_meters(lat, lng, other['lat'], other['lng'])
                    if dist <= 40.0:
                        same_bat_neighbors.append(other)
            
            if len(same_bat_neighbors) >= 3:
                angles_mod = []
                for n in same_bat_neighbors:
                    angle_mod = ((n['angle'] + 45) % 90) - 45
                    angles_mod.append(angle_mod)
                angles_mod.sort()
                base = angles_mod[len(angles_mod)//2]
                source_type = "same_bat_40m"
            else:
                # 2. Look at any battery within 40 meters
                any_bat_neighbors = []
                for other in all_feat_data:
                    dist = distance_meters(lat, lng, other['lat'], other['lng'])
                    if dist <= 40.0:
                        any_bat_neighbors.append(other)
                
                if len(any_bat_neighbors) >= 3:
                    angles_mod = []
                    for n in any_bat_neighbors:
                        angle_mod = ((n['angle'] + 45) % 90) - 45
                        angles_mod.append(angle_mod)
                    angles_mod.sort()
                    base = angles_mod[len(angles_mod)//2]
                    source_type = "any_bat_40m"
                else:
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
        
        if abs(diff_to_snap) > 0.1:
            rotated_count += 1
            
        # Check misalignment for spots in the broader courtyard (up to Lng 26.1045)
        if check_min_lat <= lat <= check_max_lat and check_min_lng <= lng <= check_max_lng:
            # Snap best_snap to courtyard grid
            grid_snap = best_snap
            min_grid_diff = 180.0
            for k in range(-4, 5):
                snap = grid_angle + k * 90.0
                diff = abs(best_snap - snap)
                if diff < min_grid_diff:
                    min_grid_diff = diff
                    grid_snap = snap
            final_grid_diff = (grid_snap - best_snap + 180) % 360 - 180
            
            if abs(final_grid_diff) > 5.0:
                print(f"MISALIGNED: ID={fd['id']} Num={fd['numar']} Bat={fd['baterie']} Raw={fd['angle']:.1f}° Snapped={best_snap:.1f}° Base={base:.1f}° Source={source_type} GridDiff={final_grid_diff:.1f}°")
                misaligned_remaining += 1
            elif abs(diff_to_snap) > 1.0:
                print(f"Aligned: ID={fd['id']} Num={fd['numar']} Bat={fd['baterie']} Raw={fd['angle']:.1f}° Snapped={best_snap:.1f}° Diff={diff_to_snap:.1f}° Source={source_type}")

    print(f"\nTotal rotated features: {rotated_count}")
    print(f"Total misaligned features remaining in courtyard check area: {misaligned_remaining}")

if __name__ == '__main__':
    main()

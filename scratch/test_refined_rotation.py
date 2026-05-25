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

def main():
    # Let's inspect the courtyard features from s4_polygons.json
    # We will simulate how the new rotation rules affect them
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    
    # Courtyard bbox
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045
    
    # We will simulate grouping by battery
    battery_features = {}
    for feat in features:
        bat = feat['properties'].get('baterie')
        if bat:
            if bat not in battery_features:
                battery_features[bat] = []
            battery_features[bat].append(feat)
            
    # Calculate dominant angles (median angle modulo 90)
    battery_dominant_base = {}
    for bat, feats in battery_features.items():
        angles_mod = []
        for f in feats:
            coords = f['geometry']['coordinates']
            angle = get_approx_angle(coords[0])
            angle_mod = ((angle + 45) % 90) - 45
            angles_mod.append(angle_mod)
        if angles_mod:
            angles_mod.sort()
            battery_dominant_base[bat] = angles_mod[len(angles_mod)//2]

    # Test alignment on courtyard features
    courtyard_feats = []
    for f in features:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            courtyard_feats.append(f)
            
    print(f"Courtyard features: {len(courtyard_feats)}")
    
    rotated_closed = 0
    rotated_open = 0
    skipped_closed = 0
    
    # In the actual pipeline:
    # Phase 1 features will have _source = 'closed'
    # Phase 3 features will have _source = 'open'
    # Here, we can infer _source by looking at the feature ID.
    # Open line features matched to points typically have ID of the point or the open line,
    # but we can look at the WFS lines to see if they are closed.
    # For this test, let's look at the IDs from the previous alignment output:
    # - ID=34350 to 34369 (Battery 4173) are closed lines in WFS.
    # - ID=43433 to 43437 (Battery 2990) are open lines.
    
    for f in courtyard_feats:
        props = f['properties']
        bat = str(props.get('baterie', ''))
        coords = f['geometry']['coordinates']
        centroid = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        fid = str(props.get('id', ''))
        
        # Infer source: open lines in our courtyard are 43433-43437, 67243, 67245, 67341, etc.
        is_open = fid in {'43433', '43434', '43435', '43436', '43437', '67243', '67245', '67341', '67288'}
        source = 'open' if is_open else 'closed'
        
        if bat in battery_dominant_base:
            base = battery_dominant_base[bat]
            best_snap = angle
            min_diff = 180.0
            for k in range(-4, 5):
                snap = base + k * 90.0
                diff = abs(angle - snap)
                if diff < min_diff:
                    min_diff = diff
                    best_snap = snap
            
            diff_to_snap = best_snap - angle
            if abs(diff_to_snap) > 0.05:
                # Refined rotation check:
                if source == 'closed' and abs(diff_to_snap) > 5.0:
                    # Skip large rotations for closed lines!
                    skipped_closed += 1
                    print(f"[SKIP] Closed ID={fid} Bat={bat} Num={props.get('numar')} Centroid=[{centroid[0]:.6f}, {centroid[1]:.6f}] Angle={angle:.1f}° target_snap={best_snap:.1f}° diff={diff_to_snap:.1f}°")
                else:
                    if source == 'closed':
                        rotated_closed += 1
                    else:
                        rotated_open += 1
                    print(f"[ROTATE] {source.upper()} ID={fid} Bat={bat} Num={props.get('numar')} Centroid=[{centroid[0]:.6f}, {centroid[1]:.6f}] Angle={angle:.1f}° -> {best_snap:.1f}° diff={diff_to_snap:.1f}°")
                    
    print(f"\nRefined Rotation Summary:")
    print(f"  Rotated closed lines (small angle): {rotated_closed}")
    print(f"  Rotated open lines (any angle): {rotated_open}")
    print(f"  Skipped closed lines (large angle curvature): {skipped_closed}")

if __name__ == '__main__':
    main()

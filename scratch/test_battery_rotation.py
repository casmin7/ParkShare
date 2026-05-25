import json
import math
from collections import defaultdict

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

def rotate_polygon(ring, centroid, angle_diff_deg):
    angle_rad = math.radians(angle_diff_deg)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    
    cy_lat, cx_lng = centroid
    lat_rad = math.radians(cy_lat)
    scale_lng_cos = math.cos(lat_rad)
    
    new_ring = []
    for pt in ring:
        lng, lat = pt[0], pt[1]
        dx = (lng - cx_lng) * scale_lng_cos
        dy = lat - cy_lat
        
        rot_dx = dx * cos_a - dy * sin_a
        rot_dy = dx * sin_a + dy * cos_a
        
        new_lng = cx_lng + rot_dx / scale_lng_cos
        new_lat = cy_lat + rot_dy
        new_ring.append([round(new_lng, 6), round(new_lat, 6)])
    return new_ring

def main():
    s4_file = 's4_polygons.json'
    with open(s4_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = data.get('features', [])
    
    # 1. Group features by battery
    battery_feats = defaultdict(list)
    for f in features:
        bat = f['properties'].get('baterie')
        if bat:
            battery_feats[str(bat)].append(f)
            
    # 2. For each battery, calculate dominant angles
    # We will compute the median of angles modulo 90
    battery_dominant_base = {}
    for bat, feats in battery_feats.items():
        angles_mod = []
        for f in feats:
            coords = f['geometry']['coordinates']
            angle = get_approx_angle(coords[0])
            # normalize angle to [-45, 45] range
            angle_mod = ((angle + 45) % 90) - 45
            angles_mod.append(angle_mod)
        
        if angles_mod:
            angles_mod.sort()
            median_base = angles_mod[len(angles_mod)//2]
            battery_dominant_base[bat] = median_base

    # 3. Test on courtyard features
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    courtyard_feats = []
    for f in features:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            courtyard_feats.append(f)

    print(f"Total courtyard features: {len(courtyard_feats)}")
    
    aligned_count = 0
    rotated_count = 0
    
    for f in courtyard_feats:
        props = f['properties']
        bat = str(props.get('baterie', ''))
        coords = f['geometry']['coordinates']
        centroid = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        if bat in battery_dominant_base:
            base = battery_dominant_base[bat]
            # Find the closest snapped angle to current angle
            # Snapped angles are base + k * 90
            best_snap = angle
            min_diff = 180.0
            for k in range(-4, 5):
                snap = base + k * 90.0
                # calculate difference
                diff = abs(angle - snap)
                if diff < min_diff:
                    min_diff = diff
                    best_snap = snap
            
            diff_to_snap = best_snap - angle
            if abs(diff_to_snap) > 0.1:
                # Rotate!
                new_ring = rotate_polygon(coords[0], centroid, diff_to_snap)
                new_angle = get_approx_angle(new_ring)
                print(f"ID={props.get('id')} Bat={bat} Num={props.get('numar')} Centroid=[{centroid[0]:.6f}, {centroid[1]:.6f}] Rotated: {angle:.1f}° -> {new_angle:.1f}° (diff={diff_to_snap:.1f}°)")
                rotated_count += 1
            else:
                aligned_count += 1
                
    print(f"Total: {aligned_count} already aligned, {rotated_count} rotated.")

if __name__ == '__main__':
    main()

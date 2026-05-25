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
            'angle': angle
        })

    courtyard_ids = {f['properties'].get('id') for f in courtyard_feats}
    cy_feat_data = [fd for fd in all_feat_data if fd['id'] in courtyard_ids]

    for radius in [30.0, 50.0, 60.0, 80.0, 100.0]:
        misaligned_after = 0
        for fd in cy_feat_data:
            neighbors = []
            for other in all_feat_data:
                dist = distance_meters(fd['lat'], fd['lng'], other['lat'], other['lng'])
                if dist <= radius:
                    neighbors.append(other)
            
            angles_mod = []
            for n in neighbors:
                angle_mod = ((n['angle'] + 45) % 90) - 45
                angles_mod.append(angle_mod)
            
            if angles_mod:
                angles_mod.sort()
                base = angles_mod[len(angles_mod)//2]
            else:
                base = ((fd['angle'] + 45) % 90) - 45
                
            best_snap = fd['angle']
            min_diff = 180.0
            for k in range(-4, 5):
                snap = base + k * 90.0
                diff = abs(fd['angle'] - snap)
                if diff < min_diff:
                    min_diff = diff
                    best_snap = snap
            
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
                misaligned_after += 1

        print(f"Radius={radius}m -> Misaligned remaining: {misaligned_after}")

if __name__ == '__main__':
    main()

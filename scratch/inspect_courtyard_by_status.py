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

    # Let's count S4 polygons in the courtyard grouped by status (ocupat)
    counts = {}
    for f in features:
        ocupat = f['properties'].get('ocupat')
        counts[ocupat] = counts.get(ocupat, 0) + 1
    print(f"Counts by ocupat status: {counts}")

    # Let's look at all spots with status 5 (institutie publica)
    print("\n--- Status 5 (Purple/Lilac) Spots in Courtyard ---")
    s5_spots = [f for f in features if f['properties'].get('ocupat') == 5]
    for f in s5_spots:
        p = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

    # Let's look at spots with status 1 (nominal ocupat) that have angles around -122 or other weird angles
    print("\n--- Tilted/Outlier Spots in Courtyard ---")
    for f in features:
        p = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        # Dominant angles are either parallel/perpendicular to the courtyard:
        # Let's check if the angle deviates from -32/148 by more than 10 degrees,
        # but also isn't aligned with the -122 / 58 perpendicular direction.
        # Wait, let's see which ones have angles between -80 and -10 degrees, or other ranges.
        # Let's print spots that have angles NOT near -32, 148, -122, 58 (within 5 degrees)
        aligned = False
        for base in [-32.0, 148.0, -122.0, 58.0]:
            if abs((angle - base) % 180) < 5.0 or abs((base - angle) % 180) < 5.0:
                aligned = True
                break
        
        if not aligned:
            print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Ocupat={p.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

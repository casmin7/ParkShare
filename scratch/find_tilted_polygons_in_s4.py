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

    min_lat, max_lat = 44.3853, 44.3861
    min_lng, max_lng = 26.1026, 26.1040

    features = data.get('features', [])
    tilted_in_courtyard = []
    
    for f in features:
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            angle = get_approx_angle(coords[0])
            # Check if angle deviates from -32/148 or -122/58 by more than 10 degrees.
            # Especially we are looking for angles around 60-80 degrees (or -120 to -100).
            aligned = False
            for base in [-32.0, 148.0, -122.0, 58.0]:
                if abs((angle - base) % 180) < 5.0 or abs((base - angle) % 180) < 5.0:
                    aligned = True
                    break
            
            if not aligned:
                tilted_in_courtyard.append((angle, f))

    print(f"Total non-aligned/tilted features in courtyard: {len(tilted_in_courtyard)}")
    for angle, f in tilted_in_courtyard:
        p = f['properties']
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Ocupat={p.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

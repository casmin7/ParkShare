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
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    b4173 = [feat for feat in features if feat['properties'].get('baterie') == '4173']
    
    # We want to see their raw angles before step 5 rotation, so let's fetch them from lines URL directly if we can,
    # or just print their current centroids and check where they are.
    b4173.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[1])
    for f in b4173:
        props = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        print(f"ID={props.get('id')} Num={props.get('numar')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

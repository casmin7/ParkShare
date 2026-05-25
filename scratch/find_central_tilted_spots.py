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

    # Let's inspect features inside the inner courtyard area where the central island is
    min_lat, max_lat = 44.3853, 44.3861
    min_lng, max_lng = 26.1026, 26.1040

    features = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features.append(f)

    print(f"Total features in search area: {len(features)}")
    
    # Print them all with details so we can see what's in there
    # Sort by longitude
    features.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[1])
    
    for f in features:
        props = f['properties']
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        # We can also compute the width and height of the bounding box to see if it's elongated
        lats = [c[1] for c in coords[0]]
        lngs = [c[0] for c in coords[0]]
        lat_range = max(lats) - min(lats)
        lng_range = max(lngs) - min(lngs)
        
        print(f"ID={props.get('id')} Num={props.get('numar')} Bat={props.get('baterie')} Ocupat={props.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}° LatRange={lat_range*111000:.1f}m LngRange={lng_range*111000*0.7:.1f}m")

if __name__ == '__main__':
    main()

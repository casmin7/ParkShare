import json
import math

def get_centroid(coords):
    ring = coords[0]
    lats = [c[1] for c in ring]
    lngs = [c[0] for c in ring]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def get_approx_angle(ring):
    # Get angle of the longest edge or first edge
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

    features_in_cy = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features_in_cy.append(f)

    print(f"Total features in courtyard: {len(features_in_cy)}")
    
    # We want to identify the features with properties.id containing '34371' or '34372'
    # or look at features whose orientation/rotation is weird.
    for f in features_in_cy:
        props = f['properties']
        fid = props.get('id', '')
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        angle = get_approx_angle(coords[0])
        
        # Let's print features that have id, numar, etc.
        # Especially let's look for features that are extruded open lines,
        # or features that look out of place.
        if '34371' in fid or '34372' in fid or abs(angle % 90) > 10:
            print(f"Anomalous/Target: ID={fid} Num={props.get('numar')} Bat={props.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Approx Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

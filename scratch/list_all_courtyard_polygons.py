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

    features_in_cy = []
    for f in data.get('features', []):
        coords = f['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            features_in_cy.append((lat, lng, f))

    # Sort by latitude then longitude
    features_in_cy.sort(key=lambda x: (x[0], x[1]))

    out_file = 'scratch/courtyard_polygons.txt'
    with open(out_file, 'w', encoding='utf-8') as out_f:
        out_f.write(f"Total features: {len(features_in_cy)}\n\n")
        for lat, lng, f in features_in_cy:
            props = f['properties']
            coords = f['geometry']['coordinates']
            angle = get_approx_angle(coords[0])
            out_f.write(f"ID={props.get('id')} Num={props.get('numar')} Bat={props.get('baterie')} Ocupat={props.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}° Geom={coords}\n")

    print(f"Saved {len(features_in_cy)} courtyard polygons to {out_file}")

if __name__ == '__main__':
    main()

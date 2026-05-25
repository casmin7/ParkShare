import json
import math

def get_centroid(coords):
    ring = coords[0]
    pts = ring[:-1] if (len(ring) > 1 and ring[0] == ring[-1]) else ring
    lats = [c[1] for c in pts]
    lngs = [c[0] for c in pts]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

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
        
    features = data.get('features', [])
    
    # We focus on the region around spot 6 and 9 of Battery 1150
    ref_lat, ref_lng = 44.384632, 26.131550
    
    nearby = []
    for feat in features:
        coords = feat['geometry']['coordinates']
        lat, lng = get_centroid(coords)
        dist = distance_meters(ref_lat, ref_lng, lat, lng)
        if dist < 40.0:
            nearby.append((feat, dist, lat, lng))
            
    print(f"Total features within 40m of Battery 1150 Spot 6: {len(nearby)}")
    
    # Print them sorted by distance
    nearby.sort(key=lambda x: x[1])
    for item in nearby:
        feat, dist, lat, lng = item
        p = feat['properties']
        print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Ocupat={p.get('ocupat')} Dist={dist:.1f}m Centroid=[{lat:.6f}, {lng:.6f}]")

if __name__ == '__main__':
    main()

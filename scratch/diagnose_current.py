"""
Focused diagnostic: compare WFS raw points vs our generated s4_polygons.json.
Find:
  1. Overlapping polygon pairs (centroids < 2m apart)
  2. Missing points (WFS points with no nearby polygon)
  3. Extra polygons (polygons with no nearby WFS point)
  4. Size anomalies (polygons too big or too small)
"""
import json
import math

def distance_meters(lat1, lng1, lat2, lng2):
    lat_mid = (lat1 + lat2) / 2.0
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(math.radians(lat_mid))
    dx = (lng2 - lng1) * scale_lng
    dy = (lat2 - lat1) * scale_lat
    return math.sqrt(dx**2 + dy**2)

def ring_centroid(ring):
    pts = ring[:-1] if (len(ring) > 1 and ring[0] == ring[-1]) else ring
    lats = [c[1] for c in pts]
    lngs = [c[0] for c in pts]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def ring_area_sqm(ring, ref_lat):
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(math.radians(ref_lat))
    n = len(ring)
    area = 0.0
    for i in range(n - 1):
        x1, y1 = ring[i][0] * scale_lng, ring[i][1] * scale_lat
        x2, y2 = ring[i+1][0] * scale_lng, ring[i+1][1] * scale_lat
        area += x1 * y2 - x2 * y1
    return abs(area) / 2.0

def main():
    print("Loading s4_polygons.json...")
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    polys = data.get('features', [])
    print(f"Total polygons: {len(polys)}")
    
    # Compute centroids and areas
    poly_info = []
    for feat in polys:
        ring = feat['geometry']['coordinates'][0]
        lat, lng = ring_centroid(ring)
        area = ring_area_sqm(ring, lat)
        p = feat['properties']
        poly_info.append({
            'lat': lat, 'lng': lng, 'area': area,
            'bat': p.get('baterie', ''), 'num': p.get('numar', ''),
            'id': p.get('id', ''), 'ocupat': p.get('ocupat', ''),
        })
    
    # 1. Find overlapping pairs (centroids < 2m)
    print("\n=== OVERLAPPING POLYGONS (centroids < 2m) ===")
    grid = {}
    for i, pi in enumerate(poly_info):
        key = (round(pi['lat'], 4), round(pi['lng'], 4))
        grid.setdefault(key, []).append(i)
    
    overlap_count = 0
    overlap_batteries = set()
    for i in range(len(poly_info)):
        pi = poly_info[i]
        key = (round(pi['lat'], 4), round(pi['lng'], 4))
        for dl in (-0.0001, 0, 0.0001):
            for dn in (-0.0001, 0, 0.0001):
                nkey = (round(key[0]+dl, 4), round(key[1]+dn, 4))
                for j in grid.get(nkey, []):
                    if j <= i:
                        continue
                    d = distance_meters(pi['lat'], pi['lng'],
                                       poly_info[j]['lat'], poly_info[j]['lng'])
                    if d < 2.0:
                        overlap_count += 1
                        overlap_batteries.add(pi['bat'])
                        if overlap_count <= 30:
                            pj = poly_info[j]
                            print(f"  OVERLAP: [{pi['bat']}/{pi['num']}] vs [{pj['bat']}/{pj['num']}] "
                                  f"dist={d:.2f}m")
    
    print(f"Total overlapping pairs: {overlap_count}")
    if overlap_batteries:
        print(f"Batteries with overlaps: {sorted(overlap_batteries)[:20]}")
    
    # 2. Size anomalies
    print("\n=== SIZE ANOMALIES ===")
    too_small = [p for p in poly_info if p['area'] < 4.0]
    too_big = [p for p in poly_info if p['area'] > 25.0]
    print(f"Polygons too small (< 4 sqm): {len(too_small)}")
    print(f"Polygons too big (> 25 sqm): {len(too_big)}")
    for p in too_big[:10]:
        print(f"  BIG: {p['bat']}/{p['num']} area={p['area']:.1f}sqm at [{p['lat']:.6f}, {p['lng']:.6f}]")
    
    # 3. Duplicate (battery, number) pairs
    print("\n=== DUPLICATE (battery, number) PAIRS ===")
    key_count = {}
    for p in poly_info:
        key = (p['bat'], p['num'])
        key_count[key] = key_count.get(key, 0) + 1
    dups = {k: v for k, v in key_count.items() if v > 1 and k[0] and k[1]}
    print(f"Unique (battery, number) pairs: {len(key_count)}")
    print(f"Duplicate pairs: {len(dups)}")
    for k, v in sorted(dups.items())[:20]:
        print(f"  Battery {k[0]} Spot {k[1]}: {v} polygons")
    
    # 4. Stats by source (id prefix)
    print("\n=== SOURCE STATS ===")
    sources = {}
    for p in poly_info:
        prefix = p['id'].split('-')[0] if '-' in p['id'] else 'unknown'
        sources[prefix] = sources.get(prefix, 0) + 1
    for src, cnt in sorted(sources.items()):
        print(f"  {src}: {cnt}")
    
    # 5. Area distribution
    print("\n=== AREA DISTRIBUTION ===")
    areas = [p['area'] for p in poly_info]
    areas.sort()
    print(f"  Min: {areas[0]:.1f} sqm")
    print(f"  25th percentile: {areas[len(areas)//4]:.1f} sqm")
    print(f"  Median: {areas[len(areas)//2]:.1f} sqm")
    print(f"  75th percentile: {areas[3*len(areas)//4]:.1f} sqm")
    print(f"  Max: {areas[-1]:.1f} sqm")

if __name__ == '__main__':
    main()

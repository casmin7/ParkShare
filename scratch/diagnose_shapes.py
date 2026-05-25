"""
Check how many polygons use real WFS geometry vs generated rectangles.
Also sample a specific area from the screenshot to debug visual issues.
"""
import json
import math

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

def ring_angle_deg(ring):
    if len(ring) < 2:
        return 0
    p1, p2 = ring[0], ring[1]
    lat = (p1[1] + p2[1]) / 2.0
    scale_lng = math.cos(math.radians(lat))
    dx = (p2[0] - p1[0]) * scale_lng
    dy = p2[1] - p1[1]
    return math.degrees(math.atan2(dy, dx))

def main():
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    polys = data.get('features', [])
    
    # Count vertex counts (5 = rect or closed line, >5 = complex shape)
    vert_counts = {}
    for feat in polys:
        ring = feat['geometry']['coordinates'][0]
        n = len(ring)
        vert_counts[n] = vert_counts.get(n, 0) + 1
    
    print("=== VERTEX COUNT DISTRIBUTION ===")
    for n in sorted(vert_counts.keys()):
        print(f"  {n} vertices: {vert_counts[n]} polygons")
    
    # Most generated rects have exactly 5 vertices (4 corners + close)
    # Closed WFS lines usually have 5 vertices too, but some have more
    # The key difference: generated rects are all exactly 2.3m x 5.0m = 11.5 sqm
    
    print("\n=== AREA CLUSTERS (potential generated rects) ===")
    areas = []
    for feat in polys:
        ring = feat['geometry']['coordinates'][0]
        lat, lng = ring_centroid(ring)
        area = ring_area_sqm(ring, lat)
        areas.append(area)
    
    # Check how many are exactly 11.5 sqm (generated rect 2.3 x 5.0)
    gen_rect_count = sum(1 for a in areas if abs(a - 11.5) < 0.3)
    print(f"  Polygons with area ~11.5 sqm (likely generated): {gen_rect_count}")
    
    # Check a sample area from the screenshot for visual debugging
    # The screenshot appears to show a courtyard/residential area
    # Let me look at several representative areas
    
    print("\n=== SAMPLE AREAS FOR VISUAL DEBUGGING ===")
    
    # Look at all features in a sample region around the courtyard (Drumul Gazarului)
    sample_regions = [
        ("Courtyard area", 44.385, 44.387, 26.102, 26.105),
        ("Battery 1150 area", 44.384, 44.386, 26.130, 26.133),
    ]
    
    for name, min_lat, max_lat, min_lng, max_lng in sample_regions:
        print(f"\n--- {name} [{min_lat},{max_lat}] x [{min_lng},{max_lng}] ---")
        region_feats = []
        for feat in polys:
            ring = feat['geometry']['coordinates'][0]
            lat, lng = ring_centroid(ring)
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                area = ring_area_sqm(ring, lat)
                angle = ring_angle_deg(ring)
                p = feat['properties']
                region_feats.append({
                    'bat': p.get('baterie',''), 'num': p.get('numar',''),
                    'lat': lat, 'lng': lng, 'area': area, 'angle': angle,
                    'verts': len(ring),
                })
        
        print(f"  Total features in region: {len(region_feats)}")
        
        # Group by battery
        bats = {}
        for rf in region_feats:
            bats.setdefault(rf['bat'], []).append(rf)
        
        for bat in sorted(bats.keys()):
            feats = bats[bat]
            areas_b = [f['area'] for f in feats]
            angles_b = [f['angle'] for f in feats]
            verts_b = set(f['verts'] for f in feats)
            avg_area = sum(areas_b) / len(areas_b)
            print(f"  Battery {bat}: {len(feats)} spots, avg area={avg_area:.1f}sqm, "
                  f"angle range=[{min(angles_b):.1f}°, {max(angles_b):.1f}°], "
                  f"vertex counts={verts_b}")

if __name__ == '__main__':
    main()

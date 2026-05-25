import json
import math
from collections import defaultdict

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

def rotate_polygon(ring, centroid, angle_diff_deg):
    angle_rad = math.radians(angle_diff_deg)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    
    cy_lat, cx_lng = centroid
    lat_rad = math.radians(cy_lat)
    scale_lng_cos = math.cos(lat_rad)
    
    new_ring = []
    for pt in ring:
        lng, lat = pt[0], pt[1]
        dx = (lng - cx_lng) * scale_lng_cos
        dy = lat - cy_lat
        
        rot_dx = dx * cos_a - dy * sin_a
        rot_dy = dx * sin_a + dy * cos_a
        
        new_lng = cx_lng + rot_dx / scale_lng_cos
        new_lat = cy_lat + rot_dy
        new_ring.append([round(new_lng, 6), round(new_lat, 6)])
    return new_ring

def main():
    # Read s4_polygons.json before rotation (we can just read the WFS lines if we want to run the full pipeline,
    # but here let's read the current s4_polygons.json which has some rotated values, but since they rotated to
    # the wrong median, we can see if local clustering would identify the correct median from raw lines.
    # Actually, let's run the clustering on s4_polygons.json and see if it identifies multiple clusters for 4173).
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    features = data.get('features', [])
    b4173 = [feat for feat in features if feat['properties'].get('baterie') == '4173']
    
    print(f"Total features for Battery 4173: {len(b4173)}")
    
    # Let's cluster b4173 features locally
    clusters = []
    for f in b4173:
        coords = f['geometry']['coordinates']
        c_lat, c_lng = get_centroid(coords)
        
        matched_cluster = None
        for clust in clusters:
            for member in clust:
                m_coords = member['geometry']['coordinates']
                m_lat, m_lng = get_centroid(m_coords)
                dist = math.sqrt((c_lat - m_lat)**2 + (c_lng - m_lng)**2)
                if dist < 0.001:
                    matched_cluster = clust
                    break
            if matched_cluster:
                break
        if matched_cluster:
            matched_cluster.append(f)
        else:
            clusters.append([f])
            
    print(f"Formed {len(clusters)} clusters for Battery 4173:")
    for i, clust in enumerate(clusters):
        lats = [get_centroid(f['geometry']['coordinates'])[0] for f in clust]
        lngs = [get_centroid(f['geometry']['coordinates'])[1] for f in clust]
        # Calculate median angle
        angles_mod = []
        for f in clust:
            coords = f['geometry']['coordinates']
            angle = get_approx_angle(coords[0])
            angle_mod = ((angle + 45) % 90) - 45
            angles_mod.append(angle_mod)
        angles_mod.sort()
        median_base = angles_mod[len(angles_mod)//2]
        
        print(f"  Cluster {i}: Size={len(clust)}, Lat=[{min(lats):.6f}, {max(lats):.6f}], Lng=[{min(lngs):.6f}, {max(lngs):.6f}], MedianMod={median_base:.1f}°")

if __name__ == '__main__':
    main()

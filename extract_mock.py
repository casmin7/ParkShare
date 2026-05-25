import json
import random
import os
from collections import defaultdict

def generate_clustered_mock_spots():
    path = 's4_polygons.json'
    if not os.path.exists(path):
        print("File not found:", path)
        return

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Filter for nominal occupied spots (status 1)
    nominals = [feat for feat in data['features'] if feat['properties'].get('ocupat') == 1]
    print(f"Found {len(nominals)} occupied spots in polygons.")
    
    # Group by 'baterie' or 'cod_parcare' to find neighbors
    groups = defaultdict(list)
    for feat in nominals:
        p = feat['properties']
        key = str(p.get('baterie', p.get('cod_parcare', 'unknown')))
        if key != 'unknown':
            groups[key].append(feat)
    
    # Filter out groups that are too small if we want clusters
    cluster_groups = [g for g in groups.values() if len(g) >= 3]
    print(f"Found {len(cluster_groups)} clusters with size >= 3.")
    
    # Randomly pick groups until we hit ~1000 spots
    selected_feats = []
    random.shuffle(cluster_groups)
    
    total_needed = 1000
    current_count = 0
    
    for group in cluster_groups:
        # Take up to 6-8 spots from this group to form a nice cluster
        take = min(len(group), random.randint(5, 8))
        cluster = group[:take]
        selected_feats.extend(cluster)
        current_count += len(cluster)
        if current_count >= total_needed:
            break

    results = []
    for feat in selected_feats:
        p = feat['properties']
        try:
            coords = feat['geometry']['coordinates']
            if feat['geometry']['type'] == 'Polygon':
                ring = coords[0]
                # Calculate centroid of the ring (excluding duplicate last point)
                pts = ring[:-1] if len(ring) > 1 else ring
                lng_c = sum(pt[0] for pt in pts) / len(pts)
                lat_c = sum(pt[1] for pt in pts) / len(pts)
                c = [lng_c, lat_c]
            elif feat['geometry']['type'] == 'MultiPolygon':
                ring = coords[0][0]
                pts = ring[:-1] if len(ring) > 1 else ring
                lng_c = sum(pt[0] for pt in pts) / len(pts)
                lat_c = sum(pt[1] for pt in pts) / len(pts)
                c = [lng_c, lat_c]
            else:
                continue
            
            results.append({
                'lat': round(c[1], 7),
                'lng': round(c[0], 7),
                'num': str(p.get('numar', 'N/A')),
                'code': str(p.get('baterie', p.get('cod_parcare', p.get('zona', 'S4'))))
            })
        except Exception as e:
            print("Error parsing feature geometry:", e)
            continue

    with open('mock_1000.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f"Successfully generated {len(results)} clustered mock spots in mock_1000.json.")

    # Select ~140 spots for massiveMockSpots
    random.seed(42)
    massive_spots = list(results)
    random.shuffle(massive_spots)
    massive_spots = massive_spots[:140]

    with open('massive_spots_s4.json', 'w', encoding='utf-8') as f:
        json.dump(massive_spots, f, indent=2)
    print(f"Successfully generated {len(massive_spots)} massive mock spots in massive_spots_s4.json.")

    # Save compact version
    compact_js = json.dumps(massive_spots, separators=(',', ':'), ensure_ascii=False)
    with open('massive_s4_array.txt', 'w', encoding='utf-8') as f:
        f.write(compact_js)
    print("Saved compact array to massive_s4_array.txt.")

if __name__ == "__main__":
    generate_clustered_mock_spots()

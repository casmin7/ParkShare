import json
import random
import os
from collections import defaultdict

def generate_clustered_mock_spots():
    path = 's3_polygons.json'
    if not os.path.exists(path):
        print("File not found")
        return

    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Filter for nominal occupied spots (status 1)
    nominals = [feat for feat in data['features'] if feat['properties'].get('ocupat') == 1]
    
    # Group by 'baterie' or 'cod_parcare' to find neighbors
    groups = defaultdict(list)
    for feat in nominals:
        p = feat['properties']
        # Use baterie or cod_parcare as the grouping key
        key = str(p.get('baterie', p.get('cod_parcare', 'unknown')))
        if key != 'unknown':
            groups[key].append(feat)
    
    # Filter out groups that are too small if we want clusters
    cluster_groups = [g for g in groups.values() if len(g) >= 3]
    
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
                c = coords[0][0]
            elif feat['geometry']['type'] == 'MultiPolygon':
                c = coords[0][0][0]
            else:
                continue
            
            results.append({
                'lat': round(c[1], 7),
                'lng': round(c[0], 7),
                'num': str(p.get('numar', 'N/A')),
                'code': str(p.get('baterie', p.get('cod_parcare', p.get('zona', 'S3'))))
            })
        except:
            continue

    with open('mock_1000.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"Successfully generated {len(results)} clustered mock spots.")

if __name__ == "__main__":
    generate_clustered_mock_spots()

import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

test_file = 'test_s4_polygons.json'
with open(test_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])

# Courtyard bbox
min_lat, max_lat = 44.3850, 44.3865
min_lng, max_lng = 26.1020, 26.1045

def get_centroid(feat):
    coords = feat['geometry']['coordinates'][0]
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

cy_feats = []
for feat in features:
    lat, lng = get_centroid(feat)
    if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
        cy_feats.append(feat)

print(f"Total features in courtyard in test_s4_polygons: {len(cy_feats)}")

grouped = {}
for feat in cy_feats:
    p = feat['properties']
    bat = p.get('baterie', 'None')
    if bat not in grouped:
        grouped[bat] = []
    grouped[bat].append(p)

for bat, props in sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True):
    nums = sorted(list(set([pr.get('numar') for pr in props if pr.get('numar')])))
    print(f"\nBattery {bat}: {len(props)} features")
    print(f"  Numbers ({len(nums)} unique): {nums}")

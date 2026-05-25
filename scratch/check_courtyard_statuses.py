import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
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

matches = []
for feat in features:
    lat, lng = get_centroid(feat)
    if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
        matches.append(feat)

print(f"Found {len(matches)} features in courtyard viewport.")

# Group by battery and check statuses
grouped = {}
for m in matches:
    p = m['properties']
    bat = p.get('baterie', 'None')
    status = p.get('ocupat')
    if bat not in grouped:
        grouped[bat] = []
    grouped[bat].append(status)

for bat, statuses in sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True):
    # Count occurrences of each status
    counts = {}
    for st in statuses:
        counts[st] = counts.get(st, 0) + 1
    print(f"  Battery {bat} ({len(statuses)} features): Statuses {counts}")

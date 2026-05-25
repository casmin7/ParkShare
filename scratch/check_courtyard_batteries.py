import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])

# Bounding box roughly around the courtyard near Argeselu / Drumul Gazarului
# Let's find features with coordinates near: Lat 44.385 to 44.388, Lng 26.101 to 26.105
min_lat, max_lat = 44.385, 44.388
min_lng, max_lng = 26.101, 26.105

courtyard_feats = []
for feat in features:
    coords = feat['geometry']['coordinates'][0]
    lng, lat = coords[0]
    if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
        courtyard_feats.append(feat)

print(f"Found {len(courtyard_feats)} features in courtyard bbox.")

# Let's group these features by battery code and list the spot numbers
grouped = {}
for feat in courtyard_feats:
    p = feat['properties']
    bat = p.get('baterie', 'None')
    if bat not in grouped:
        grouped[bat] = []
    grouped[bat].append(p)

for bat, props in grouped.items():
    nums = sorted([pr.get('numar') for pr in props if pr.get('numar')])
    print(f"\nBattery {bat}: {len(props)} features")
    print(f"  Numbers: {nums}")

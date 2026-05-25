import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])

# Find features for Battery 237, 270, 3002
b237 = [feat for feat in features if feat['properties'].get('baterie') == '237']
b270 = [feat for feat in features if feat['properties'].get('baterie') == '270']
b3002 = [feat for feat in features if feat['properties'].get('baterie') == '3002']

def get_bbox(feats):
    min_lat, max_lat = 90.0, -90.0
    min_lng, max_lng = 180.0, -180.0
    for feat in feats:
        coords = feat['geometry']['coordinates'][0]
        for c in coords:
            lng, lat = c[0], c[1]
            if lat < min_lat: min_lat = lat
            if lat > max_lat: max_lat = lat
            if lng < min_lng: min_lng = lng
            if lng > max_lng: max_lng = lng
    return min_lat, max_lat, min_lng, max_lng

print("Bounding Boxes:")
for name, feats in [("Battery 237", b237), ("Battery 270", b270), ("Battery 3002", b3002)]:
    if feats:
        min_lat, max_lat, min_lng, max_lng = get_bbox(feats)
        print(f"  {name} ({len(feats)} features):")
        print(f"    Lat: [{min_lat:.6f}, {max_lat:.6f}]")
        print(f"    Lng: [{min_lng:.6f}, {max_lng:.6f}]")

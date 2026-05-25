import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b237 = [feat for feat in features if feat['properties'].get('baterie') == '237']

def get_centroid(feat):
    coords = feat['geometry']['coordinates'][0]
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

print(f"Total features in Battery 237: {len(b237)}")
for feat in b237[:10]:
    lat, lng = get_centroid(feat)
    print(f"  Num={feat['properties'].get('numar')} Centroid=[{lat:.6f}, {lng:.6f}]")

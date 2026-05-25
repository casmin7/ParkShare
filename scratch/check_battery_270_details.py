import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b270 = [feat for feat in features if feat['properties'].get('baterie') == '270']

def get_centroid(feat):
    coords = feat['geometry']['coordinates'][0]
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

print(f"Total Battery 270 features: {len(b270)}")
# Sort by numar as int
try:
    b270.sort(key=lambda x: int(x['properties'].get('numar', 0)) if x['properties'].get('numar', '').isdigit() else 999)
except:
    pass

for feat in b270:
    p = feat['properties']
    lat, lng = get_centroid(feat)
    print(f"  Num={p.get('numar')} ID={p.get('id')} Centroid=[{lat:.6f}, {lng:.6f}]")

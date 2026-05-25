import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b270 = [feat for feat in features if feat['properties'].get('baterie') == '270']
b3002 = [feat for feat in features if feat['properties'].get('baterie') == '3002']

print(f"Total features in Battery 270: {len(b270)}")
print(f"Total features in Battery 3002: {len(b3002)}")

def get_centroid(feat):
    coords = feat['geometry']['coordinates'][0]
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

print("\nBattery 3002 centroids:")
for feat in b3002[:5]:
    lat, lng = get_centroid(feat)
    print(f"  Num={feat['properties'].get('numar')} Centroid=[{lat:.6f}, {lng:.6f}]")

print("\nBattery 270 centroids:")
for feat in b270[:5]:
    lat, lng = get_centroid(feat)
    print(f"  Num={feat['properties'].get('numar')} Centroid=[{lat:.6f}, {lng:.6f}]")

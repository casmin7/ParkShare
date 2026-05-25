import json

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b270 = [feat for feat in features if feat['properties'].get('baterie') == '270']

print(f"Battery 270 count: {len(b270)}")
for i, feat in enumerate(b270[:5]):
    print(f"Feature {i} properties: {feat['properties']}")
    print(f"Feature {i} geometry type: {feat['geometry']['type']}")
    print(f"Feature {i} coordinates: {feat['geometry']['coordinates']}")

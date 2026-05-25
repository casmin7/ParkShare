import json

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b270 = [feat for feat in features if feat['properties'].get('baterie') == '270']

print("Battery 270 features with status 0 (liber/green) or status 2 (yellow):")
for feat in b270:
    p = feat['properties']
    if p.get('ocupat') in (0, 2):
        coords = feat['geometry']['coordinates'][0]
        lats = [c[1] for c in coords]
        lngs = [c[0] for c in coords]
        cent_lat = sum(lats)/len(lats)
        cent_lng = sum(lngs)/len(lngs)
        print(f"  Num={p.get('numar')} ID={p.get('id')} Status={p.get('ocupat')} Centroid=[{cent_lat:.6f}, {cent_lng:.6f}]")

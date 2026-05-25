import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b270 = [feat for feat in features if feat['properties'].get('baterie') == '270']
b3002 = [feat for feat in features if feat['properties'].get('baterie') == '3002']

print(f"Battery 270 features: {len(b270)}")
print(f"Battery 3002 features: {len(b3002)}")

# Let's print the first 5 coords of 270
print("\nFirst 5 features of Battery 270:")
for i, feat in enumerate(b270[:5]):
    props = feat['properties']
    coords = feat['geometry']['coordinates'][0]
    print(f"  ID={props.get('id')} Num={props.get('numar')} Coords range: Lat [{min(c[1] for c in coords)}, {max(c[1] for c in coords)}], Lng [{min(c[0] for c in coords)}, {max(c[0] for c in coords)}]")

# Let's print the first 5 coords of 3002
print("\nFirst 5 features of Battery 3002:")
for i, feat in enumerate(b3002[:5]):
    props = feat['properties']
    coords = feat['geometry']['coordinates'][0]
    print(f"  ID={props.get('id')} Num={props.get('numar')} Coords range: Lat [{min(c[1] for c in coords)}, {max(c[1] for c in coords)}], Lng [{min(c[0] for c in coords)}, {max(c[0] for c in coords)}]")

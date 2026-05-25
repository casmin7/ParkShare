import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
matches = []

# Center near Strada Argeșelu / Drumul Găzarului
target_lat = 44.38677
target_lng = 26.10226

# 200 meters buffer in degrees (roughly 0.0018 degrees)
limit = 0.002

for feat in features:
    coords = feat['geometry']['coordinates'][0]
    inside = False
    for c in coords:
        lng, lat = c[0], c[1]
        if abs(lat - target_lat) <= limit and abs(lng - target_lng) <= limit:
            inside = True
            break
    if inside:
        matches.append(feat)

print(f"Found {len(matches)} features near Strada Argeșelu / Drumul Găzarului")
# Group by battery
by_battery = {}
for m in matches:
    p = m['properties']
    bat = p.get('baterie', 'None')
    by_battery[bat] = by_battery.get(bat, 0) + 1

print("Features by battery:")
for bat, count in by_battery.items():
    print(f"  Battery {bat}: {count} features")

# Print details of some features
print("\nSample features near intersection:")
for m in matches[:20]:
    p = m['properties']
    print(f"  ID={p.get('id')} Num={p.get('numar')} Battery={p.get('baterie')} Occupied={p.get('ocupat')} Coords={m['geometry']['coordinates'][0][0]}")

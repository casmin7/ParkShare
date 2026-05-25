import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])

# Map view bounds of Image 1
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

print(f"Found {len(matches)} features in Image 1 viewport.")

# Group by battery
by_battery = {}
for m in matches:
    bat = m['properties'].get('baterie', 'None')
    by_battery[bat] = by_battery.get(bat, 0) + 1

print("\nFeatures by battery:")
for bat, count in sorted(by_battery.items(), key=lambda x: x[1], reverse=True):
    print(f"  Battery {bat}: {count} features")

# List features for each main battery in this viewport
for bat in sorted(by_battery.keys()):
    if by_battery[bat] > 10:
        bat_feats = [m for m in matches if m['properties'].get('baterie') == bat]
        print(f"\nSample of 10 features for Battery {bat}:")
        for m in sorted(bat_feats, key=lambda x: int(x['properties'].get('numar', 0)) if x['properties'].get('numar', '').isdigit() else 999)[:10]:
            print(f"  Num={m['properties'].get('numar')} ID={m['properties'].get('id')} Centroid={get_centroid(m)}")

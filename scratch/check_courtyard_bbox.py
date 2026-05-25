import json

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b429_feats = []
for feat in features:
    props = feat.get('properties', {})
    if props.get('baterie') == '429':
        b429_feats.append(feat)

if not b429_feats:
    print("No features for battery 429 found.")
    sys.exit()

# Get bbox of battery 429 features
min_lat = 90.0
max_lat = -90.0
min_lng = 180.0
max_lng = -180.0

for feat in b429_feats:
    coords = feat['geometry']['coordinates'][0]
    for c in coords:
        lng, lat = c[0], c[1]
        if lat < min_lat: min_lat = lat
        if lat > max_lat: max_lat = lat
        if lng < min_lng: min_lng = lng
        if lng > max_lng: max_lng = lng

# Add a small buffer (~100 meters)
buffer = 0.001
min_lat -= buffer
max_lat += buffer
min_lng -= buffer
max_lng += buffer

print(f"Bounding box: Lat [{min_lat}, {max_lat}], Lng [{min_lng}, {max_lng}]")

# Find all features in this bbox
bbox_feats = []
for feat in features:
    coords = feat['geometry']['coordinates'][0]
    # Check if any coordinate of the feature is inside bbox
    inside = False
    for c in coords:
        lng, lat = c[0], c[1]
        if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
            inside = True
            break
    if inside:
        bbox_feats.append(feat)

print(f"Total features in bbox: {len(bbox_feats)}")

# Group them by battery code and print counts
by_battery = {}
for feat in bbox_feats:
    props = feat.get('properties', {})
    bat = props.get('baterie', 'None')
    by_battery[bat] = by_battery.get(bat, 0) + 1

print("Features by battery code in bbox:")
for bat, count in by_battery.items():
    print(f"  Battery {bat}: {count} features")

# Print some details of features in this bbox that are NOT battery 429
print("\nSome non-429 features in bbox:")
count = 0
for feat in bbox_feats:
    props = feat.get('properties', {})
    if props.get('baterie') != '429':
        print(f"  ID={props.get('id')} Num={props.get('numar')} Battery={props.get('baterie')} Occupied={props.get('ocupat')} Coords={feat['geometry']['coordinates'][0][0]}")
        count += 1
        if count >= 15:
            break

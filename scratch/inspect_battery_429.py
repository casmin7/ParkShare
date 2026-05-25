import json

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
matches = []
for feat in features:
    props = feat.get('properties', {})
    if '429' in str(props.get('baterie', '')) or '429' in str(props.get('zona', '')):
        matches.append(feat)

print(f"Found {len(matches)} matches for 429 in s4_polygons.json")
if matches:
    # Print the first 5 matches' properties
    for i, m in enumerate(matches[:10]):
        print(f"Match {i}: ID={m['properties'].get('id')} Number={m['properties'].get('numar')} Battery={m['properties'].get('baterie')} Occupied={m['properties'].get('ocupat')} Coords count={len(m['geometry']['coordinates'][0])}")

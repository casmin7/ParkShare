import json

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])
b429 = []
for feat in features:
    props = feat.get('properties', {})
    bat = str(props.get('baterie', ''))
    if bat == '429':
        b429.append(props)

# Sort by numar
try:
    b429.sort(key=lambda x: int(x.get('numar', 0)) if x.get('numar', '').isdigit() else 999)
except Exception as e:
    print(e)

print(f"Total spots in battery 429: {len(b429)}")
nums = [p.get('numar') for p in b429]
print("All spot numbers in battery 429:")
print(nums)

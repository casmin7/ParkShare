import json

# Check pois.json
pois_file = 'pois.json'
with open(pois_file, 'r', encoding='utf-8') as f:
    pois = json.load(f)

for p in pois:
    name = p.get('name', '')
    if 'Găzar' in name or 'gazar' in name.lower() or 'Argeș' in name or 'arges' in name.lower():
        print(f"POI: Name={name} Lat={p.get('lat')} Lng={p.get('lon') or p.get('lng')}")

# Also check app.js for coordinates of Găzarului or Argeșelu if any
with open('app.js', 'r', encoding='utf-8') as f:
    appjs = f.read()
    if 'Găzar' in appjs or 'Argeș' in appjs:
        print("Found matching street names in app.js!")

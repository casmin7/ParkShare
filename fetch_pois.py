import urllib.request
import urllib.parse
import json
import traceback

print('Fetching POIs for Sector 3 Bounding Box from Overpass API (GET)...')
# Bounding box for roughly Sector 3 area:
query = """
[out:json][timeout:50];
(
nwr["amenity"="parking"](44.38,26.11,44.44,26.22);
nwr["amenity"="bank"](44.38,26.11,44.44,26.22);
nwr["shop"](44.38,26.11,44.44,26.22);
);
out center;
"""

try:
    url = 'https://overpass-api.de/api/interpreter?data=' + urllib.parse.quote(query.strip())
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'ParkShare Local Script')
    
    with urllib.request.urlopen(req) as response:
        data_json = json.loads(response.read().decode('utf-8'))

    pois = []
    for el in data_json.get('elements', []):
        lat = el.get('lat') or (el.get('center', {})).get('lat')
        lon = el.get('lon') or (el.get('center', {})).get('lon')
        if not lat or not lon:
            continue
        tags = el.get('tags', {})
        if 'amenity' in tags and tags['amenity'] == 'parking':
            t = 'parking'
            n = tags.get('name', 'Parcare Publică')
        elif 'amenity' in tags and tags['amenity'] == 'bank':
            t = 'bank'
            n = tags.get('name', 'Bancă')
        elif 'shop' in tags:
            t = 'shop'
            n = tags.get('name', 'Magazin')
        else:
            continue
        pois.append({'lat': lat, 'lon': lon, 'type': t, 'name': n})

    print(f'Found {len(pois)} POIs in Sector 3 bbox.')
    with open('pois.json', 'w', encoding='utf-8') as f:
        json.dump(pois, f, ensure_ascii=False)
    print('Saved to pois.json.')
except Exception as e:
    print('Error:')
    traceback.print_exc()

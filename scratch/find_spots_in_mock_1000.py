import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

mock_file = 'mock_1000.json'
with open(mock_file, 'r', encoding='utf-8') as f:
    spots = json.load(f)

print(f"Loaded {len(spots)} spots from mock_1000.json.")

cy_spots = []
for s in spots:
    lat, lng = s['lat'], s['lng']
    if 44.3850 <= lat <= 44.3870 and 26.1020 <= lng <= 26.1045:
        cy_spots.append(s)

print(f"\nMock spots in courtyard area ({len(cy_spots)}):")
for s in cy_spots:
    print(f"  Num={s['num']} Code={s['code']} Lat={s['lat']} Lng={s['lng']}")

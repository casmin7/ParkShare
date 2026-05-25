import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Let's search for mock spots near Lat 44.3858, Lng 26.1031
# First, let's load massiveMockSpots from app.js
import re
with open('app.js', 'r', encoding='utf-8') as f:
    appjs = f.read()

# Find the massiveMockSpots array using regex
match = re.search(r'const massiveMockSpots = \[(.*?)\];', appjs)
if match:
    spots_str = "[" + match.group(1) + "]"
    spots = json.loads(spots_str)
    print(f"Loaded {len(spots)} mock spots from app.js.")
    
    # Filter spots in the courtyard bbox
    cy_spots = []
    for s in spots:
        lat, lng = s['lat'], s['lng']
        if 44.3850 <= lat <= 44.3870 and 26.1020 <= lng <= 26.1045:
            cy_spots.append(s)
            
    print(f"\nMock spots in courtyard area ({len(cy_spots)}):")
    for s in cy_spots:
        print(f"  Num={s['num']} Code={s['code']} Lat={s['lat']} Lng={s['lng']}")
else:
    print("Could not find massiveMockSpots in app.js")

import json

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

all_polygons = data.get('features', [])

# Map bounds in Image 1 (simulated)
# We know the viewport has Gazarului at the bottom (44.3851) and goes up to Argeselu top (44.3864)
# Lng goes from 26.102 to 26.1045
min_lat, max_lat = 44.3850, 44.3865
min_lng, max_lng = 26.1020, 26.1045

# Mock spots from app.js (massiveMockSpots)
massive_mock_spots = [
  {"lat":44.386168,"lng":26.104162,"num":"13","code":"237"},
  {"lat":44.38633,"lng":26.103899,"num":"59","code":"237"},
  {"lat":44.386292,"lng":26.103966,"num":"64","code":"237"}
]

# Simulate app.js Pass 1 rendering
visible_features = []
for f in all_polygons:
    ring = f['geometry']['coordinates'][0]
    if not ring or len(ring) == 0:
        continue
    first = ring[0]
    
    # bounds.contains check
    is_visible = (min_lat <= first[1] <= max_lat) and (min_lng <= first[0] <= max_lng)
    if is_visible:
        visible_features.append(f)

print(f"Total features inside bounds: {len(visible_features)}")

# Apply Pass 1 filter: exclude spots in appState.spots (massive_mock_spots)
rendered_pass1 = []
excluded_count = 0
for f in visible_features:
    props = f['properties']
    spot_num = str(props.get('numar') or props.get('zona') or 'N/A').replace('Loc nominal', '').strip()
    park_code = str(props.get('cod_parcare') or props.get('id_parcare') or props.get('id_zona') or props.get('nume_parcare') or props.get('cod_loc') or props.get('baterie') or props.get('zona') or '')
    gis_id = str(props.get('id') or props.get('OBJECTID') or props.get('FID') or '')
    
    first_coord = f['geometry']['coordinates'][0][0]
    fingerprint = f"{first_coord[1]:.6f},{first_coord[0]:.6f}"
    
    # Check if matches any mock spot
    matches_mock = False
    for s in massive_mock_spots:
        s_num = str(s['num']).strip()
        s_code = str(s['code']).strip()
        s_lat, s_lng = s['lat'], s['lng']
        
        # 1. GPS fingerprint match (within 6 decimals)
        s_fingerprint = f"{s_lat:.6f},{s_lng:.6f}"
        if s_fingerprint == fingerprint:
            matches_mock = True
            break
            
        # 2. Official IDs match (not applicable here as mock spots don't have gisId, but let's check code/number)
        if s_code == park_code and s_num == spot_num:
            matches_mock = True
            break
            
    if not matches_mock:
        rendered_pass1.append(f)
    else:
        excluded_count += 1
        print(f"Excluded feature from Pass 1: ID={gis_id} Num={spot_num} Code={park_code}")

print(f"Rendered in Pass 1: {len(rendered_pass1)}")
print(f"Excluded from Pass 1: {excluded_count}")

# Group rendered by battery to see if Battery 270 is rendered
by_battery = {}
for f in rendered_pass1:
    bat = f['properties'].get('baterie', 'None')
    by_battery[bat] = by_battery.get(bat, 0) + 1

print("\nRendered features by battery:")
for bat, count in sorted(by_battery.items(), key=lambda x: x[1], reverse=True):
    print(f"  Battery {bat}: {count}")

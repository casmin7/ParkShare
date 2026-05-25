"""
Generate Sector 4 parking data for ParkShare.
Sector 4 Bucharest: roughly lat 44.36-44.42, lng 26.04-26.17
Key neighborhoods: Tineretului, Berceni, Oltenitei, Brancoveanu, Progresul
"""

import json
import random
import math

random.seed(42)

# Sector 4 Bucharest bounding box (approximate)
# Sector 4 is in the southern part of Bucharest, bounded by the Dambovita river to the north
# Key areas: Berceni, Tineretului, Oltenitei, 4 Mai, Progresul, Brancoveanu
# Center approximately: 44.397, 26.103

# Define Sector 4 parking cluster zones (real street areas in S4)
S4_ZONES = [
    # (center_lat, center_lng, zone_name, baterie_prefix)
    (44.4023, 26.1012, "Tineretului", "T"),
    (44.3980, 26.1050, "Berceni", "B"),
    (44.4050, 26.0980, "Oltenitei", "O"),
    (44.4100, 26.1080, "Brancoveanu", "BR"),
    (44.3950, 26.0920, "Progresul", "PR"),
    (44.4130, 26.1150, "4_Mai", "M"),
    (44.4080, 26.0950, "Sudului", "S"),
    (44.4010, 26.1180, "Alexandru_Obregia", "AO"),
    (44.4060, 26.1230, "Piata_Sudului", "PS"),
    (44.3920, 26.1000, "Luica", "L"),
    (44.4120, 26.0900, "Ferentari", "F"),
    (44.4140, 26.1020, "Regina_Maria", "RM"),
    (44.3990, 26.1140, "Prel_Oltenitei", "PO"),
    (44.4070, 26.1350, "Turnu_Magurele", "TM"),
    (44.3960, 26.1280, "Berceni_Sud", "BS"),
    (44.4160, 26.1200, "Sebastian", "SE"),
    (44.3880, 26.0960, "Metalurgiei", "ME"),
    (44.4030, 26.0830, "Salaj", "SJ"),
    (44.4110, 26.1300, "Vacaresti", "V"),
    (44.3900, 26.1100, "Soseaua_Oltenitei", "SO"),
]

def random_spot_in_cluster(center_lat, center_lng, spread=0.003):
    """Generate a random spot near a cluster center"""
    dlat = random.uniform(-spread, spread)
    dlng = random.uniform(-spread, spread)
    return round(center_lat + dlat, 7), round(center_lng + dlng, 7)

def generate_polygon_for_spot(lat, lng):
    """Generate a small parking spot polygon (approximately 5m x 2.5m)"""
    # Parking spot is roughly 5m long and 2.5m wide
    # 1 degree lat ~ 111000m, 1 degree lng ~ 80000m at this latitude
    half_len = 0.000025  # ~2.75m in lat
    half_wid = 0.000016  # ~1.28m in lng

    # Random slight rotation
    angle = random.uniform(-30, 30) * math.pi / 180
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)

    corners = [
        (-half_len, -half_wid),
        (-half_len,  half_wid),
        ( half_len,  half_wid),
        ( half_len, -half_wid),
    ]

    rotated = []
    for (dy, dx) in corners:
        new_dy = dy * cos_a - dx * sin_a
        new_dx = dy * sin_a + dx * cos_a
        rotated.append([round(lng + new_dx, 7), round(lat + new_dy, 7)])

    # Close the polygon
    rotated.append(rotated[0])
    return rotated

# ─────────────────────────────────────────
# 1. Generate mock_1000.json (Sector 4 spots)
# ─────────────────────────────────────────
spots_per_zone = 50  # 20 zones × 50 spots = 1000 total

mock_spots = []
baterie_counters = {}

for zone in S4_ZONES:
    c_lat, c_lng, zone_name, prefix = zone
    baterie_id = f"{prefix}_{random.randint(100, 999)}"

    for i in range(spots_per_zone):
        # Every 8-15 spots, start a new parking cluster (baterie)
        if i % random.randint(8, 15) == 0:
            baterie_id = f"{prefix}_{random.randint(100, 999)}"

        lat, lng = random_spot_in_cluster(c_lat, c_lng, spread=0.0025)
        spot_num = str(i + 1)

        mock_spots.append({
            "lat": lat,
            "lng": lng,
            "num": spot_num,
            "code": baterie_id
        })

# Shuffle to mix zones
random.shuffle(mock_spots)
mock_spots = mock_spots[:1000]

with open('mock_1000.json', 'w', encoding='utf-8') as f:
    json.dump(mock_spots, f, indent=2, ensure_ascii=False)

print(f"✓ Generated mock_1000.json with {len(mock_spots)} spots")

# ─────────────────────────────────────────
# 2. Generate massiveMockSpots (for app.js inline array)
#    These are the spots that get seeded when DB has < 5 spots
#    ~130 spots, Sector 4 coordinates
# ─────────────────────────────────────────
massive_spots = []
for zone in S4_ZONES:
    c_lat, c_lng, zone_name, prefix = zone
    baterie_id = f"{prefix}_{random.randint(200, 899)}"
    for i in range(7):
        if i % 3 == 0:
            baterie_id = f"{prefix}_{random.randint(200, 899)}"
        lat, lng = random_spot_in_cluster(c_lat, c_lng, spread=0.0015)
        massive_spots.append({
            "lat": lat,
            "lng": lng,
            "num": str(i + 1),
            "code": baterie_id
        })

random.shuffle(massive_spots)

# Save for reference
with open('massive_spots_s4.json', 'w', encoding='utf-8') as f:
    json.dump(massive_spots, f, indent=2)

print(f"✓ Generated massive_spots_s4.json with {len(massive_spots)} spots")

# ─────────────────────────────────────────
# 3. Generate s4_polygons.json
#    GeoJSON FeatureCollection with parking polygons
#    Format matches the expected polygon structure
# ─────────────────────────────────────────
features = []
feature_count = 0

# Occupation statuses (6=libre, 1=occupied, etc.)
OCUPAT_VALUES = [6, 6, 6, 1, 1, 3]  # Weighted: mostly free

for zone in S4_ZONES:
    c_lat, c_lng, zone_name, prefix = zone
    
    # Generate 12-20 parking batteries per zone
    for bat_i in range(random.randint(12, 20)):
        baterie_id = f"{prefix}_{random.randint(100, 999)}"
        
        # Each battery has 5-25 spots
        n_spots = random.randint(5, 25)
        
        # Cluster center for this battery
        bat_lat, bat_lng = random_spot_in_cluster(c_lat, c_lng, spread=0.002)
        
        for spot_i in range(n_spots):
            # Spots are in a line within the battery cluster
            dlat = spot_i * 0.000045 * random.uniform(0.9, 1.1)
            dlng = spot_i * 0.000005 * random.uniform(-1, 1)
            
            s_lat = round(bat_lat + dlat, 7)
            s_lng = round(bat_lng + dlng, 7)
            
            coords = generate_polygon_for_spot(s_lat, s_lng)
            
            # Determine zone code (B1-B20 style)
            zone_code = f"S4-{zone_name[:2].upper()}{random.randint(1, 20)}"
            
            feature = {
                "type": "Feature",
                "properties": {
                    "baterie": baterie_id,
                    "numar": str(spot_i + 1),
                    "ocupat": random.choice(OCUPAT_VALUES),
                    "zona": zone_code
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords]
                }
            }
            features.append(feature)
            feature_count += 1

geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open('s4_polygons.json', 'w', encoding='utf-8') as f:
    json.dump(geojson, f, separators=(',', ':'), ensure_ascii=False)

print(f"✓ Generated s4_polygons.json with {feature_count} parking spot polygons")

# ─────────────────────────────────────────
# 4. Print massiveMockSpots JS array for app.js
# ─────────────────────────────────────────
js_array = json.dumps(massive_spots, separators=(',', ':'), ensure_ascii=False)
print(f"\n✓ massiveMockSpots JS inline array ready ({len(massive_spots)} spots)")
print("Array preview (first 200 chars):", js_array[:200])

# Save the JS array separately for easy copy
with open('massive_s4_array.txt', 'w', encoding='utf-8') as f:
    f.write(js_array)
print("✓ Saved to massive_s4_array.txt")

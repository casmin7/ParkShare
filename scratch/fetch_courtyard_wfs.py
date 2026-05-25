import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Courtyard bbox
bbox = "26.1022,44.3854,26.1038,44.3868" # lng_min, lat_min, lng_max, lat_max

url_lines = f"https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&srsname=EPSG:4326&bbox={bbox}"
url_points = f"https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&srsname=EPSG:4326&bbox={bbox}"

print("Fetching lines for courtyard...")
req = urllib.request.Request(url_lines, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        lines_data = json.loads(r.read().decode('utf-8'))
        lines = lines_data.get('features', [])
        print(f"Fetched {len(lines)} lines in courtyard.")
except Exception as e:
    print("Error fetching lines:", e)
    lines = []

print("\nFetching points for courtyard...")
req_pts = urllib.request.Request(url_points, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req_pts, context=ctx, timeout=30) as r:
        pts_data = json.loads(r.read().decode('utf-8'))
        pts = pts_data.get('features', [])
        print(f"Fetched {len(pts)} points in courtyard.")
except Exception as e:
    print("Error fetching points:", e)
    pts = []

# Inspect lines
print("\n--- Lines Geometry Analysis ---")
geom_types = {}
ring_lens = {}
closed_count = 0
open_count = 0

for f in lines:
    g = f.get('geometry')
    if not g: continue
    t = g.get('type')
    geom_types[t] = geom_types.get(t, 0) + 1
    if t == 'MultiLineString':
        coords = g.get('coordinates', [])
        if coords:
            ring = coords[0]
            l = len(ring)
            ring_lens[l] = ring_lens.get(l, 0) + 1
            if ring[0] == ring[-1] and l >= 4:
                closed_count += 1
            else:
                open_count += 1
                if open_count <= 10:
                    print(f"Open line sample: ID={f.get('id')} properties={f.get('properties')} coords={ring}")

print("\nGeometry types:")
print(geom_types)
print("Ring lengths:")
print(dict(sorted(ring_lens.items())))
print(f"Closed loops (>=4 pts): {closed_count}")
print(f"Open lines/segments: {open_count}")

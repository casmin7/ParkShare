import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Fetch lines for Simbol='8280'
url_lines = "https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&srsname=EPSG:4326&cql_filter=Simbol='8280'"
print("Fetching lines for Simbol='8280'...")
req = urllib.request.Request(url_lines, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        lines_data = json.loads(r.read().decode('utf-8'))
        lines = lines_data.get('features', [])
        print(f"Fetched {len(lines)} lines.")
        
        # Count geometry types and closed/open
        closed_count = 0
        open_count = 0
        for f in lines:
            g = f.get('geometry')
            if not g: continue
            t = g.get('type')
            if t == 'MultiLineString':
                coords = g.get('coordinates', [])
                if coords:
                    ring = coords[0]
                    is_closed = (ring[0] == ring[-1]) and len(ring) >= 4
                    if is_closed:
                        closed_count += 1
                    else:
                        open_count += 1
        print(f"Closed loops: {closed_count}")
        print(f"Open lines: {open_count}")
except Exception as e:
    print("Error:", e)

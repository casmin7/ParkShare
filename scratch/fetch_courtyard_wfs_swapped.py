import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Swapped bbox: lat_min, lng_min, lat_max, lng_max
bbox = "44.384,26.101,44.387,26.105"

url_lines = f"https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&srsname=EPSG:4326&bbox={bbox}"
print("Fetching lines for courtyard (swapped)...")
req = urllib.request.Request(url_lines, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        lines_data = json.loads(r.read().decode('utf-8'))
        lines = lines_data.get('features', [])
        print(f"Fetched {len(lines)} lines.")
except Exception as e:
    print("Error fetching lines:", e)

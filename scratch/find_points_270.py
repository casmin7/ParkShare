import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Fetch points for battery 270
url_points = "https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&srsname=EPSG:4326&cql_filter=parcare_arondata='270'"
req_pts = urllib.request.Request(url_points, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req_pts, context=ctx, timeout=30) as r:
        pts_data = json.loads(r.read().decode('utf-8'))
        pts = pts_data.get('features', [])
        print(f"Fetched {len(pts)} points for battery 270.")
        for p in pts[:10]:
            print(f"  ID={p.get('id')} Num={p['properties'].get('nr_parcare')} Coords={p['geometry']['coordinates']}")
except Exception as e:
    print("Error:", e)

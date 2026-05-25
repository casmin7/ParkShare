import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url_lines = "https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&srsname=EPSG:4326&cql_filter=Simbol='8280'"
req = urllib.request.Request(url_lines, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        lines_data = json.loads(r.read().decode('utf-8'))
        lines = lines_data.get('features', [])
        print(f"Fetched {len(lines)} lines for Simbol='8280'")
        
        centroids = []
        for feat in lines:
            coords = feat['geometry']['coordinates'][0]
            lats = [c[1] for c in coords]
            lngs = [c[0] for c in coords]
            cent = (sum(lats)/len(lats), sum(lngs)/len(lngs))
            centroids.append((feat['properties'].get('Numar Loc'), cent))
            
        centroids.sort(key=lambda x: int(x[0]) if x[0] and x[0].isdigit() else 999)
        for num, cent in centroids:
            print(f"  Num={num} Centroid=[{cent[0]:.6f}, {cent[1]:.6f}]")
except Exception as e:
    print("Error:", e)

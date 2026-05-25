import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We will inspect the first 10 features of several layers
layers = [
    'Sector4_city:nparking_parcari_p_linii',
    'Sector4_city:nparking_parcari',
    'Sector4_city:nparking_parcari_view'
]

for layer in layers:
    print(f"\n================ LAYER {layer} ================")
    url = f"https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName={layer}&outputFormat=application/json&maxFeatures=10&srsname=EPSG:4326"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            data = json.loads(r.read().decode('utf-8'))
            features = data.get('features', [])
            print(f"Fetched {len(features)} features.")
            if features:
                print(f"Sample feature 0:")
                print(json.dumps(features[0], indent=2))
            else:
                print("No features.")
    except Exception as e:
        print("Error fetching layer:", e)

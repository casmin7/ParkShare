import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Fetch exact feature nparking_parcari_linii.2762
url = "https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&featureID=nparking_parcari_linii.2762"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        data = json.loads(r.read().decode('utf-8'))
        features = data.get('features', [])
        if features:
            print("Feature 2762 found!")
            print(json.dumps(features[0], indent=2))
        else:
            print("Feature 2762 not found.")
except Exception as e:
    print("Error fetching feature 2762:", e)

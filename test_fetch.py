import urllib.request
import json
import ssl
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=1&srsname=EPSG:4326'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    print(f"Fetching WFS data with srsname=EPSG:4326...")
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))
        features = data.get('features', [])
        if features:
            print("First feature properties:", features[0].get('properties'))
            print("First feature geometry coords:", features[0].get('geometry', {}).get('coordinates'))
except Exception as e:
    print("Failed to fetch:", e)




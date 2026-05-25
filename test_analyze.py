import urllib.request
import json
import ssl
from collections import Counter

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=500'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx) as response:
        data = json.loads(response.read().decode('utf-8'))
        features = data.get('features', [])
        print("Total features matching:", data.get('totalFeatures'))
        print("Number of features fetched:", len(features))
        
        # Analyze properties
        status_parcaj_vals = Counter()
        tip_loc_vals = Counter()
        status_blocator_vals = Counter()
        blocator_vals = Counter()
        tip_abonament_vals = Counter()
        taxe_vals = Counter()
        
        for f in features:
            p = f.get('properties', {})
            status_parcaj_vals[p.get('status_parcaj')] += 1
            tip_loc_vals[p.get('tip_loc')] += 1
            status_blocator_vals[p.get('status_blocator')] += 1
            blocator_vals[p.get('blocator')] += 1
            tip_abonament_vals[p.get('tip_abonament')] += 1
            taxe_vals[p.get('taxe')] += 1
            
        print("\nstatus_parcaj values:")
        for k, v in status_parcaj_vals.items():
            print(f"  {k}: {v}")
            
        print("\ntip_loc values:")
        for k, v in tip_loc_vals.items():
            print(f"  {k}: {v}")
            
        print("\nstatus_blocator values:")
        for k, v in status_blocator_vals.items():
            print(f"  {k}: {v}")

        print("\nblocator values:")
        for k, v in blocator_vals.items():
            print(f"  {k}: {v}")

        print("\ntip_abonament values:")
        for k, v in tip_abonament_vals.items():
            print(f"  {k}: {v}")

        print("\ntaxe values:")
        for k, v in taxe_vals.items():
            print(f"  {k}: {v}")
            
except Exception as e:
    print("Failed to fetch:", e)

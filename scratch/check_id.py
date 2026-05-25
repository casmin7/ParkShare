import json
import urllib.request
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching WFS features...")
    # Fetch 10000 features
    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=10000&srsname=EPSG:4326'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            
            # Find duplicate properties
            prop_map = {}
            for f in features:
                p = f.get('properties', {})
                num = p.get('Numar Loc')
                simb = p.get('Simbol')
                if not num or not simb:
                    continue
                key = (num, simb)
                if key not in prop_map:
                    prop_map[key] = []
                prop_map[key].append(f)
                
            duplicates = {k: v for k, v in prop_map.items() if len(v) > 1}
            print(f"Total unique (Numar Loc, Simbol) keys: {len(prop_map)}")
            print(f"Total duplicate keys: {len(duplicates)}")
            
            # Print a few duplicates
            for i, (k, v) in enumerate(list(duplicates.items())[:5]):
                print(f"\nDuplicate Key {k}:")
                for f_idx, f in enumerate(v):
                    print(f"  Feature {f_idx + 1}: ID={f.get('id')}, Geom={f.get('geometry', {}).get('type')}, CoordLen={len(f.get('geometry', {}).get('coordinates', [[]])[0])}")
                    
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    main()

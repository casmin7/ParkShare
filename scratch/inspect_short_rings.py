import json
import urllib.request
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching features with short rings...")
    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=10000&srsname=EPSG:4326'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            
            count = 0
            for f in features:
                geom = f.get('geometry')
                if not geom or geom.get('type') != 'MultiLineString':
                    continue
                coords = geom.get('coordinates', [])
                if not coords:
                    continue
                ring = coords[0]
                if len(ring) < 4:
                    count += 1
                    print(f"\nShort Ring Feature {count}:")
                    print("  ID:", f.get('id'))
                    print("  Properties:", f.get('properties'))
                    print("  Coordinates:", ring)
                    if count >= 10:
                        break
            
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    main()

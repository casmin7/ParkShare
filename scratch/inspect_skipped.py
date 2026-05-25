import urllib.request
import json
import ssl
from collections import Counter

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching 1000 features from nparking_parcari_linii...")
    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=1000&srsname=EPSG:4326'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            print("Fetched:", len(features))
            
            geom_types = Counter()
            lengths = Counter()
            skipped_reasons = Counter()
            
            for f in features:
                geom = f.get('geometry')
                if not geom:
                    skipped_reasons["No geometry"] += 1
                    continue
                gtype = geom.get('type')
                geom_types[gtype] += 1
                
                coords = geom.get('coordinates', [])
                if not coords:
                    skipped_reasons["Empty coordinates"] += 1
                    continue
                
                if gtype == 'MultiLineString':
                    ring = coords[0]
                    lengths[len(ring)] += 1
                    if len(ring) < 4:
                        skipped_reasons["Ring length < 4"] += 1
                elif gtype == 'LineString':
                    lengths[len(coords)] += 1
                    if len(coords) < 4:
                        skipped_reasons["LineString length < 4"] += 1
                else:
                    skipped_reasons[f"Other geometry type ({gtype})"] += 1
                    
            print("\nGeometry types:")
            for k, v in geom_types.items():
                print(f"  {k}: {v}")
                
            print("\nLine/Ring lengths (number of vertices):")
            for k in sorted(lengths.keys()):
                print(f"  Length {k}: {lengths[k]} occurrences")
                
            print("\nReasons for skip in current fetch_s4_real_data.py logic:")
            for k, v in skipped_reasons.items():
                print(f"  {k}: {v}")
                
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    main()

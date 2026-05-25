import json
import urllib.request
import ssl
import sys

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching ALL features from nparking_parcari_linii (maxFeatures=100000)...")
    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=120) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            total = len(features)
            print(f"Fetched {total} features.")
            
            skipped_geom_none = 0
            skipped_not_multiline = 0
            skipped_empty_coords = 0
            skipped_ring_short = 0
            
            geom_types = {}
            for f in features:
                geom = f.get('geometry')
                if not geom:
                    skipped_geom_none += 1
                    continue
                
                gtype = geom.get('type')
                geom_types[gtype] = geom_types.get(gtype, 0) + 1
                
                if gtype != 'MultiLineString':
                    skipped_not_multiline += 1
                    continue
                    
                coords = geom.get('coordinates', [])
                if not coords or len(coords) == 0:
                    skipped_empty_coords += 1
                    continue
                    
                ring = coords[0]
                if not ring or len(ring) < 4:
                    skipped_ring_short += 1
                    continue
            
            print(f"\nSkipped stats:")
            print(f"  Total: {total}")
            print(f"  Skipped (Geometry None): {skipped_geom_none}")
            print(f"  Skipped (Not MultiLineString): {skipped_not_multiline}")
            print(f"  Skipped (Empty coordinates): {skipped_empty_coords}")
            print(f"  Skipped (Ring length < 4): {skipped_ring_short}")
            print(f"  Total skipped: {skipped_geom_none + skipped_not_multiline + skipped_empty_coords + skipped_ring_short}")
            print(f"  Geometry types: {geom_types}")
            
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    main()

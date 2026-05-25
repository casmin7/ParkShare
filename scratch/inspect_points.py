import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching points...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))

    target_ids = ["nparking_parcari_resedinta.fid-4db8828f_19e55eb5b00_4fa6",
                  "nparking_parcari_resedinta.fid-4db8828f_19e56776eb0_-64af",
                  "nparking_parcari_resedinta.fid-4db8828f_19e55eb5b00_74b6",
                  "nparking_parcari_resedinta.fid-4db8828f_19e56776eb0_18ac"]

    features = res_data.get('features', [])
    for f in features:
        fid = f.get('id')
        if fid in target_ids:
            print(f"\nFound Point ID: {fid}")
            print(f"  Properties: {f.get('properties')}")
            print(f"  Coords: {f.get('geometry', {}).get('coordinates')}")

if __name__ == '__main__':
    main()

import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    target_ids = ['nparking_parcari_linii.34373', 'nparking_parcari_linii.34370']
    
    for f in lines_data.get('features', []):
        fid = f.get('id')
        if fid in target_ids:
            print(f"\nFeature ID: {fid}")
            print(f"  Properties: {f.get('properties')}")
            print(f"  Coords: {f['geometry']['coordinates'][0]}")

if __name__ == '__main__':
    main()

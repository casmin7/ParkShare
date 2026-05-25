import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching lines...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    target_ids = ["nparking_parcari_linii.2818", "nparking_parcari_linii.64746",
                  "nparking_parcari_linii.2816", "nparking_parcari_linii.64747",
                  "nparking_parcari_linii.2814", "nparking_parcari_linii.64748",
                  "nparking_parcari_linii.2810", "nparking_parcari_linii.64749"]

    features = lines_data.get('features', [])
    for f in features:
        fid = f.get('id')
        if fid in target_ids:
            print(f"\nFound Feature ID: {fid}")
            print(f"  Properties: {f.get('properties')}")
            geom = f.get('geometry')
            print(f"  Geom Type: {geom.get('type')}")
            ring = geom.get('coordinates')[0]
            print(f"  Is Closed Loop: {len(ring) >= 4 and ring[0] == ring[-1]}")
            print(f"  Coords: {ring}")

if __name__ == '__main__':
    main()

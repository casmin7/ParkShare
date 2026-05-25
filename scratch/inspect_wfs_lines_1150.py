import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching raw lines for Battery 1150 region...")
    # Fetch lines near Lat 44.384 to 44.3855, Lng 26.1305 to 26.1325
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    features = lines_data.get('features', [])
    print(f"Total raw lines: {len(features)}")
    
    target_ids = ['nparking_parcari_linii.64778', 'nparking_parcari_linii.49198', 'nparking_parcari_linii.49241']
    for f in features:
        fid = f.get('id')
        if fid in target_ids:
            props = f.get('properties')
            geom = f.get('geometry')
            print(f"ID={fid} Props={props} Geotype={geom['type']}")
            print(f"  Coords: {geom['coordinates']}")

if __name__ == '__main__':
    main()

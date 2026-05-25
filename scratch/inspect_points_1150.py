import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching residential points...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))

    features = res_data.get('features', [])
    b1150 = []
    for f in features:
        props = f.get('properties', {})
        bat = props.get('parcare_arondata')
        if str(bat) == '1150':
            b1150.append(f)
            
    print(f"Total residential points for Battery 1150: {len(b1150)}")
    
    # Sort by number
    b1150.sort(key=lambda x: int(x['properties'].get('nr_parcare', 0)) if str(x['properties'].get('nr_parcare', '')).isdigit() else 999)
    for f in b1150:
        props = f['properties']
        print(f"PointID={f.get('id')} Num={props.get('nr_parcare')} Coords={f['geometry']['coordinates']}")

if __name__ == '__main__':
    main()

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

    print("Fetching public points...")
    pub_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_publice&outputFormat=application/json&maxFeatures=20000&srsname=EPSG:4326'
    req_pub = urllib.request.Request(pub_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_pub, context=ctx) as response:
        pub_data = json.loads(response.read().decode('utf-8'))

    active_res = set()
    for f in res_data.get('features', []):
        pt_props = f.get('properties', {})
        bat = str(pt_props.get('parcare_arondata') or '')
        if bat:
            active_res.add(bat)

    active_pub = set()
    for f in pub_data.get('features', []):
        pt_props = f.get('properties', {})
        bat = str(pt_props.get('id_parcare') or '')
        if bat:
            active_pub.add(bat)

    print("Active residential batteries:", len(active_res))
    print("Active public batteries:", len(active_pub))

    for b in ['270', '272', '3002', '4173', '8213', '8280', '237']:
        in_res = b in active_res
        in_pub = b in active_pub
        print(f"Battery {b}: Res={in_res}, Pub={in_pub}")

if __name__ == '__main__':
    main()

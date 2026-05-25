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
    
    # We filter for Battery 1150 points in the region Lng [26.1310, 26.1322], Lat [44.3843, 44.3852]
    nearby_pts = []
    for f in features:
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            coords = geom['coordinates']
            lng, lat = coords[0], coords[1]
            if 44.3843 <= lat <= 44.3852 and 26.1310 <= lng <= 26.1322:
                props = f.get('properties', {})
                bat = props.get('parcare_arondata')
                if str(bat) == '1150':
                    nearby_pts.append(f)
                    
    print(f"Total points in target region: {len(nearby_pts)}")
    nearby_pts.sort(key=lambda x: int(x['properties'].get('nr_parcare', 0)) if str(x['properties'].get('nr_parcare', '')).isdigit() else 999)
    for f in nearby_pts:
        props = f['properties']
        print(f"PointID={f.get('id')} Num={props.get('nr_parcare')} tip_loc={props.get('tip_loc')} Coords={f['geometry']['coordinates']} Active={props.get('active')} Display={props.get('display')}")

if __name__ == '__main__':
    main()

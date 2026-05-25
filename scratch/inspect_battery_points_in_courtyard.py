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

    features = res_data.get('features', [])
    
    # BBox: Lat [44.3850, 44.3865], Lng [26.1020, 26.1045]
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045
    
    in_cy = []
    for f in features:
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            coords = geom['coordinates']
            lng, lat = coords[0], coords[1]
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                in_cy.append(f)
                
    print(f"Total points in courtyard BBox: {len(in_cy)}")
    
    # Group by parcare_arondata
    groups = {}
    for f in in_cy:
        props = f['properties']
        bat = str(props.get('parcare_arondata') or 'None')
        if bat not in groups:
            groups[bat] = []
        groups[bat].append(f)
        
    for bat, feats in groups.items():
        feats.sort(key=lambda x: int(x['properties'].get('nr_parcare', 0)) if str(x['properties'].get('nr_parcare', '')).isdigit() else 999)
        print(f"\nBattery {bat}: {len(feats)} points")
        for f in feats:
            props = f['properties']
            print(f"  ID={f.get('id')} Num={props.get('nr_parcare')} Coords={f['geometry']['coordinates']}")

if __name__ == '__main__':
    main()

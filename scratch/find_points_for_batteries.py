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

    target_batteries = [270, 272, 3002, 4002, 4173, 237]
    features = res_data.get('features', [])
    
    matches = []
    for f in features:
        props = f.get('properties', {})
        bat = props.get('parcare_arondata')
        if bat in target_batteries:
            matches.append(f)
            
    print(f"Total matching points: {len(matches)}")
    # Print the ones located inside the courtyard bounding box:
    # Lat 44.3850 to 44.3865, Lng 26.1020 to 26.1045
    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045
    
    in_bbox = []
    for f in matches:
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            lng, lat = geom['coordinates']
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                in_bbox.append(f)
                
    print(f"Matching points in courtyard: {len(in_bbox)}")
    in_bbox.sort(key=lambda x: (x['properties'].get('parcare_arondata'), int(x['properties'].get('nr_parcare', 0)) if str(x['properties'].get('nr_parcare', '')).isdigit() else 999))
    
    for f in in_bbox:
        props = f['properties']
        print(f"ID={f.get('id')} Bat={props.get('parcare_arondata')} Num={props.get('nr_parcare')} Coords={f['geometry']['coordinates']}")

if __name__ == '__main__':
    main()

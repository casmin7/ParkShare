import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    min_lat, max_lat = 44.3853, 44.3861
    min_lng, max_lng = 26.1026, 26.1040

    print("Fetching points...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))

    features = res_data.get('features', [])
    in_cy = []
    for f in features:
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            lng, lat = geom['coordinates']
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                in_cy.append(f)

    print(f"Total points in courtyard: {len(in_cy)}")
    # Sort by Lng
    in_cy.sort(key=lambda x: x['geometry']['coordinates'][0])
    for f in in_cy:
        print(f"ID={f.get('id')} Properties={f.get('properties')} Coords={f['geometry']['coordinates']}")

if __name__ == '__main__':
    main()

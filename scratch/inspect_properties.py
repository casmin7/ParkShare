import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching one residential point...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=1&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        if res_data.get('features'):
            feat = res_data['features'][0]
            print("Point ID:", feat.get('id'))
            print("Point Properties:", list(feat.get('properties', {}).keys()))
            print("Point Properties Details:", feat.get('properties'))

    print("\nFetching one line...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=1&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))
        if lines_data.get('features'):
            feat = lines_data['features'][0]
            print("Line ID:", feat.get('id'))
            print("Line Properties:", list(feat.get('properties', {}).keys()))
            print("Line Properties Details:", feat.get('properties'))

if __name__ == '__main__':
    main()

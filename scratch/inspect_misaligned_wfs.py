import urllib.request
import json
import ssl
import math

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching WFS lines...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    target_ids = {
        'nparking_parcari_linii.43433',
        'nparking_parcari_linii.43434',
        'nparking_parcari_linii.43435',
        'nparking_parcari_linii.43436',
        'nparking_parcari_linii.43437',
        'nparking_parcari_linii.67288',
        'nparking_parcari_linii.67243',
        'nparking_parcari_linii.2754',
        'nparking_parcari_linii.2755',
        'nparking_parcari_linii.2756'
    }

    for f in lines_data.get('features', []):
        fid = f.get('id')
        if fid in target_ids:
            geom = f.get('geometry')
            print(f"ID={fid} type={geom['type']} properties={f.get('properties')}")
            if geom['type'] == 'MultiLineString':
                ring = geom['coordinates'][0]
                is_closed = len(ring) >= 4 and ring[0] == ring[-1]
                print(f"  Closed={is_closed} CoordCount={len(ring)} Coordinates={ring}")

if __name__ == '__main__':
    main()

import urllib.request
import json
import ssl
import math

def get_centroid(coords):
    ring = coords[0]
    lats = [c[1] for c in ring]
    lngs = [c[0] for c in ring]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Fetching points...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))

    pts = []
    for f in res_data.get('features', []):
        pt_props = f.get('properties', {})
        bat = str(pt_props.get('parcare_arondata') or '')
        if bat == '2990':
            lng, lat = f['geometry']['coordinates']
            pts.append({
                'id': f.get('id'),
                'num': pt_props.get('nr_parcare'),
                'lat': lat,
                'lng': lng
            })

    print(f"Found {len(pts)} points for Battery 2990")
    for pt in sorted(pts, key=lambda x: int(x['num']) if str(x['num']).isdigit() else 999):
        print(f"Point Num={pt['num']} Coords=[{pt['lat']:.6f}, {pt['lng']:.6f}]")

    print("\nFetching lines near these points...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    features = lines_data.get('features', [])
    for pt in pts:
        print(f"\nLines near Point Num={pt['num']} Coords=[{pt['lat']:.6f}, {pt['lng']:.6f}]:")
        nearby = []
        for f in features:
            geom = f.get('geometry')
            if geom and geom['type'] == 'MultiLineString':
                ring = geom['coordinates'][0]
                cent_lat, cent_lng = get_centroid(geom['coordinates'])
                dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
                if dist < 0.00015: # ~16 meters
                    nearby.append((f, dist, cent_lat, cent_lng))
        
        nearby.sort(key=lambda x: x[1])
        for f, dist, clat, clng in nearby[:5]:
            ring = f['geometry']['coordinates'][0]
            is_closed = len(ring) >= 4 and ring[0] == ring[-1]
            p1 = ring[0]
            p2 = ring[-1]
            dx = (p2[0]-p1[0])*79300
            dy = (p2[1]-p1[1])*111000
            length = math.sqrt(dx**2 + dy**2)
            angle = math.degrees(math.atan2(dy, dx))
            print(f"  Line ID={f.get('id')} Dist={dist:.6f} Closed={is_closed} Len={length:.2f}m Angle={angle:.1f}° Simbol={f['properties'].get('Simbol')} Numar={f['properties'].get('Numar Loc')}")

if __name__ == '__main__':
    main()

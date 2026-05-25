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

    min_lat, max_lat = 44.3853, 44.3861
    min_lng, max_lng = 26.1026, 26.1040

    print("Fetching lines...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    features = lines_data.get('features', [])
    in_cy = []
    for f in features:
        geom = f.get('geometry')
        if geom and geom['type'] == 'MultiLineString':
            ring = geom['coordinates'][0]
            lat, lng = get_centroid(geom['coordinates'])
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                in_cy.append(f)

    print(f"Total lines in central courtyard: {len(in_cy)}")
    
    # Print them all sorted by Lng
    in_cy.sort(key=lambda x: get_centroid(x['geometry']['coordinates'])[1])
    for f in in_cy:
        fid = f.get('id')
        props = f.get('properties')
        ring = f['geometry']['coordinates'][0]
        is_closed = len(ring) >= 4 and ring[0] == ring[-1]
        lat, lng = get_centroid(f['geometry']['coordinates'])
        
        # Calculate length of first edge
        p1, p2 = ring[0], ring[1]
        lat_rad = math.radians(lat)
        scale_lat = 111000.0
        scale_lng = 111000.0 * math.cos(lat_rad)
        dx = (p2[0]-p1[0])*scale_lng
        dy = (p2[1]-p1[1])*scale_lat
        edge_len = math.sqrt(dx**2 + dy**2)
        
        print(f"ID={fid} Closed={is_closed} Props={props} Centroid=[{lat:.6f}, {lng:.6f}] FirstEdge={edge_len:.2f}m")

if __name__ == '__main__':
    main()

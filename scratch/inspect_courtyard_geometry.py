import urllib.request
import json
import ssl
import sys
import math

def get_centroid(coords, is_multiline=True):
    if is_multiline:
        ring = coords[0]
    else:
        ring = coords
    lats = [c[1] for c in ring]
    lngs = [c[0] for c in ring]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    # Fetch residential points in the area
    print("Fetching points...")
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        
    points_in_cy = []
    for f in res_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            lng, lat = geom['coordinates']
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                points_in_cy.append(f)
                
    print(f"Points in courtyard: {len(points_in_cy)}")

    # Fetch lines in the area
    print("Fetching lines...")
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    lines_in_cy = []
    for f in lines_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'MultiLineString':
            ring = geom['coordinates'][0]
            lat, lng = get_centroid(geom['coordinates'], is_multiline=True)
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                lines_in_cy.append(f)

    print(f"Lines in courtyard: {len(lines_in_cy)}")

    # Let's see how many open and closed lines
    closed = []
    open_lines = []
    for f in lines_in_cy:
        ring = f['geometry']['coordinates'][0]
        if len(ring) >= 4 and ring[0] == ring[-1]:
            closed.append(f)
        else:
            open_lines.append(f)

    print(f"  Closed lines: {len(closed)}")
    print(f"  Open lines: {len(open_lines)}")

    # Let's analyze open lines: length and orientation
    print("\nAnalyzing open lines in courtyard:")
    for f in open_lines:
        ring = f['geometry']['coordinates'][0]
        p1 = ring[0]
        p2 = ring[-1]
        lngA, latA = p1[0], p1[1]
        lngB, latB = p2[0], p2[1]
        
        lat = (latA + latB) / 2.0
        lat_rad = math.radians(lat)
        scale_lat = 111000.0
        scale_lng = 111000.0 * math.cos(lat_rad)
        
        dx_m = (lngB - lngA) * scale_lng
        dy_m = (latB - latA) * scale_lat
        d_m = math.sqrt(dx_m**2 + dy_m**2)
        
        angle_rad = math.atan2(dy_m, dx_m)
        angle_deg = math.degrees(angle_rad)
        
        props = f.get('properties', {})
        simbol = props.get('Simbol', '')
        numar = props.get('Numar Loc', '')
        
        print(f"  ID={f.get('id')} Simbol={simbol} Num={numar} Len={d_m:.2f}m Angle={angle_deg:.1f}° Start=[{latA:.6f},{lngA:.6f}] End=[{latB:.6f},{lngB:.6f}]")

if __name__ == '__main__':
    main()

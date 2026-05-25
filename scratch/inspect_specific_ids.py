import json
import math

def get_centroid(coords):
    ring = coords[0]
    lats = [c[1] for c in ring]
    lngs = [c[0] for c in ring]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

def get_approx_angle(ring):
    p1 = ring[0]
    p2 = ring[1]
    lngA, latA = p1[0], p1[1]
    lngB, latB = p2[0], p2[1]
    
    lat = (latA + latB) / 2.0
    lat_rad = math.radians(lat)
    scale_lat = 111000.0
    scale_lng = 111000.0 * math.cos(lat_rad)
    
    dx_m = (lngB - lngA) * scale_lng
    dy_m = (latB - latA) * scale_lat
    return math.degrees(math.atan2(dy_m, dx_m))

def main():
    s4_file = 's4_polygons.json'
    with open(s4_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for f in data.get('features', []):
        props = f['properties']
        fid = props.get('id', '')
        if '34371' in fid or '34372' in fid or '67071' in fid or '67072' in fid or '64750' in fid or '64751' in fid or '64752' in fid or '64753' in fid or '64754' in fid or '64755' in fid or '64756' in fid or '64757' in fid or '64758' in fid or '64759' in fid:
            coords = f['geometry']['coordinates']
            lat, lng = get_centroid(coords)
            angle = get_approx_angle(coords[0])
            print(f"Target Feature: ID={fid} Num={props.get('numar')} Bat={props.get('baterie')} Centroid=[{lat:.6f}, {lng:.6f}] Angle={angle:.1f}°")

if __name__ == '__main__':
    main()

import urllib.request
import json
import ssl
import sys
import math

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    min_lat, max_lat = 44.3850, 44.3865
    min_lng, max_lng = 26.1020, 26.1045

    # Fetch residential points
    res_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx) as response:
        res_data = json.loads(response.read().decode('utf-8'))
        
    point_grid = {}
    for f in res_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'Point':
            lng, lat = geom['coordinates']
            pt_id = f.get('id', '')
            pt_info = {
                'id': pt_id,
                'lat': lat,
                'lng': lng,
                'type': 'residential',
                'properties': f.get('properties', {})
            }
            key = (round(lat, 4), round(lng, 4))
            if key not in point_grid:
                point_grid[key] = []
            point_grid[key].append(pt_info)

    # Fetch lines
    lines_url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req_lines = urllib.request.Request(lines_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_lines, context=ctx) as response:
        lines_data = json.loads(response.read().decode('utf-8'))

    closed_lines = []
    open_lines = []
    for f in lines_data.get('features', []):
        geom = f.get('geometry')
        if geom and geom['type'] == 'MultiLineString':
            ring = geom['coordinates'][0]
            lat, lng = sum(c[1] for c in ring)/len(ring), sum(c[0] for c in ring)/len(ring)
            if min_lat <= lat <= max_lat and min_lng <= lng <= max_lng:
                if len(ring) >= 4 and ring[0] == ring[-1]:
                    closed_lines.append(f)
                else:
                    open_lines.append(f)

    # Helper to find nearest point in grid
    def find_nearest_point(cent_lat, cent_lng):
        lat_bucket = round(cent_lat, 4)
        lng_bucket = round(cent_lng, 4)
        best_pt = None
        min_dist = 999999.0
        
        for d_lat in [-0.0001, 0, 0.0001]:
            for d_lng in [-0.0001, 0, 0.0001]:
                key = (round(lat_bucket + d_lat, 4), round(lng_bucket + d_lng, 4))
                if key in point_grid:
                    for pt in point_grid[key]:
                        dist = math.sqrt((pt['lat'] - cent_lat)**2 + (pt['lng'] - cent_lng)**2)
                        if dist < min_dist:
                            min_dist = dist
                            best_pt = pt
        return best_pt, min_dist

    # Phase 1: Closed lines matches
    matched_points = {}
    for f in closed_lines:
        ring = f['geometry']['coordinates'][0]
        cent_lat = sum(c[1] for c in ring) / len(ring)
        cent_lng = sum(c[0] for c in ring) / len(ring)
        best_pt, min_dist = find_nearest_point(cent_lat, cent_lng)
        if best_pt and min_dist < 0.00008:
            matched_points[best_pt['id']] = {'line_id': f.get('id'), 'type': 'closed'}

    # Phase 2: Open lines matches
    print(f"Open lines in courtyard: {len(open_lines)}")
    for f in open_lines:
        ring = f['geometry']['coordinates'][0]
        cent_lat = sum(c[1] for c in ring) / len(ring)
        cent_lng = sum(c[0] for c in ring) / len(ring)
        best_pt, min_dist = find_nearest_point(cent_lat, cent_lng)
        
        p1 = ring[0]
        p2 = ring[-1]
        lngA, latA = p1[0], p1[1]
        lngB, latB = p2[0], p2[1]
        lat_rad = math.radians(cent_lat)
        scale_lat = 111000.0
        scale_lng = 111000.0 * math.cos(lat_rad)
        dx_m = (lngB - lngA) * scale_lng
        dy_m = (latB - latA) * scale_lat
        d_m = math.sqrt(dx_m**2 + dy_m**2)
        angle = math.degrees(math.atan2(dy_m, dx_m))
        
        status = "No point nearby"
        if best_pt:
            pt_id = best_pt['id']
            if min_dist < 0.00008:
                if pt_id in matched_points:
                    status = f"Point {pt_id} already matched to closed line {matched_points[pt_id]['line_id']}"
                else:
                    status = f"MATCHED to point {pt_id} (dist={min_dist:.6f} degrees)"
            else:
                status = f"Point {pt_id} too far (dist={min_dist:.6f} degrees)"
                
        print(f"Line ID={f.get('id')} Len={d_m:.2f}m Angle={angle:.1f}° status: {status}")

if __name__ == '__main__':
    main()

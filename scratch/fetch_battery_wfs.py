import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# We will fetch lines and points for battery '270' and '3002'
for bat in ['270', '3002']:
    print(f"\n================ BATTERY {bat} ================")
    
    # 1. Fetch lines matching Simbol = bat
    url_lines = f"https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&srsname=EPSG:4326&cql_filter=Simbol='{bat}'"
    print(f"Fetching lines for battery {bat}...")
    req = urllib.request.Request(url_lines, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            lines_data = json.loads(r.read().decode('utf-8'))
            lines = lines_data.get('features', [])
            print(f"Fetched {len(lines)} lines.")
    except Exception as e:
        print("Error fetching lines:", e)
        lines = []

    # 2. Fetch points matching parcare_arondata = bat
    url_points = f"https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&srsname=EPSG:4326&cql_filter=parcare_arondata='{bat}'"
    print(f"Fetching points for battery {bat}...")
    req_pts = urllib.request.Request(url_points, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req_pts, context=ctx, timeout=30) as r:
            pts_data = json.loads(r.read().decode('utf-8'))
            pts = pts_data.get('features', [])
            print(f"Fetched {len(pts)} points.")
    except Exception as e:
        print("Error fetching points:", e)
        pts = []

    # 3. Analyze geometries of lines
    print("\nGeometry details of lines:")
    geom_types = {}
    open_lines = []
    closed_loops = []
    for f in lines:
        g = f.get('geometry')
        if not g: continue
        t = g.get('type')
        geom_types[t] = geom_types.get(t, 0) + 1
        if t == 'MultiLineString':
            coords = g.get('coordinates', [])
            if coords:
                ring = coords[0]
                is_closed = (ring[0] == ring[-1]) and len(ring) >= 4
                info = {
                    'id': f.get('id'),
                    'num': f['properties'].get('Numar Loc'),
                    'coords_count': len(ring),
                    'is_closed': is_closed,
                    'start': ring[0],
                    'end': ring[-1]
                }
                if is_closed:
                    closed_loops.append(info)
                else:
                    open_lines.append(info)

    print(f"Geometry types: {geom_types}")
    print(f"Closed loops: {len(closed_loops)}")
    print(f"Open line segments: {len(open_lines)}")
    
    if open_lines:
        print("Sample open lines:")
        for ol in open_lines[:5]:
            print(f"  ID={ol['id']} Num={ol['num']} Coords count={ol['coords_count']} Start={ol['start']} End={ol['end']}")
    
    if closed_loops:
        print("Sample closed loops:")
        for cl in closed_loops[:5]:
            print(f"  ID={cl['id']} Num={cl['num']} Coords count={cl['coords_count']} Start={cl['start']} End={cl['end']}")

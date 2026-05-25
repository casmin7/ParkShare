import urllib.request
import json
import ssl
import sys

sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
print("Fetching all lines from WFS...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=120) as response:
        data = json.loads(response.read().decode('utf-8'))
        features = data.get('features', [])
        print(f"Successfully fetched {len(features)} lines.")
        
        # Analyze why lines are skipped
        total = len(features)
        not_multiline = 0
        no_coords = 0
        empty_ring = 0
        short_ring = 0
        closed_loop = 0
        open_line = 0
        
        # Courtyard bbox to see if any lines in courtyard are skipped!
        min_lat, max_lat = 44.3850, 44.3865
        min_lng, max_lng = 26.1020, 26.1045
        skipped_in_courtyard = []
        
        for f in features:
            geom = f.get('geometry')
            if not geom:
                no_coords += 1
                continue
            t = geom.get('type')
            if t != 'MultiLineString':
                not_multiline += 1
                continue
            coords = geom.get('coordinates', [])
            if not coords or len(coords) == 0:
                empty_ring += 1
                continue
            ring = coords[0]
            if not ring or len(ring) < 2:
                empty_ring += 1
                continue
                
            # Centroid to check if in courtyard
            lats = [c[1] for c in ring]
            lngs = [c[0] for c in ring]
            cent_lat = sum(lats) / len(lats)
            cent_lng = sum(lngs) / len(lngs)
            in_courtyard = min_lat <= cent_lat <= max_lat and min_lng <= cent_lng <= max_lng
            
            if len(ring) < 4:
                short_ring += 1
                if in_courtyard:
                    skipped_in_courtyard.append(f)
                continue
            
            is_closed = (ring[0] == ring[-1])
            if is_closed:
                closed_loop += 1
            else:
                open_line += 1
                if in_courtyard:
                    skipped_in_courtyard.append(f)

        print("\nAnalysis of WFS lines:")
        print(f"  Total features: {total}")
        print(f"  Not MultiLineString: {not_multiline}")
        print(f"  No coordinates/geometry: {no_coords}")
        print(f"  Empty coordinates: {empty_ring}")
        print(f"  Short ring (len < 4): {short_ring}")
        print(f"  Closed loops (len >= 4): {closed_loop}")
        print(f"  Open lines (len >= 4): {open_line}")
        print(f"  Skipped in courtyard: {len(skipped_in_courtyard)}")
        
        if skipped_in_courtyard:
            print("\nSample of skipped features in courtyard:")
            for f in skipped_in_courtyard[:10]:
                print(f"  ID={f.get('id')} Properties={f.get('properties')} CoordsCount={len(f['geometry']['coordinates'][0])}")
except Exception as e:
    print("Error:", e)

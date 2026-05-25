import urllib.request
import json
import ssl

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    print("Checking residential WFS for baterie/parcare '386'...")
    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            matched_pts = [f for f in features if str(f.get('properties', {}).get('parcare_arondata')) == '386']
            print(f"Found {len(matched_pts)} points in resedinta layer with parcare_arondata '386'")
            if matched_pts:
                print("First point sample props:", matched_pts[0].get('properties'))
                print("First point coords:", matched_pts[0].get('geometry', {}).get('coordinates'))
    except Exception as e:
        print("Failed resedinta search:", e)

    print("\nChecking lines WFS for Simbol/Numar Loc with Simbol '386'...")
    url = 'https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0&request=GetFeature&typeName=Sector4_city:nparking_parcari_linii&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
            features = data.get('features', [])
            matched_lines = [f for f in features if str(f.get('properties', {}).get('Simbol')) == '386']
            print(f"Found {len(matched_lines)} lines in linii layer with Simbol '386'")
            if matched_lines:
                print("First line sample props:", matched_lines[0].get('properties'))
                print("First line geom type:", matched_lines[0].get('geometry', {}).get('type'))
                coords = matched_lines[0].get('geometry', {}).get('coordinates', [])
                print("First line coords length:", len(coords))
                if coords:
                    print("First line coords:", coords[0])
    except Exception as e:
        print("Failed lines search:", e)

if __name__ == "__main__":
    main()

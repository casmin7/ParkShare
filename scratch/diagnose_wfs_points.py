"""
Deep analysis of WFS raw data vs generated output.
Focus on:
1. How many points actually exist in WFS (are there duplicates?)
2. What percentage of closed lines matched to points?
3. Check Battery 1150 specifically for duplicate points
"""
import urllib.request
import json
import ssl
import math

def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # Fetch residential points
    print("Fetching residential points...")
    res_url = ('https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0'
               '&request=GetFeature&typeName=Sector4_city:nparking_parcari_resedinta'
               '&outputFormat=application/json&maxFeatures=100000&srsname=EPSG:4326')
    req = urllib.request.Request(res_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=60) as response:
        res_data = json.loads(response.read().decode('utf-8'))
    res_features = res_data.get('features', [])
    print(f"Total residential features from WFS: {len(res_features)}")

    # Check for duplicate (battery, number) pairs in the raw WFS data
    point_keys = {}  # (bat, num) -> list of features
    for f in res_features:
        props = f.get('properties', {})
        bat = str(props.get('parcare_arondata') or '').strip()
        num = str(props.get('nr_parcare') or '').strip()
        if bat and num:
            key = (bat, num)
            point_keys.setdefault(key, []).append(f)

    # How many unique (battery, number) pairs?
    total_keys = len(point_keys)
    dup_keys = {k: v for k, v in point_keys.items() if len(v) > 1}
    print(f"\nUnique (battery, number) pairs: {total_keys}")
    print(f"Duplicate pairs in WFS: {len(dup_keys)}")
    
    if dup_keys:
        print("\nSample duplicates:")
        for k, feats in list(dup_keys.items())[:10]:
            coords_list = []
            for f in feats:
                c = f['geometry']['coordinates']
                coords_list.append(f"[{c[0]:.6f}, {c[1]:.6f}]")
            print(f"  Battery {k[0]} Spot {k[1]}: {len(feats)} points at {', '.join(coords_list)}")
    
    # Check battery 1150 specifically
    print("\n=== BATTERY 1150 DETAIL ===")
    b1150_points = {}
    for f in res_features:
        props = f.get('properties', {})
        bat = str(props.get('parcare_arondata') or '').strip()
        num = str(props.get('nr_parcare') or '').strip()
        if bat == '1150':
            b1150_points.setdefault(num, []).append(f)
    
    print(f"Unique spot numbers in Battery 1150: {len(b1150_points)}")
    total_1150 = sum(len(v) for v in b1150_points.values())
    print(f"Total points in Battery 1150: {total_1150}")
    
    dup_1150 = {k: v for k, v in b1150_points.items() if len(v) > 1}
    if dup_1150:
        print(f"Duplicate spot numbers: {len(dup_1150)}")
        for num, feats in sorted(dup_1150.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 999):
            coords_list = []
            for f in feats:
                c = f['geometry']['coordinates']
                coords_list.append(f"[{c[0]:.6f}, {c[1]:.6f}]")
            print(f"  Spot {num}: {len(feats)} points at {', '.join(coords_list)}")
    else:
        print("No duplicate spot numbers in Battery 1150")
    
    # Fetch public points
    print("\nFetching public points...")
    pub_url = ('https://gs1.mobilitateurbana4.ro/?service=WFS&version=1.0.0'
               '&request=GetFeature&typeName=Sector4_city:nparking_parcari_publice'
               '&outputFormat=application/json&maxFeatures=20000&srsname=EPSG:4326')
    req2 = urllib.request.Request(pub_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2, context=ctx, timeout=60) as response:
        pub_data = json.loads(response.read().decode('utf-8'))
    pub_features = pub_data.get('features', [])
    print(f"Total public features from WFS: {len(pub_features)}")
    
    pub_keys = {}
    for f in pub_features:
        props = f.get('properties', {})
        bat = str(props.get('id_parcare') or '').strip()
        num = str(props.get('nr_parcare') or '').strip()
        if bat and num:
            key = (bat, num)
            pub_keys.setdefault(key, []).append(f)
    
    pub_dups = {k: v for k, v in pub_keys.items() if len(v) > 1}
    print(f"Unique public (battery, number) pairs: {len(pub_keys)}")
    print(f"Duplicate public pairs: {len(pub_dups)}")
    
    # How many residential points have empty battery or number?
    empty_bat = sum(1 for f in res_features if not str(f.get('properties', {}).get('parcare_arondata') or '').strip())
    empty_num = sum(1 for f in res_features if not str(f.get('properties', {}).get('nr_parcare') or '').strip())
    print(f"\nResidential points with empty battery: {empty_bat}")
    print(f"Residential points with empty number: {empty_num}")
    
    # SUMMARY
    total_unique = total_keys + len(pub_keys)
    total_all = len(res_features) + len(pub_features)
    print(f"\n=== SUMMARY ===")
    print(f"Total WFS points: {total_all}")
    print(f"Total unique (bat,num) pairs: {total_unique}")
    print(f"Points without battery or number (orphans): {empty_bat + empty_num}")
    print(f"Our s4_polygons.json count: 70887")
    print(f"Difference: {70887 - total_all}")

if __name__ == '__main__':
    main()

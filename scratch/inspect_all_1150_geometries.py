import json

def main():
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    b1150 = [feat for feat in features if feat['properties'].get('baterie') == '1150']
    
    # Sort by ID or number
    b1150.sort(key=lambda x: int(x['properties'].get('numar', 0)) if str(x['properties'].get('numar', '')).isdigit() else 999)
    
    # We will print the properties and coordinates of the first few and some specific ones
    for feat in b1150:
        p = feat['properties']
        num = p.get('numar')
        coords = feat['geometry']['coordinates'][0]
        lat = sum(c[1] for c in coords)/len(coords)
        lng = sum(c[0] for c in coords)/len(coords)
        
        # Check if this spot is in the region shown in the screenshot
        # Lat [44.3843, 44.3852], Lng [26.1310, 26.1322]
        if 44.3843 <= lat <= 44.3852 and 26.1310 <= lng <= 26.1322:
            print(f"Num={num} ID={p.get('id')} Ocupat={p.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}]")
            print(f"  Coords: {coords}")

if __name__ == '__main__':
    main()

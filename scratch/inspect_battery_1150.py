import json

def main():
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    
    # Filter for battery 1150
    b1150 = [feat for feat in features if feat['properties'].get('baterie') == '1150']
    
    print(f"Total features for Battery 1150: {len(b1150)}")
    
    # Sort by number
    b1150.sort(key=lambda x: int(x['properties'].get('numar', 0)) if str(x['properties'].get('numar', '')).isdigit() else 999)
    
    for feat in b1150:
        p = feat['properties']
        coords = feat['geometry']['coordinates'][0]
        # Centroid
        lat = sum(c[1] for c in coords)/len(coords)
        lng = sum(c[0] for c in coords)/len(coords)
        print(f"ID={p.get('id')} Num={p.get('numar')} Ocupat={p.get('ocupat')} Centroid=[{lat:.6f}, {lng:.6f}] CoordsCount={len(coords)}")

if __name__ == '__main__':
    main()

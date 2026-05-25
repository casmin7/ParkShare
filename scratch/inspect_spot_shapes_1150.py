import json

def main():
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    
    target_ids = ['49198', '49241', '64778'] # Spot 6, Spot 9, Spot 105
    for feat in features:
        p = feat['properties']
        if p.get('id') in target_ids:
            print(f"ID={p.get('id')} Num={p.get('numar')} Bat={p.get('baterie')} Ocupat={p.get('ocupat')}")
            print(f"  Geometry: {feat['geometry']}")

if __name__ == '__main__':
    main()

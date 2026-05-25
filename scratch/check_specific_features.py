import json

def main():
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    target_ids = ['67059', '67060', '67061', '67062', '67063', '67064', '67065', '67066', '67067', '67068', '67069', '67070', '67071', '67072']
    
    for feat in data.get('features', []):
        fid = feat['properties'].get('id')
        if fid in target_ids:
            print(f"ID={fid} Props={feat['properties']} Geotype={feat['geometry']['type']}")

if __name__ == '__main__':
    main()

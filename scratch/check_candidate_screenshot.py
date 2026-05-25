import json

def main():
    with open('s4_polygons.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    features = data.get('features', [])
    print(f"Total features: {len(features)}")
    
    # We want to find a battery that has both spot number '9' and spot number '6',
    # where spot 6 might be handicap (ocupat = 3) and spot 9 might be free (ocupat = 0).
    candidates = {}
    for feat in features:
        props = feat['properties']
        bat = props.get('baterie')
        num = props.get('numar')
        ocupat = props.get('ocupat')
        if bat:
            if bat not in candidates:
                candidates[bat] = {}
            candidates[bat][num] = ocupat
            
    for bat, spots in candidates.items():
        if '9' in spots and '6' in spots:
            # Let's check status
            # If 6 is handicap (3 or 4) or if we just want to print batteries that have both 6 and 9
            # let's print their details if they are close to each other.
            status_6 = spots['6']
            status_9 = spots['9']
            if status_6 in (3, 4) or status_9 == 0:
                print(f"Candidate Battery: {bat}")
                print(f"  Spot 6 status: {status_6}, Spot 9 status: {status_9}")
                # Print coordinates of one of them
                for feat in features:
                    p = feat['properties']
                    if p.get('baterie') == bat and p.get('numar') in ('6', '9'):
                        coords = feat['geometry']['coordinates'][0]
                        print(f"    Spot {p.get('numar')}: Centroid={[sum(c[1] for c in coords)/len(coords), sum(c[0] for c in coords)/len(coords)]}")

if __name__ == '__main__':
    main()

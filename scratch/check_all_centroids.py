import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

s4_file = 's4_polygons.json'
with open(s4_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data.get('features', [])

def get_centroid(feat):
    coords = feat['geometry']['coordinates'][0]
    lats = [c[1] for c in coords]
    lngs = [c[0] for c in coords]
    return sum(lats)/len(lats), sum(lngs)/len(lngs)

for bat in ['270', '3002']:
    bat_feats = [feat for feat in features if feat['properties'].get('baterie') == bat]
    print(f"\nCentroids for Battery {bat} ({len(bat_feats)} features):")
    # Group by lat/lng range or print them all
    lats = []
    lngs = []
    for feat in bat_feats:
        lat, lng = get_centroid(feat)
        lats.append(lat)
        lngs.append(lng)
    print(f"  Lat range: [{min(lats):.6f}, {max(lats):.6f}]")
    print(f"  Lng range: [{min(lngs):.6f}, {max(lngs):.6f}]")
    # Print first 10 centroids
    for feat in bat_feats[:10]:
        lat, lng = get_centroid(feat)
        print(f"    Num={feat['properties'].get('numar')} Centroid=[{lat:.6f}, {lng:.6f}]")

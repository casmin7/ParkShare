import json

def main():
    path = "s4_polygons.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    features = data.get("features", [])
    print(f"Total features: {len(features)}")
    
    # Filter features near lat 44.3940, lng 26.1281
    near = []
    for f in features:
        geom = f.get("geometry", {})
        if not geom or geom.get("type") != "Polygon":
            continue
        coords = geom.get("coordinates", [])
        if not coords or len(coords) == 0:
            continue
        ring = coords[0]
        # centroid
        lats = [c[1] for c in ring]
        lngs = [c[0] for c in ring]
        c_lat = sum(lats) / len(lats)
        c_lng = sum(lngs) / len(lngs)
        
        if 44.3930 <= c_lat <= 44.3960 and 26.1260 <= c_lng <= 26.1300:
            near.append((f, c_lat, c_lng))
            
    print(f"Found {len(near)} features near Aleea Soldat Nicolae Barbu")
    for i, (f, c_lat, c_lng) in enumerate(near[:10]):
        print(f"\nFeature {i+1} near center: ({c_lat:.6f}, {c_lng:.6f})")
        print("Properties:", f.get("properties"))
        print("Coords:", f.get("geometry", {}).get("coordinates", [])[0])

if __name__ == "__main__":
    main()

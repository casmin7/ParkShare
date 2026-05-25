import json

def main():
    path = "s4_polygons.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    features = data.get("features", [])
    near = []
    for f in features:
        geom = f.get("geometry", {})
        if not geom or geom.get("type") != "Polygon":
            continue
        coords = geom.get("coordinates", [])
        if not coords or len(coords) == 0:
            continue
        ring = coords[0]
        lats = [c[1] for c in ring]
        lngs = [c[0] for c in ring]
        c_lat = sum(lats) / len(lats)
        c_lng = sum(lngs) / len(lngs)
        
        # Check if very close to 44.3937, 26.1278
        if 44.3930 <= c_lat <= 44.3945 and 26.1270 <= c_lng <= 26.1285:
            near.append((f, c_lat, c_lng))
            
    print(f"Found {len(near)} features close to battery 386 location")
    for i, (f, c_lat, c_lng) in enumerate(near[:20]):
        print(f"\nFeature {i+1} near center: ({c_lat:.6f}, {c_lng:.6f})")
        print("Properties:", f.get("properties"))
        print("Coords:", f.get("geometry", {}).get("coordinates", [])[0])

if __name__ == "__main__":
    main()

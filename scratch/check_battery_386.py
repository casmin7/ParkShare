import json

def main():
    path = "s4_polygons.json"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    features = data.get("features", [])
    matched = [f for f in features if f.get("properties", {}).get("baterie") == "386"]
    
    print(f"Found {len(matched)} features with baterie '386'")
    for i, f in enumerate(matched[:15]):
        print(f"\nFeature {i+1}:")
        print("  ID:", f.get("id"))
        print("  Properties:", f.get("properties"))
        print("  Coords:", f.get("geometry", {}).get("coordinates", [])[0])

if __name__ == "__main__":
    main()

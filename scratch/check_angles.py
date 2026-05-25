import re

def main():
    file_path = 'scratch/courtyard_polygons.txt'
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    outliers = []
    for line in lines:
        if not line.strip() or line.startswith("Total"):
            continue
        
        # Parse fields
        match = re.search(r"ID=(\S+)\s+Num=(\S+)\s+Bat=(\S+)\s+Ocupat=(\S+)\s+Centroid=\[(\S+),\s+(\S+)\]\s+Angle=(\S+)°", line)
        if match:
            fid, num, bat, ocupat, lat, lng, angle_str = match.groups()
            angle = float(angle_str)
            
            # Dominant angles are either parallel/perpendicular to the courtyard:
            # Let's say parallel to buildings is around 0 / 180 or maybe 24 / -156 or -66 / 114.
            # Let's compute the difference to nearest angle in {24, 114, -66, -156, -90, 0, 90, 180, -180}
            # Or we can just print the angles and inspect them.
            # Let's check how close it is to the nearest multiple of 90 degrees offset by 24 degrees (i.e. 24, 114, 204/ -156, -66)
            # or multiples of 90 degrees offset by 0 (i.e. 0, 90, 180, -90)
            
            # Let's compute min diff to angles:
            base_angles = [24.0, 114.0, -66.0, -156.0, 0.0, 90.0, 180.0, -90.0]
            diffs = [min(abs((angle - base) % 360), abs((base - angle) % 360)) for base in base_angles]
            min_diff = min(diffs)
            
            # Let's print everything that is more than 10 degrees away from these base angles
            # OR we can just print all features with their angles sorted by angle to inspect the distribution.
            outliers.append((angle, line.strip()))

    outliers.sort(key=lambda x: x[0])
    print(f"Total polygons in file: {len(outliers)}")
    print("\n--- Outliers/Polygons sorted by Angle ---")
    for angle, line in outliers:
        # Check if the angle is not near 24/-156 or -66/114 or 0/90/180/-90
        base_angles = [24.0, 114.0, -66.0, -156.0, 0.0, 90.0, 180.0, -90.0]
        diffs = [min(abs((angle - base) % 360), abs((base - angle) % 360)) for base in base_angles]
        min_diff = min(diffs)
        if min_diff > 12.0:
            print(f"DIFF={min_diff:.1f}° | {line}")

if __name__ == '__main__':
    main()

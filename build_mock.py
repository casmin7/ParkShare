import json
import os

md_path = r"C:\Users\andre\.gemini\antigravity\brain\ab08fb1f-5cfb-44c9-9347-c2ce859e54f1\.system_generated\steps\304\content.md"

with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

json_str = ""
for line in lines:
    if line.startswith('{"type":"FeatureCollection"'):
        json_str = line.strip()
        break

js_code = f"""
// Proj4js definition for Romanian Stereo 70 (EPSG:3844)
proj4.defs("EPSG:3844", "+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=2.329,-147.042,-92.08,0.309,-0.325,-0.497,5.69 +units=m +no_defs");

const officialData = {json_str};

const gisFeatures = [];
let sumLat = 0;
let sumLng = 0;
let pointCount = 0;

officialData.features.forEach(feature => {{
    const coords = feature.geometry.coordinates[0];
    const convertedCoords = coords.map(pt => {{
        // pt is [x, y] in EPSG:3844
        // proj4(from, to, point) -> returns [lng, lat]
        const wgs84 = proj4("EPSG:3844", "EPSG:4326", pt);
        sumLng += wgs84[0];
        sumLat += wgs84[1];
        pointCount++;
        return wgs84;
    }});
    
    let color = "#22c55e"; // free
    let statusStr = "free";
    if (feature.properties.ocupat > 0) {{
        color = "#ef4444"; // occupied
        statusStr = "occupied";
    }}
    if (feature.properties.mentiuni && feature.properties.mentiuni.toLowerCase().includes("dizabilitati")) {{
        color = "#3b82f6"; // blue for handicap
        statusStr = "handicap";
    }}

    gisFeatures.push({{
        type: "Feature",
        properties: {{
            spot_id: feature.properties.nr_loc_parcare || "Unknown",
            address: feature.properties.delimitare_zona || "Sector 3",
            status: statusStr,
            color: color
        }},
        geometry: {{
            type: "Polygon",
            coordinates: [convertedCoords]
        }}
    }});
}});

// Export the average center so we can flyTo it dynamically
window.demoCenter = pointCount > 0 ? [sumLat / pointCount, sumLng / pointCount] : [44.4248, 26.1805];

const sector3GeoJSON = {{
    type: "FeatureCollection",
    features: gisFeatures
}};
"""

with open("mock-gis.js", "w", encoding="utf-8") as f:
    f.write(js_code)

print("Created mock-gis.js successfully!")

const gisFeatures = [];

/**
 * Subdivides a 4-point polygon into a grid of parking spots
 */
function subdividePolygon(corners, cols, rows, labels = []) {
    const p0 = corners[0];
    const p1 = corners[1]; // Short edge (cols)
    const p3 = corners[3]; // Long edge (rows)
    
    // Vectors for a single cell
    const ux = (p1[0] - p0[0]) / cols;
    const uy = (p1[1] - p0[1]) / cols;
    
    const vx = (p3[0] - p0[0]) / rows;
    const vy = (p3[1] - p0[1]) / rows;
    
    const features = [];
    let spotIndex = 0;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // 3% visual inset to show the white lines between spots like in the picture
            const inset = 0.03;
            
            const baseX = p0[0] + (c * ux) + (r * vx);
            const baseY = p0[1] + (c * uy) + (r * vy);
            
            const c0 = [baseX + (ux * inset) + (vx * inset), baseY + (uy * inset) + (vy * inset)];
            const c1 = [baseX + (ux * (1 - inset)) + (vx * inset), baseY + (uy * (1 - inset)) + (vy * inset)];
            const c2 = [baseX + (ux * (1 - inset)) + (vx * (1 - inset)), baseY + (uy * (1 - inset)) + (vy * (1 - inset))];
            const c3 = [baseX + (ux * inset) + (vx * (1 - inset)), baseY + (uy * inset) + (vy * (1 - inset))];
            
            const label = labels[spotIndex] || `Spot-${spotIndex + 1}`;
            
            let color = "#d9534f"; // Match the specific soft red from the user's picture
            let status = "occupied";
            
            if (label === '18') { 
                color = "#337ab7"; // Blue
                status = "handicap"; 
            } 
            if (label === 'B15') { 
                color = "#333333"; // Dark Gray
                status = "reserved"; 
            }
            
            features.push({
                type: "Feature",
                properties: {
                    spot_id: label,
                    address: `Sector 3 Parking`,
                    status: status,
                    color: color
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[c0, c1, c2, c3, c0]]
                }
            });
            spotIndex++;
        }
    }
    return features;
}

// The exact bounding box the user provided:
const userPolygon = [
    [26.180575,44.424926], // P0 (Top)
    [26.180696,44.424866], // P1 (Right)
    [26.180519,44.424684], // P2 (Bottom)
    [26.180396,44.424742]  // P3 (Left)
];

// The exact labels from the user's picture, reading left-to-right, top-to-bottom
const exactLabels = [
    '19', '18', 
    '20', 'B15', 
    '21', '16', 
    '22', '15', 
    '23', '14', 
    '24', '13', 
    '25', '12', 
    '26', '11'
];

// Generate the 2x8 grid of spots inside the user's polygon
gisFeatures.push(...subdividePolygon(userPolygon, 2, 8, exactLabels));

const sector3GeoJSON = {
    type: "FeatureCollection",
    features: gisFeatures
};

import os

appjs_path = r"c:\Users\andre\OneDrive\Desktop\Folder nou\ParkShare\app.js"
massive_s4_path = r"c:\Users\andre\OneDrive\Desktop\Folder nou\ParkShare\massive_s4_array.txt"

with open(appjs_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(massive_s4_path, 'r', encoding='utf-8') as f:
    massive_s4_content = f.read().strip()

# Line 21 is index 20 (0-indexed)
# Let's double check if lines[20] is indeed massiveMockSpots definition
print("Original line 21:", lines[20][:100])
lines[20] = f"const massiveMockSpots = {massive_s4_content};\n"
print("Updated line 21 successfully.")

content = "".join(lines)

# Remove getFeatureFingerprints function definition
# It is located around line 1051
func_def = """function getFeatureFingerprints(f) {
    let list = [];
    try {
        const firstCoord = f.geometry.coordinates[0][0];
        list.push(`${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`);
    } catch(e) {}
    try {
        const ring = f.geometry.coordinates[0];
        if (ring && ring.length >= 3) {
            const latCenter2 = (ring[0][1] + ring[2][1]) / 2;
            const lngCenter2 = (ring[0][0] + ring[2][0]) / 2;
            list.push(`${latCenter2.toFixed(6)},${lngCenter2.toFixed(6)}`);
        }
        if (ring) {
            const lats = ring.map(c => c[1]);
            const lngs = ring.map(c => c[0]);
            const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
            const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
            list.push(`${centerLat.toFixed(6)},${centerLng.toFixed(6)}`);
        }
    } catch(e) {}
    return list;
}"""

if func_def in content:
    content = content.replace(func_def + "\n\n", "")
    content = content.replace(func_def, "")
    print("Removed getFeatureFingerprints helper function.")
else:
    # Try with raw string matching if line endings vary
    func_def_normalized = func_def.replace("\r\n", "\n")
    content_normalized = content.replace("\r\n", "\n")
    if func_def_normalized in content_normalized:
        content_normalized = content_normalized.replace(func_def_normalized + "\n\n", "")
        content_normalized = content_normalized.replace(func_def_normalized, "")
        content = content_normalized
        print("Removed getFeatureFingerprints helper function (normalized line endings).")
    else:
        print("Warning: getFeatureFingerprints not found as block.")

# Target 1: Pass 1 filter
t1 = """                const fingerprints = getFeatureFingerprints(f);

                return !appState.spots.some(s => {
                    if (s.status === 'rejected') return false;

                    // 1. Potrivire prin Fingerprint GPS (Cea mai sigură metodă)
                    if (s.gpsFingerprint && fingerprints.includes(s.gpsFingerprint)) return true;"""

r1 = """                let fingerprint = "";
                try {
                    const firstCoord = f.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                return !appState.spots.some(s => {
                    if (s.status === 'rejected') return false;

                    // 1. Potrivire prin Fingerprint GPS (Cea mai sigură metodă)
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;"""

# Target 2: Pass 2 filter
t2 = """                const fingerprints = getFeatureFingerprints(f);

                return appState.spots.some(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprints.includes(s.gpsFingerprint)) return true;"""

r2 = """                let fingerprint = "";
                try {
                    const firstCoord = f.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                return appState.spots.some(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;"""

# Target 3: Pass 2 style
t3 = """                const fingerprints = getFeatureFingerprints(feature);

                const listedSpot = appState.spots.find(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprints.includes(s.gpsFingerprint)) return true;"""

r3 = """                let fingerprint = "";
                try {
                    const firstCoord = feature.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                const listedSpot = appState.spots.find(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;"""

# Target 4: Pass 2 onEachFeature
t4 = """                const fingerprints = getFeatureFingerprints(feature);

                const listedSpot = appState.spots.find(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprints.includes(s.gpsFingerprint)) return true;"""

r4 = """                let fingerprint = "";
                try {
                    const firstCoord = feature.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                const listedSpot = appState.spots.find(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;"""

def norm(text):
    return text.replace("\r\n", "\n").strip()

content_norm = content.replace("\r\n", "\n")

if norm(t1) in content_norm:
    content_norm = content_norm.replace(norm(t1), norm(r1))
    print("Replaced target 1.")
else:
    print("Warning: target 1 not found.")

if norm(t2) in content_norm:
    content_norm = content_norm.replace(norm(t2), norm(r2))
    print("Replaced target 2.")
else:
    print("Warning: target 2 not found.")

# Note: t3 and t4 are identical strings, so replace(t3, r3) will replace both at once.
# Let's count occurrences
occ = content_norm.count(norm(t3))
print(f"Target 3/4 occurrences: {occ}")
if occ > 0:
    content_norm = content_norm.replace(norm(t3), norm(r3))
    print(f"Replaced target 3/4 ({occ} times).")
else:
    print("Warning: target 3/4 not found.")

with open(appjs_path, 'w', encoding='utf-8') as f:
    f.write(content_norm)

print("Saved fixed app.js.")

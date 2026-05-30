import os
import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs

PORT = 8080

# The data file is located in the root directory, one level up from www
DATA_FILE = 's4_points_nominatim.json'
parking_data = []

print(f"Loading {DATA_FILE} into memory for the API...")
if os.path.exists(DATA_FILE):
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            parking_data = json.load(f)
        print(f"Successfully loaded {len(parking_data)} parking spots.")
    except Exception as e:
        print(f"Error loading {DATA_FILE}: {e}")
else:
    print(f"Warning: {DATA_FILE} not found. API will return empty data.")

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve static files from the 'www' directory
        super().__init__(*args, directory="www", **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def do_GET(self):
        parsed_url = urlparse(self.path)
        
        # Intercept API calls
        if parsed_url.path == '/api/parking':
            query = parse_qs(parsed_url.query)
            
            # Get bounding box parameters
            try:
                n = float(query.get('n', [90])[0])
                s = float(query.get('s', [-90])[0])
                e = float(query.get('e', [180])[0])
                w = float(query.get('w', [-180])[0])
            except ValueError:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "Invalid bounding box parameters"}')
                return
            
            # Filter data
            filtered_data = []
            for spot in parking_data:
                # Features can be complex, let's extract lat/lon correctly
                lat = spot.get('lat')
                lon = spot.get('lon')
                
                # Check if the structure is different (e.g., GeoJSON)
                if lat is None or lon is None:
                    # Let's try standard nominatim structure or if they are in properties
                    if 'lat' in spot: lat = float(spot['lat'])
                    if 'lon' in spot: lon = float(spot['lon'])
                
                if lat is not None and lon is not None:
                    try:
                        lat = float(lat)
                        lon = float(lon)
                        if s <= lat <= n and w <= lon <= e:
                            filtered_data.append(spot)
                    except ValueError:
                        continue
                        
            # Limit to prevent client overload
            if len(filtered_data) > 500:
                filtered_data = filtered_data[:500]
                
            response_json = json.dumps(filtered_data)
            response_bytes = response_json.encode('utf-8')
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)
            return
            
        # Serve static files for everything else
        super().do_GET()

class ThreadingSimpleServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True

with ThreadingSimpleServer(("", PORT), APIHandler) as httpd:
    print("API and Web Server running at port", PORT)
    httpd.serve_forever()

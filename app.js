// Disable browser scroll restoration on refresh and force top
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Initial Default Data
const defaultSpots = [];

// Shared Persistence Configuration
const DB_URL = "https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/spots"; // Live bucket for everyone

// App State
let appState = {
    spots: defaultSpots,
    selectedCoord: null,
    tempMarker: null,
    tempMarkerList: null
};

let map;
let mapList;
let mapFind; // Noua hartă pentru pagina Find Your Spot
let spotLayers = [];
let spotLayersList = [];
const clusterOptions = {
    disableClusteringAtZoom: 19,
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: true,
    chunkedLoading: true
};

let poiLayers = {
    parking: { main: L.markerClusterGroup(clusterOptions), list: L.markerClusterGroup(clusterOptions), find: L.markerClusterGroup(clusterOptions) },
    bank: { main: L.markerClusterGroup(clusterOptions), list: L.markerClusterGroup(clusterOptions), find: L.markerClusterGroup(clusterOptions) },
    shop: { main: L.markerClusterGroup(clusterOptions), list: L.markerClusterGroup(clusterOptions), find: L.markerClusterGroup(clusterOptions) }
};

let isSyncingLeft = false;
let isSyncingRight = false;
let isSyncingFind = false;

// Fetch spots from global store
async function loadState() {
    try {
        const response = await fetch(DB_URL, { cache: 'no-store' });
        if (response.ok) {
            const text = await response.text();
            if (text) {
                const data = JSON.parse(text);
                if (Array.isArray(data)) {
                    appState.spots = data;
                    console.log("Global state loaded:", data);
                    return;
                }
            }
        }
        // Initialize if empty
        console.log("Initializing global state with defaults...");
        await saveState();
    } catch (err) {
        console.warn("Failed to load global state, using local defaults.", err);
        // Fallback to localStorage if available
        const local = localStorage.getItem('parkshare_spots');
        if (local) appState.spots = JSON.parse(local);
    }
}

// Save spots to global store
async function saveState() {
    // Save to localStorage as backup
    localStorage.setItem('parkshare_spots', JSON.stringify(appState.spots));
    
    try {
        await fetch(DB_URL, {
            method: 'POST',
            body: JSON.stringify(appState.spots)
        });
        console.log("Global state saved.");
    } catch (err) {
        console.error("Failed to save global state.", err);
    }
}

// Initialize Military Clock
function startClock() {
    const clockEl = document.getElementById('digitalClock');
    if (!clockEl) return;
    
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        clockEl.textContent = timeStr;
    }, 1000);
}

// Function to initialize the map
function initMap() {
    map = L.map('map', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.435, 26.102], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(map);

    mapList = L.map('map-list', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.435, 26.102], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(mapList);

    mapFind = L.map('mapFind', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.435, 26.102], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(mapFind);

    // Adaugă legenda pe harta mapFind
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.background = 'rgba(15, 23, 42, 0.95)';
        div.style.padding = '15px';
        div.style.borderRadius = '8px';
        div.style.color = 'white';
        div.style.border = '1px solid rgba(255,255,255,0.1)';
        div.style.fontSize = '12px';
        div.innerHTML = `
            <h4 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Legendă</h4>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#5a835b; border: 1.5px solid #1e293b;"></div>
                <span>Loc nominal liber</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#000000; border: 1.5px solid #1e293b; color: #ffeb3b; font-size:9px; text-align:center; line-height:14px; font-weight:bold;">N</div>
                <span>Loc nenominal</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#aaa0a5; border: 1.5px solid #1e293b; color: #ffeb3b; font-size:9px; text-align:center; line-height:14px; font-weight:bold;">N</div>
                <span>Loc nenominal temporar</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#b8525b; border: 1.5px solid #1e293b;"></div>
                <span>Loc nominal ocupat</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#cca42b; border: 1.5px solid #1e293b;"></div>
                <span>Loc ocupat prin relocare</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#2c74a0; border: 1.5px solid #1e293b;"></div>
                <span>Loc persoană cu handicap</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#48acd8; border: 1.5px solid #1e293b;"></div>
                <span>Handicap aflat în tranzit</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <div style="width:18px; height:14px; background:#98628b; border: 1.5px solid #1e293b;"></div>
                <span>Rezervat instituție publică</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                <div style="width:18px; height:14px; background:#a69fa5; border: 1.5px solid #1e293b;"></div>
                <span>În procedură de atribuire</span>
            </div>
            
            <!-- Extra POI Legend -->
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:16px;">🏛️</span>
                <span>Bancă / Instituție</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">🛒</span>
                <span>Magazin / Comercial</span>
            </div>
        `;
        return div;
    };
    legend.addTo(mapFind);

    // Sincronizarea hărților a fost eliminată complet pentru performanță maximă.

    // Adaugă layerele de Parcări (POIs) pe TOATE hărțile (default)
    poiLayers.parking.main.addTo(map);
    poiLayers.parking.list.addTo(mapList);
    poiLayers.parking.find.addTo(mapFind);
    
    // Băncile și magazinele nu se adaugă aici. Vor fi adăugate doar prin toggle de către utilizator pe harta Find.

    // Initial fetch of local static file and S3 Polygons
    loadStaticPOIs();
    loadS3Polygons();

    // --- LEAFLET DRAW PLUGIN (USER MANUAL PARKING ADDITION) ---
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
            polygon: {
                allowIntersection: false,
                shapeOptions: { color: '#3b82f6' }
            },
            polyline: false,
            rectangle: { shapeOptions: { color: '#3b82f6' } },
            circle: false,
            circlemarker: false,
            marker: false
        }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        drawnItems.addLayer(layer);
        
        const geoJSON = layer.toGeoJSON();
        const coords = JSON.stringify(geoJSON.geometry.coordinates);
        
        // Provide the coordinates to the user so they can give them back to me
        setTimeout(() => {
            prompt("Ai desenat cu succes locul! Copiază aceste coordonate și trimite-mi-le pentru a le salva permanent în baza de date:", coords);
        }, 100);
    });

    map.on(L.Draw.Event.EDITED, function (e) {
        const layers = e.layers;
        layers.eachLayer(function (layer) {
            const geoJSON = layer.toGeoJSON();
            const coords = JSON.stringify(geoJSON.geometry.coordinates);
            setTimeout(() => {
                prompt("Ai modificat cu succes colțurile! Copiază noile coordonate:", coords);
            }, 100);
        });
    });

    // =====================================
    // S3 POLYGONS LOGIC (Viewport Culling)
    // =====================================
    let allPolygons = [];
    let polygonLayerFind = L.layerGroup().addTo(mapFind);

    async function loadS3Polygons() {
        try {
            console.log("Downloading 83k polygons...");
            const response = await fetch('s3_polygons.json');
            const data = await response.json();
            allPolygons = data.features;
            console.log(`Loaded ${allPolygons.length} polygons into memory.`);
            renderVisiblePolygons();
        } catch(e) {
            console.warn("Failed to load S3 polygons", e);
        }
    }

    function renderVisiblePolygons() {
        if (mapFind.getZoom() < 18) {
            polygonLayerFind.clearLayers();
            return;
        }
        
        const bounds = mapFind.getBounds();
        polygonLayerFind.clearLayers();
        
        const getPolygonColor = (status) => {
            switch(status) {
                case 0: return '#5a835b'; // Liber (Verde)
                case 1: return '#b8525b'; // Ocupat (Rosu)
                case 2: return '#cca42b'; // Relocare (Galben)
                case 3: return '#2c74a0'; // Handicap (Albastru inchis)
                case 4: return '#48acd8'; // Tranzit (Albastru deschis)
                case 5: return '#98628b'; // Institutie (Mov)
                case 6: return '#000000'; // Nenominal (Negru)
                case 7: return '#aaa0a5'; // Nenominal Temporar (Gri)
                case 8: return '#a69fa5'; // Procedura atribuire (Gri deschis)
                default: return '#3b82f6';
            }
        };

        const getPolygonTypeText = (status) => {
            switch(status) {
                case 0: return 'Loc nominal liber';
                case 1: return 'Loc nominal ocupat';
                case 2: return 'Loc ocupat prin relocare';
                case 3: return 'Loc persoană cu handicap';
                case 4: return 'Handicap aflat în tranzit';
                case 5: return 'Rezervat instituție publică';
                case 6: return 'Loc nenominal';
                case 7: return 'Loc nenominal temporar';
                case 8: return 'În procedură de atribuire';
                default: return 'Tip necunoscut';
            }
        };

        const polyStyle = function(feature) {
            return {
                color: '#1e293b', // Contur inchis premium
                weight: 1,
                fillColor: getPolygonColor(feature.properties.ocupat),
                fillOpacity: 0.85
            };
        };
        
        // Culling: Only 50-100 out of 83,000 will match this
        const visibleFeatures = allPolygons.filter(f => {
            const coords = f.geometry.coordinates[0][0]; // First point of the polygon
            return bounds.contains([coords[1], coords[0]]);
        });
        
        L.geoJSON(visibleFeatures, {
            style: polyStyle,
            onEachFeature: function (feature, layer) {
                const props = feature.properties;
                const statusLabel = (props.ocupat === 0) 
                    ? '<span style="color:#4ade80;">Disponibil</span>' 
                    : '<span style="color:#f87171;">Ocupat / Rezervat</span>';

                layer.bindPopup(`
                    <div style="text-align:center; min-width: 180px;">
                        <div style="font-size: 14px; margin-bottom: 5px;">
                            <b>Status:</b> ${statusLabel}
                        </div>
                        <div style="font-size: 12px;">
                            <b>Loc:</b> ${props.numar || 'N/A'}<br>
                            <b>Tip:</b> <span style="color:${getPolygonColor(props.ocupat)}; font-weight:bold;">${getPolygonTypeText(props.ocupat)}</span>
                        </div>
                    </div>
                `);

                // Afișează textul (numărul sau bateria) vizual, permanent, în centrul poligonului
                // Condiție: DOAR dacă zoom-ul este mai mare (>= 20, adică 2 nivele peste poligoane) ca să nu se suprapună
                if (mapFind.getZoom() >= 20) {
                    let labelText = '';
                    let customClass = 'parking-number-label';

                    if (props.ocupat === 6 || props.ocupat === 7) {
                        // Loc Nenominal -> pe site-ul primăriei scrie "Zona" (ex. "B16", "B1", "C2")
                        labelText = props.zona ? props.zona : 'N';
                        customClass += ' parking-number-yellow';
                    } else if (props.numar) {
                        // Loc normal -> numărul locului
                        labelText = String(props.numar);
                    }

                    if (labelText) {
                        layer.bindTooltip(labelText, {
                            permanent: true,
                            direction: 'center',
                            className: customClass
                        });
                    }
                }
            }
        }).addTo(polygonLayerFind);
    }

    mapFind.on('moveend', renderVisiblePolygons);
    mapFind.on('zoomend', renderVisiblePolygons);

    // =====================================
    // END S3 POLYGONS LOGIC
    // =====================================
    

    window.expandInlineMap = () => {
        const mapContainer = document.getElementById('inlineMapContainer');
        
        // Calculăm poziția exactă de destinație instant, presupunând înălțimea finală de 600px
        const targetY = window.scrollY + mapContainer.getBoundingClientRect().top - (window.innerHeight / 2) + 300;

        if (!mapContainer.classList.contains('expanded')) {
            mapContainer.classList.add('expanded');
            
            // Derulare instantanee, folosind API-ul nativ de fluiditate al browser-ului
            window.scrollTo({ top: targetY, behavior: 'smooth' });
            
            setTimeout(() => {
                map.invalidateSize();
            }, 300); // Permite hărții să se redeseneze corect
        } else {
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
    };

    window.toggleInlineMap = () => {
        const mapContainer = document.getElementById('inlineMapContainer');
        mapContainer.classList.toggle('expanded');
        if (mapContainer.classList.contains('expanded')) {
            setTimeout(() => map.invalidateSize(), 400);
        }
    };

    // Quick Demo helper
    window.flyToDemo = () => {
        window.expandInlineMap();
        if (window.demoCenter) {
            map.flyTo(window.demoCenter, 21);
        } else {
            map.flyTo([44.424800, 26.180500], 21);
        }
    };

    // Open map when clicking the search input
    document.getElementById('mapSearch')?.addEventListener('focus', () => {
        window.expandInlineMap();
    });
    // Event listener for main apply filters button
    document.getElementById('btnApplyFilters')?.addEventListener('click', () => {
        renderOverlays(appState.spots);
    });

    // POI Toggles
    const toggleLayer = (id, type) => {
        document.getElementById(id)?.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            if (isChecked) {
                mapFind.addLayer(poiLayers[type].find);
            } else {
                mapFind.removeLayer(poiLayers[type].find);
            }
        });
    };

    toggleLayer('togglePOIParking', 'parking');
    toggleLayer('togglePOIBanks', 'bank');
    toggleLayer('togglePOIShops', 'shop');

    renderOverlays(appState.spots);

    // Click on map to select listing location (outside GIS polygons)
    const handleMapClick = async (e) => {
        document.getElementById('spotNumber').value = ""; // Clear spot number

        if (appState.tempMarker) {
            map.removeLayer(appState.tempMarker);
            mapList.removeLayer(appState.tempMarkerList);
        }
        
        appState.selectedCoord = e.latlng;
        
        const createMarker = () => L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#3b82f6; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(59,130,246,0.8);'></div>",
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            })
        });

        appState.tempMarker = createMarker().addTo(map);
        appState.tempMarkerList = createMarker().addTo(mapList);

        showToast("Location selected! Reverse geocoding address...");
        
        // Reverse Geocoding
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                const shortAddress = data.display_name.split(',').slice(0, 3).join(',');
                document.getElementById('address').value = shortAddress;
                showToast("Address automatically filled!");
            }
        } catch (err) {
            console.warn("Reverse geocoding failed", err);
        }
    };

    map.on('click', handleMapClick);
    mapList.on('click', handleMapClick);

    // Add listeners for time changes
    document.getElementById('startTime').addEventListener('change', updateApp);
    document.getElementById('endTime').addEventListener('change', updateApp);
}

function updateApp() {
    renderOverlays(appState.spots);
}

// Calculate hours between two time strings
function getDuration() {
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    
    const startTime = new Date(`2026-04-16T${start}:00`);
    const endTime = new Date(`2026-04-16T${end}:00`);
    
    let diff = (endTime - startTime) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
}

// Function to render parking spot overlays
function renderOverlays(spots) {
    // Clear existing layers
    spotLayers.forEach(layer => map.removeLayer(layer));
    spotLayersList.forEach(layer => mapList.removeLayer(layer));
    spotLayersFind.forEach(layer => { if(mapFind) mapFind.removeLayer(layer); });
    spotLayers = [];
    spotLayersList = [];
    spotLayersFind = [];

    const duration = getDuration();
    const startHourStr = document.getElementById('startTime').value.split(':')[0];
    const startHour = parseInt(startHourStr) || 0;

    // Get filter values
    const filterShade = document.getElementById('filterShade')?.checked;
    const filterCCTV = document.getElementById('filterCCTV')?.checked;
    const filterCovered = document.getElementById('filterCovered')?.checked;
    const filterEV = document.getElementById('filterEV')?.checked;
    const minPrice = parseFloat(document.getElementById('filterPriceMin')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('filterPriceMax')?.value) || 9999;

    spots.forEach(spot => {
        // Apply filters
        if (spot.price < minPrice || spot.price > maxPrice) return;
        
        const ams = spot.amenities || [];
        if (filterShade && !ams.includes('shade')) return;
        if (filterCCTV && !ams.includes('cctv')) return;
        if (filterCovered && !ams.includes('covered')) return;
        if (filterEV && !ams.includes('ev')) return;

        // Simulated time-based availability: 
        const isSimulatedOccupied = (spot.id + startHour * 7) % 3 === 0;
        const isOccupied = spot.status === 'booked' || isSimulatedOccupied;
        
        const bounds = spot.bounds || [
            [spot.center[0] - 0.0001, spot.center[1] - 0.0002],
            [spot.center[0] + 0.0001, spot.center[1] + 0.0002]
        ];

        const rectOptions = {
            color: isOccupied ? '#ef4444' : '#22c55e',
            weight: 1,
            fillOpacity: 0.6,
            fillColor: isOccupied ? '#ef4444' : '#22c55e',
            className: isOccupied ? 'spot-occupied' : 'spot-available'
        };

        const rect = L.rectangle(bounds, rectOptions).addTo(map);
        const rectList = L.rectangle(bounds, rectOptions).addTo(mapList);
        let rectFind = null;
        if(mapFind) {
            rectFind = L.rectangle(bounds, rectOptions).addTo(mapFind);
            spotLayersFind.push(rectFind);
        }

        const totalPrice = (spot.price * duration).toFixed(2);
        
        const popupContent = `
            <div class="map-popup">
                <div class="popup-tag" style="background: ${isOccupied ? '#ef4444' : '#22c55e'}">${isOccupied ? 'Occupied' : 'Available'}</div>
                <h3>${spot.address}</h3>
                <p>${spot.description || "No description provided."}</p>
                <div class="popup-stats">
                    <div class="stat-item">
                        <span class="label">Rate:</span> <span class="val">${spot.price.toFixed(2)} RON/hr</span>
                    </div>
                    <div class="stat-item total">
                        <span class="label">Total (${duration.toFixed(1)}h):</span> <span class="val">${totalPrice} RON</span>
                    </div>
                </div>
                ${isOccupied ? 
                    '<div class="status-badge occupied">RESERVED</div>' : 
                    `<button class="btn btn-primary btn-block" onclick="bookSpot(${spot.id})">Reserve Now</button>`
                }
            </div>
        `;

        rect.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
        rectList.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
        if(rectFind) rectFind.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
        
        spotLayers.push(rect);
        spotLayersList.push(rectList);

        rect.on('click', (e) => map.flyTo(e.latlng, 17));
        rectList.on('click', (e) => mapList.flyTo(e.latlng, 17));
        if(rectFind) rectFind.on('click', (e) => mapFind.flyTo(e.latlng, 17));
    });
}

// Booking function
window.bookSpot = (id) => {
    const spotIndex = appState.spots.findIndex(s => s.id === id);
    if (spotIndex === -1) return;

    appState.spots[spotIndex].status = 'booked';
    saveState();
    renderOverlays(appState.spots);
    
    showToast(`Booking Confirmed! You have reserved ${appState.spots[spotIndex].address}.`);
};

// Handle Form Submission (Listing/Sell)
const listForm = document.getElementById('listForm');
if (listForm) {
    listForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const address = document.getElementById('address').value;
        const price = parseFloat(document.getElementById('price').value);
        const type = document.getElementById('type').value;

        if (price < 0) {
            showToast("Price cannot be negative.", true);
            return;
        }

        let lat, lng;

        if (appState.selectedCoord) {
            lat = appState.selectedCoord.lat;
            lng = appState.selectedCoord.lng;
        } else {
            // Forward geocoding if map wasn't clicked
            showToast("Finding address on map...");
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + " Bucharest")}&limit=1`);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    lat = parseFloat(data[0].lat);
                    lng = parseFloat(data[0].lon);
                    showToast("Address mapped successfully!");
                } else {
                    showToast("Could not locate address. Please click on the map.", true);
                    return;
                }
            } catch (err) {
                console.error("Geocoding failed", err);
                showToast("Failed to find location. Please use the map.", true);
                return;
            }
        }

        const spotNum = document.getElementById('spotNumber').value;
        const descriptionText = spotNum ? `Sector 3 Parking Spot: ${spotNum}. A premium ${type} spot.` : `A premium ${type} spot listed by you.`;

        const newSpot = {
            id: Date.now(),
            address: address,
            price: price,
            type: type,
            center: [lat, lng],
            status: 'available',
            description: descriptionText
        };

        appState.spots.push(newSpot);
        saveState();
        renderOverlays(appState.spots);
        
        // Clear marker and coord
        if (appState.tempMarker) {
            map.removeLayer(appState.tempMarker);
            appState.tempMarker = null;
        }
        appState.selectedCoord = null;

        showToast("Success! Your parking spot is now live globally.");
        listForm.reset();
        
        // Switch to map
        window.location.hash = '#hero';
        setTimeout(() => map.flyTo([lat, lng], 17), 300);
    });
}

// Toast Notification System
function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i data-lucide="${isError ? 'alert-circle' : 'check-circle'}" style="width:18px; height:18px;"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    lucide.createIcons();

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 4s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        nav.style.background = "rgba(10, 15, 25, 0.95)";
        nav.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.5)";
    } else {
        nav.style.background = "rgba(15, 23, 42, 0.8)";
        nav.style.boxShadow = "none";
    }
});

// Geocoding Search Logic
function initGeocoding() {
    const searchInput = document.getElementById('mapSearch');
    const resultsEl = document.getElementById('searchResults');
    let timeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value;
        if (query.length < 3) {
            resultsEl.classList.remove('show');
            return;
        }

        timeout = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Bucharest")}&limit=5`);
                const data = await res.json();
                
                resultsEl.innerHTML = '';
                if (data.length > 0) {
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'search-item';
                        div.textContent = item.display_name.split(',').slice(0, 3).join(',');
                        div.onclick = () => {
                            const lat = parseFloat(item.lat);
                            const lon = parseFloat(item.lon);
                            window.expandInlineMap();
                            setTimeout(() => map.flyTo([lat, lon], 16), 300);
                            resultsEl.classList.remove('show');
                            searchInput.value = div.textContent;
                        };
                        resultsEl.appendChild(div);
                    });
                    resultsEl.classList.add('show');
                } else {
                    resultsEl.classList.remove('show');
                }
            } catch (err) {
                console.error("Geocoding failed", err);
            }
        }, 500);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            resultsEl.classList.remove('show');
        }
    });
}

// SPA Navigation
function initNavigation() {
    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('.nav-links a');

    function navigateTo(targetId) {
        // Hide all sections
        sections.forEach(sec => sec.classList.remove('active'));
        // Remove active class from nav links
        navLinks.forEach(link => link.classList.remove('active-link'));
        
        // Show target section
        const targetSec = document.querySelector(targetId);
        if (targetSec) {
            targetSec.classList.add('active');
            // Re-render map if map section is shown
            if (targetId === '#hero' && typeof map !== 'undefined') {
                setTimeout(() => map.invalidateSize(), 100);
            } else if (targetId === '#list' && typeof mapList !== 'undefined') {
                setTimeout(() => mapList.invalidateSize(), 100);
            } else if (targetId === '#find-spot' && typeof mapFind !== 'undefined') {
                setTimeout(() => mapFind.invalidateSize(), 100);
            }
        }
        
        // Highlight nav link
        const activeLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
        if (activeLink) activeLink.classList.add('active-link');
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Handle clicks on any link starting with #
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                window.location.hash = targetId;
            }
        });
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash || '#hero';
        navigateTo(hash);
    });

    const initialHash = window.location.hash || '#hero';
    navigateTo(initialHash);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    startClock();
    initNavigation();
    await loadState(); // Load global state first
    initMap();
    initGeocoding();
    renderAuthUI();
});

// --- User Authentication & Profile Logic ---
let parkshareUsers = JSON.parse(localStorage.getItem('parkshare_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('parkshare_session')) || null;

function renderAuthUI() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (currentUser) {
        const avatarUrl = currentUser.profilePicUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=3b82f6&color=fff`;
        authContainer.innerHTML = `
            <button id="profileBtn" class="profile-btn" title="${currentUser.username}">
                <img src="${avatarUrl}" alt="Profile">
            </button>
        `;
        setTimeout(() => {
            document.getElementById('profileBtn')?.addEventListener('click', () => {
                document.getElementById('profileModal').classList.add('active');
            });
        }, 50);
        
        // Populate modal with existing data
        if(document.getElementById('profilePicUrl')) document.getElementById('profilePicUrl').value = currentUser.profilePicUrl || '';
        if(document.getElementById('profileCarMake')) document.getElementById('profileCarMake').value = currentUser.carMake || '';
        if(document.getElementById('profileLicense')) document.getElementById('profileLicense').value = currentUser.license || '';
        if(document.getElementById('profileBio')) document.getElementById('profileBio').value = currentUser.bio || '';
        if(document.getElementById('profileReadOnlyDetails')) document.getElementById('profileReadOnlyDetails').value = `${currentUser.name} (@${currentUser.username}) - ${currentUser.contact}`;
        if(document.getElementById('profilePreviewImg')) document.getElementById('profilePreviewImg').src = avatarUrl;
    } else {
        authContainer.innerHTML = `
            <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" id="btnShowRegister">Register</button>
                <button class="btn btn-primary" id="btnShowLogin">Log In</button>
            </div>
        `;
        setTimeout(() => {
            document.getElementById('btnShowRegister')?.addEventListener('click', () => document.getElementById('registerModal').classList.add('active'));
            document.getElementById('btnShowLogin')?.addEventListener('click', () => document.getElementById('loginModal').classList.add('active'));
        }, 50);
    }
}

// Modal Closers
document.getElementById('closeRegisterModal')?.addEventListener('click', () => document.getElementById('registerModal').classList.remove('active'));
document.getElementById('closeLoginModal')?.addEventListener('click', () => document.getElementById('loginModal').classList.remove('active'));
document.getElementById('closeProfileModal')?.addEventListener('click', () => document.getElementById('profileModal').classList.remove('active'));

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
});

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Register Submission
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('regPassword').value;
    const confirmPass = document.getElementById('regConfirmPassword').value;
    if (pass !== confirmPass) {
        showToast("Passwords do not match!", true);
        return;
    }
    const contact = document.getElementById('regContact').value;
    if (parkshareUsers.find(u => u.contact === contact)) {
        showToast("An account with this email/phone already exists!", true);
        return;
    }
    
    const newUser = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        name: `${document.getElementById('regFirstName').value} ${document.getElementById('regLastName').value}`,
        username: document.getElementById('regUsername').value,
        dob: document.getElementById('regDob').value,
        contact: contact,
        password: pass,
        profilePicUrl: "",
        carMake: "",
        license: "",
        bio: ""
    };
    
    parkshareUsers.push(newUser);
    localStorage.setItem('parkshare_users', JSON.stringify(parkshareUsers));
    
    // Automatically log them in
    currentUser = newUser;
    localStorage.setItem('parkshare_session', JSON.stringify(currentUser));
    
    closeAllModals();
    renderAuthUI();
    showToast("Account created successfully!");
    e.target.reset();
});

// Login Submission
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const contact = document.getElementById('loginContact').value;
    const pass = document.getElementById('loginPassword').value;
    
    const user = parkshareUsers.find(u => u.contact === contact && u.password === pass);
    if (user) {
        currentUser = user;
        localStorage.setItem('parkshare_session', JSON.stringify(currentUser));
        closeAllModals();
        renderAuthUI();
        showToast(`Welcome back, ${user.firstName}!`);
        e.target.reset();
    } else {
        showToast("Invalid credentials!", true);
    }
});

// Profile Picture Preview update
document.getElementById('profilePicUrl')?.addEventListener('input', (e) => {
    if(!currentUser) return;
    const url = e.target.value || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=3b82f6&color=fff`;
    document.getElementById('profilePreviewImg').src = url;
});

// Profile Updates
document.getElementById('profileForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    currentUser.profilePicUrl = document.getElementById('profilePicUrl').value;
    currentUser.carMake = document.getElementById('profileCarMake').value;
    currentUser.license = document.getElementById('profileLicense').value;
    currentUser.bio = document.getElementById('profileBio').value;
    
    // Update in users array
    const idx = parkshareUsers.findIndex(u => u.contact === currentUser.contact);
    if (idx !== -1) {
        parkshareUsers[idx] = currentUser;
        localStorage.setItem('parkshare_users', JSON.stringify(parkshareUsers));
    }
    
    localStorage.setItem('parkshare_session', JSON.stringify(currentUser));
    renderAuthUI();
    closeAllModals();
    showToast("Profile updated successfully!");
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('parkshare_session');
    renderAuthUI();
    closeAllModals();
    showToast("Logged out.");
});

// --- Find Nearest Spot Logic ---
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

document.getElementById('btnFindNearest')?.addEventListener('click', () => {
    handleFindNearest(map, spotLayers);
});

document.getElementById('btnFindNearestPage')?.addEventListener('click', () => {
    handleFindNearest(mapFind, spotLayersFind);
});

function handleFindNearest(targetMap, targetLayers) {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser", true);
        return;
    }

    showToast("Locating your position...");
    
    // Attempt real location, fallback to mock Bucharest center
    navigator.geolocation.getCurrentPosition(
        (position) => {
            findClosestSpotTo(position.coords.latitude, position.coords.longitude, targetMap, targetLayers);
        },
        (error) => {
            console.warn("Geolocation error, using simulated Bucharest location.", error);
            showToast("Using simulated location in Bucharest...");
            findClosestSpotTo(44.4300, 26.0950, targetMap, targetLayers);
        },
        { timeout: 5000 }
    );
}

function findClosestSpotTo(userLat, userLng, targetMap = map, targetLayers = spotLayers) {
    const startHourStr = document.getElementById('startTime').value.split(':')[0];
    const startHour = parseInt(startHourStr) || 0;
    
    let closestSpot = null;
    let minDistance = Infinity;
    
    appState.spots.forEach(spot => {
        const isSimulatedOccupied = (spot.id + startHour * 7) % 3 === 0;
        const isOccupied = spot.status === 'booked' || isSimulatedOccupied;
        
        if (!isOccupied) {
            const dist = getDistance(userLat, userLng, spot.center[0], spot.center[1]);
            if (dist < minDistance) {
                minDistance = dist;
                closestSpot = spot;
            }
        }
    });
    
    if (closestSpot) {
        if(targetMap === map) window.expandInlineMap();
        targetMap.flyTo(closestSpot.center, 18);
        showToast(`Found closest available spot: ${closestSpot.address} (${minDistance.toFixed(2)} km away)`);
        
        // Find matching layer and open popup
        setTimeout(() => {
            targetLayers.forEach(layer => {
                const bounds = layer.getBounds();
                const center = bounds.getCenter();
                if (Math.abs(center.lat - closestSpot.center[0]) < 0.001 && Math.abs(center.lng - closestSpot.center[1]) < 0.001) {
                    layer.openPopup();
                }
            });
        }, 1200); 
    } else {
        showToast("No available spots found!", true);
    }
}

// --- Static POIs (Fluid Experience) ---
let allStaticPOIsLoaded = false;
let allMarkers = {
    parking: [],
    bank: [],
    shop: []
};

async function loadStaticPOIs() {
    if (allStaticPOIsLoaded) return;
    try {
        const res = await fetch('./pois.json');
        if (!res.ok) return;
        const data = await res.json();
        
        data.forEach(poi => {
            const lat = poi.lat;
            const lon = poi.lon;
            const type = poi.type;
            const name = poi.name;
            
            let iconHtml = '';
            if (type === 'parking') {
                iconHtml = `<div style="color: #3b82f6; font-weight: bold; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">P</div>`;
            } else if (type === 'bank') {
                iconHtml = `<div style="font-size: 14px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">🏛️</div>`;
            } else if (type === 'shop') {
                iconHtml = `<div style="font-size: 14px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">🛒</div>`;
            }
            
            const icon = L.divIcon({ html: iconHtml, className: 'poi-custom-icon', iconSize: [20,20], iconAnchor: [10,10] });
            const popup = `<div style="color: black; padding: 2px;"><b>${name}</b></div>`;
            
            const markerMain = L.marker([lat, lon], {icon}).bindPopup(popup);
            const markerList = L.marker([lat, lon], {icon}).bindPopup(popup);
            const markerFind = L.marker([lat, lon], {icon}).bindPopup(popup);
            
            allMarkers[type].push({ main: markerMain, list: markerList, find: markerFind });
            
            // Adaugă-le în clustere imediat
            poiLayers[type].main.addLayer(markerMain);
            poiLayers[type].list.addLayer(markerList);
            poiLayers[type].find.addLayer(markerFind);
        });
        
        allStaticPOIsLoaded = true;
        
    } catch(e) {
        console.warn("Failed to load static POIs", e);
    }
}

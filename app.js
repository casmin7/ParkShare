// Initial Default Data
const defaultSpots = [
    {
        id: 1,
        address: "Piața Unirii - Central Parking",
        price: 7.00,
        type: "Parking Lot",
        center: [44.4268, 26.1025],
        bounds: [[44.4266, 26.1023], [44.4270, 26.1027]],
        description: "Secure parking right in the heart of Bucharest.",
        status: 'available'
    },
    {
        id: 2,
        address: "Victoriei Business Hub",
        price: 10.00,
        type: "Garage",
        center: [44.4517, 26.0863],
        bounds: [[44.4515, 26.0861], [44.4519, 26.0865]],
        description: "Perfect for commuters working near the Government building.",
        status: 'available'
    },
    {
        id: 3,
        address: "Universitate - Underground",
        price: 8.50,
        type: "Garage",
        center: [44.4355, 26.1025],
        bounds: [[44.4353, 26.1023], [44.4357, 26.1027]],
        description: "Quick access to the Old Town and University.",
        status: 'available'
    },
    {
        id: 4,
        address: "AFI Cotroceni Side Lot",
        price: 5.00,
        type: "Driveway",
        center: [44.4304, 26.0526],
        bounds: [[44.4302, 26.0524], [44.4306, 26.0528]],
        description: "Privately owned space near the mall.",
        status: 'available'
    }
];

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
let spotLayers = [];
let spotLayersList = [];

// Fetch spots from global store
async function loadState() {
    try {
        const response = await fetch(DB_URL);
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(map);

    mapList = L.map('map-list', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.435, 26.102], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(mapList);

    // Sync views
    let isSyncingLeft = false;
    let isSyncingRight = false;
    
    map.on('move', function() {
        if (!isSyncingLeft) {
            isSyncingRight = true;
            mapList.setView(map.getCenter(), map.getZoom(), {animate: false});
            isSyncingRight = false;
        }
    });

    mapList.on('move', function() {
        if (!isSyncingRight) {
            isSyncingLeft = true;
            map.setView(mapList.getCenter(), mapList.getZoom(), {animate: false});
            isSyncingLeft = false;
        }
    });

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
    // -----------------------------------------------------------

    // Load Mock GIS Data
    let gisLayer;
    let gisLayerList;

    const gisStyle = (feature) => ({
        color: '#ffffff',
        weight: 1,
        fillOpacity: 0.5,
        fillColor: feature.properties.color
    });

    const onGisFeatureClick = (e) => {
        L.DomEvent.stopPropagation(e);
        
        const props = e.target.feature.properties;
        
        document.getElementById('address').value = props.address;
        document.getElementById('spotNumber').value = props.spot_id;
        
        const center = e.target.getBounds().getCenter();
        
        if (appState.tempMarker) {
            map.removeLayer(appState.tempMarker);
            mapList.removeLayer(appState.tempMarkerList);
        }
        
        appState.selectedCoord = center;
        
        const createMarker = () => L.marker(center, {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#f59e0b; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(245,158,11,0.8);'></div>",
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })
        });

        appState.tempMarker = createMarker().addTo(map);
        appState.tempMarkerList = createMarker().addTo(mapList);

        showToast(`Selected Spot ${props.spot_id}!`);
        window.location.hash = '#list';
    };

    if (typeof sector3GeoJSON !== 'undefined') {
        const geoJsonConfig = {
            style: gisStyle,
            onEachFeature: (feature, layer) => {
                layer.on('click', onGisFeatureClick);
            }
        };
        gisLayer = L.geoJSON(sector3GeoJSON, geoJsonConfig);
        gisLayerList = L.geoJSON(sector3GeoJSON, geoJsonConfig);
    }

    // Toggle GIS layers based on zoom
    const toggleGisLayer = () => {
        const zoom = map.getZoom();
        if (zoom >= 17) {
            if (gisLayer && !map.hasLayer(gisLayer)) map.addLayer(gisLayer);
            if (gisLayerList && !mapList.hasLayer(gisLayerList)) mapList.addLayer(gisLayerList);
        } else {
            if (gisLayer && map.hasLayer(gisLayer)) map.removeLayer(gisLayer);
            if (gisLayerList && mapList.hasLayer(gisLayerList)) mapList.removeLayer(gisLayerList);
        }
    };

    map.on('zoomend', toggleGisLayer);
    toggleGisLayer(); // initial check
    
    // Quick Demo helper
    window.flyToDemo = () => {
        window.location.hash = '#hero';
        map.flyTo([44.424800, 26.180500], 21);
    };

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
    spotLayers = [];
    spotLayersList = [];

    const duration = getDuration();

    spots.forEach(spot => {
        const isOccupied = spot.status === 'booked';
        
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

        const totalPrice = (spot.price * duration).toFixed(2);
        
        const popupContent = `
            <div class="map-popup">
                <div class="popup-tag" style="background: ${isOccupied ? '#ef4444' : '#22c55e'}">${isOccupied ? 'Occupied' : 'Available'}</div>
                <h3>${spot.address}</h3>
                <p>${spot.description || "No description provided."}</p>
                <div class="popup-stats">
                    <div class="stat-item">
                        <span class="label">Rate:</span> <span class="val">$${spot.price.toFixed(2)}/hr</span>
                    </div>
                    <div class="stat-item total">
                        <span class="label">Total (${duration.toFixed(1)}h):</span> <span class="val">$${totalPrice}</span>
                    </div>
                </div>
                ${isOccupied ? 
                    '<div class="status-badge occupied">RESERVED</div>' : 
                    `<button class="btn btn-primary btn-block" onclick="bookSpot(${spot.id})">Reserve Now</button>`
                }
            </div>
        `;

        rect.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
        rectList.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
        
        spotLayers.push(rect);
        spotLayersList.push(rectList);

        rect.on('click', (e) => {
            map.flyTo(e.latlng, 17);
        });
        rectList.on('click', (e) => {
            mapList.flyTo(e.latlng, 17);
        });
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
                            map.flyTo([lat, lon], 16);
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
});

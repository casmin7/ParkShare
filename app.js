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

// App State
let appState = {
    spots: JSON.parse(localStorage.getItem('parkshare_spots')) || defaultSpots,
    selectedCoord: null,
    tempMarker: null
};

let map;
let spotLayers = [];

// Helper to save state
function saveState() {
    localStorage.setItem('parkshare_spots', JSON.stringify(appState.spots));
}

// Function to initialize the map
function initMap() {
    map = L.map('map').setView([44.435, 26.102], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    renderOverlays(appState.spots);

    // Click on map to select listing location
    map.on('click', (e) => {
        if (appState.tempMarker) {
            map.removeLayer(appState.tempMarker);
        }
        
        appState.selectedCoord = e.latlng;
        
        appState.tempMarker = L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#3b82f6; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(59,130,246,0.8);'></div>",
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            })
        }).addTo(map);

        showToast("Location selected! Now fill out the form below.");
        
        // Scroll to form
        document.getElementById('list').scrollIntoView({ behavior: 'smooth' });
    });

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
    spotLayers = [];

    const duration = getDuration();

    spots.forEach(spot => {
        const isOccupied = spot.status === 'booked';
        
        // Improved drawing: making them look like actual parking slots (long rectangles)
        // If the spot doesn't have bounds, generate them from center
        const bounds = spot.bounds || [
            [spot.center[0] - 0.0001, spot.center[1] - 0.0002],
            [spot.center[0] + 0.0001, spot.center[1] + 0.0002]
        ];

        const rect = L.rectangle(bounds, {
            color: isOccupied ? '#ef4444' : '#22c55e',
            weight: 1,
            fillOpacity: 0.6,
            fillColor: isOccupied ? '#ef4444' : '#22c55e',
            className: isOccupied ? 'spot-occupied' : 'spot-available'
        }).addTo(map);

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
        spotLayers.push(rect);

        rect.on('click', (e) => {
            map.flyTo(e.latlng, 17);
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
    listForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!appState.selectedCoord) {
            showToast("Please click on the map first to select the location of your spot!", true);
            document.getElementById('find').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const address = document.getElementById('address').value;
        const price = parseFloat(document.getElementById('price').value);
        const type = document.getElementById('type').value;

        const newSpot = {
            id: Date.now(),
            address: address,
            price: price,
            type: type,
            center: [appState.selectedCoord.lat, appState.selectedCoord.lng],
            status: 'available',
            description: `A premium ${type} spot listed by you.`
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
        
        // Scroll back to map
        document.getElementById('find').scrollIntoView({ behavior: 'smooth' });
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

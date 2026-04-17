// Mock Data for Parking Spots in Bucharest
// Bounds are [SouthWest, NorthEast] (slight offsets to create rectangles)
const mockSpots = [
    {
        id: 1,
        address: "Piața Unirii - Central Parking",
        price: 7.00,
        type: "Parking Lot",
        center: [44.4268, 26.1025],
        bounds: [[44.4266, 26.1023], [44.4270, 26.1027]],
        description: "Secure parking right in the heart of Bucharest."
    },
    {
        id: 2,
        address: "Victoriei Business Hub",
        price: 10.00,
        type: "Garage",
        center: [44.4517, 26.0863],
        bounds: [[44.4515, 26.0861], [44.4519, 26.0865]],
        description: "Perfect for commuters working near the Government building."
    },
    {
        id: 3,
        address: "Universitate - Underground",
        price: 8.50,
        type: "Garage",
        center: [44.4355, 26.1025],
        bounds: [[44.4353, 26.1023], [44.4357, 26.1027]],
        description: "Quick access to the Old Town and University."
    },
    {
        id: 4,
        address: "AFI Cotroceni Side Lot",
        price: 5.00,
        type: "Driveway",
        center: [44.4304, 26.0526],
        bounds: [[44.4302, 26.0524], [44.4306, 26.0528]],
        description: "Privately owned space near the mall."
    },
    {
        id: 5,
        address: "Promenada North Tower",
        price: 12.00,
        type: "Parking Lot",
        center: [44.4789, 26.1044],
        bounds: [[44.4787, 26.1042], [44.4791, 26.1046]],
        description: "Premium spot in the northern business district."
    },
    {
        id: 6,
        address: "ParkLake Residential Area",
        price: 4.00,
        type: "Driveway",
        center: [44.4214, 26.1500],
        bounds: [[44.4212, 26.1498], [44.4216, 26.1502]],
        description: "Safe driveway space near the park."
    }
];

let map;
let spotLayers = [];

// Function to initialize the map
function initMap() {
    map = L.map('map').setView([44.435, 26.102], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    renderOverlays(mockSpots);

    // Add listeners for time changes
    document.getElementById('startTime').addEventListener('change', updateApp);
    document.getElementById('endTime').addEventListener('change', updateApp);
}

function updateApp() {
    renderOverlays(mockSpots);
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
        // Simple mock availability logic: Victoriei is occupied after 12:00
        const isOccupied = spot.id === 2 && document.getElementById('startTime').value > "12:00";
        
        const rect = L.rectangle(spot.bounds, {
            color: isOccupied ? '#ef4444' : '#22c55e',
            weight: 2,
            fillOpacity: 0.4,
            fillColor: isOccupied ? '#ef4444' : '#22c55e'
        }).addTo(map);

        const totalPrice = (spot.price * duration).toFixed(2);
        
        const popupContent = `
            <div class="map-popup">
                <h3 style="margin-bottom: 5px; font-size: 1rem;">${spot.address}</h3>
                <p style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 10px;">${spot.description}</p>
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                        <span>Rate:</span> <span>$${spot.price.toFixed(2)}/hr</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-top: 5px; font-weight: 700;">
                        <span>Total (${duration.toFixed(1)} hrs):</span> <span style="color: #3b82f6;">$${totalPrice}</span>
                    </div>
                </div>
                ${isOccupied ? 
                    '<div style="color: #ef4444; font-weight: 700; text-align: center; border: 1px solid #ef4444; padding: 5px; border-radius: 8px;">OCCUPIED</div>' : 
                    `<button class="btn btn-primary" style="width:100%;" onclick="bookSpot(${spot.id})">Book Selection</button>`
                }
            </div>
        `;

        rect.bindPopup(popupContent);
        spotLayers.push(rect);

        // Auto-zoom to spot on high zoom levels if clicked
        rect.on('click', (e) => {
            map.flyTo(e.latlng, 16);
        });
    });
}

// Mock booking function
window.bookSpot = (id) => {
    const spot = mockSpots.find(s => s.id === id);
    alert(`Booking feature coming soon!\n\nSpot: ${spot.address}\nPrice: $${spot.price.toFixed(2)}/hr`);
};

// Handle Form Submission
const listForm = document.getElementById('listForm');
if (listForm) {
    listForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const address = document.getElementById('address').value;
        const price = document.getElementById('price').value;
        const type = document.getElementById('type').value;

        alert(`Successfully Listed!\n\nAddress: ${address}\nPrice: $${price}/hr\nType: ${type}\n\nYour spot is now live on ParkShare.`);
        listForm.reset();
    });
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

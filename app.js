// Disable browser scroll restoration on refresh and force top
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Shared Persistence Configuration
const DB_URL = "https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/spots"; 
const USERS_URL = "https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/users"; 

// App State
let appState = {
    spots: [],
    selectedCoord: null,
    selectedPolygon: null,
    tempMarker: null,
    tempMarkerList: null
};

let currentUser = JSON.parse(localStorage.getItem('parkshare_user')) || null;
const massiveMockSpots = [{"lat": 44.4172462, "lng": 26.1411516, "num": "13", "code": "236_1"}, {"lat": 44.4170745, "lng": 26.1410877, "num": "7", "code": "236_1"}, {"lat": 44.4171243, "lng": 26.1411062, "num": "11", "code": "236_1"}, {"lat": 44.4172782, "lng": 26.1411632, "num": "14", "code": "236_1"}, {"lat": 44.4172152, "lng": 26.14114, "num": "12", "code": "236_1"}, {"lat": 44.417099, "lng": 26.1410967, "num": "9", "code": "236_1"}, {"lat": 44.4186916, "lng": 26.1310154, "num": "2M", "code": "282_1"}, {"lat": 44.4187322, "lng": 26.1310843, "num": "2", "code": "282_1"}, {"lat": 44.4187525, "lng": 26.1310963, "num": "3", "code": "282_1"}, {"lat": 44.4090723, "lng": 26.1398011, "num": "17", "code": "318"}, {"lat": 44.4090623, "lng": 26.1397746, "num": "18", "code": "318"}, {"lat": 44.4092065, "lng": 26.1398518, "num": "14", "code": "318"}, {"lat": 44.4091265, "lng": 26.1397599, "num": "10", "code": "318"}, {"lat": 44.4090656, "lng": 26.1394682, "num": "1", "code": "318"}, {"lat": 44.4090873, "lng": 26.1395272, "num": "3", "code": "318"}, {"lat": 44.4091848, "lng": 26.1397927, "num": "12", "code": "318"}, {"lat": 44.409159, "lng": 26.1398484, "num": "13", "code": "318"}, {"lat": 44.413751, "lng": 26.1492927, "num": "8", "code": "8200"}, {"lat": 44.4137079, "lng": 26.1492709, "num": "11", "code": "8200"}, {"lat": 44.413559, "lng": 26.1491377, "num": "19", "code": "8200"}, {"lat": 44.4137947, "lng": 26.1492027, "num": "6", "code": "8200"}, {"lat": 44.4136528, "lng": 26.1492216, "num": "14", "code": "8200"}, {"lat": 44.4138025, "lng": 26.1491727, "num": "5", "code": "8200"}, {"lat": 44.417028, "lng": 26.1818124, "num": "2", "code": "3524_1"}, {"lat": 44.4169478, "lng": 26.1817938, "num": "5", "code": "3524_1"}, {"lat": 44.4169268, "lng": 26.1817889, "num": "6", "code": "3524_1"}, {"lat": 44.4169058, "lng": 26.181784, "num": "7", "code": "3524_1"}, {"lat": 44.416662, "lng": 26.1817274, "num": "17", "code": "3524_1"}, {"lat": 44.4165537, "lng": 26.1817023, "num": "22", "code": "3524_1"}, {"lat": 44.4213922, "lng": 26.1213587, "num": "9", "code": "507"}, {"lat": 44.4215533, "lng": 26.1213688, "num": "3", "code": "507"}, {"lat": 44.4215946, "lng": 26.1214003, "num": "1", "code": "507"}, {"lat": 44.4215748, "lng": 26.1213852, "num": "2", "code": "507"}, {"lat": 44.4215921, "lng": 26.1212488, "num": "16", "code": "507"}, {"lat": 44.4213959, "lng": 26.121329, "num": "8", "code": "507"}, {"lat": 44.4214542, "lng": 26.1212041, "num": "11", "code": "507"}, {"lat": 44.4214991, "lng": 26.1212077, "num": "12", "code": "507"}, {"lat": 44.4207952, "lng": 26.1218443, "num": "11", "code": "5328_2"}, {"lat": 44.4206088, "lng": 26.1217547, "num": "5", "code": "5328_2"}, {"lat": 44.4206725, "lng": 26.1217825, "num": "7", "code": "5328_2"}, {"lat": 44.4207746, "lng": 26.1218343, "num": "10", "code": "5328_2"}, {"lat": 44.4208863, "lng": 26.1218951, "num": "15", "code": "5328_2"}, {"lat": 44.4287263, "lng": 26.1729421, "num": "6", "code": "3001_1"}, {"lat": 44.4288144, "lng": 26.1736203, "num": "25", "code": "3001_1"}, {"lat": 44.4287387, "lng": 26.173038, "num": "9", "code": "3001_1"}, {"lat": 44.4287096, "lng": 26.172814, "num": "2", "code": "3001_1"}, {"lat": 44.4287842, "lng": 26.1733874, "num": "18", "code": "3001_1"}, {"lat": 44.4287346, "lng": 26.1730061, "num": "8", "code": "3001_1"}, {"lat": 44.4287304, "lng": 26.1729741, "num": "7", "code": "3001_1"}, {"lat": 44.4132689, "lng": 26.1345253, "num": "5", "code": "292_1"}, {"lat": 44.4136915, "lng": 26.134105, "num": "23", "code": "292_1"}, {"lat": 44.4137312, "lng": 26.133882, "num": "29", "code": "292_1"}, {"lat": 44.4136531, "lng": 26.134128, "num": "21", "code": "292_1"}, {"lat": 44.4132361, "lng": 26.1345637, "num": "3", "code": "292_1"}, {"lat": 44.4132199, "lng": 26.1345828, "num": "2", "code": "292_1"}, {"lat": 44.4134325, "lng": 26.1343305, "num": "12", "code": "292_1"}, {"lat": 44.4135714, "lng": 26.134186, "num": "18", "code": "292_1"}, {"lat": 44.414198, "lng": 26.1697899, "num": "12", "code": "132_1"}, {"lat": 44.4142667, "lng": 26.1692463, "num": "29", "code": "132_1"}, {"lat": 44.414159, "lng": 26.1702173, "num": "2", "code": "132_1"}, {"lat": 44.4141877, "lng": 26.169891, "num": "10", "code": "132_1"}, {"lat": 44.4141732, "lng": 26.1701089, "num": "4", "code": "132_1"}, {"lat": 44.4142592, "lng": 26.169306, "num": "27", "code": "132_1"}, {"lat": 44.4142058, "lng": 26.1697283, "num": "14", "code": "132_1"}, {"lat": 44.4222204, "lng": 26.16965, "num": "15", "code": "455_1"}, {"lat": 44.4220902, "lng": 26.1687558, "num": "43", "code": "455_1"}, {"lat": 44.4221968, "lng": 26.1694655, "num": "21", "code": "455_1"}, {"lat": 44.4222746, "lng": 26.1700664, "num": "2", "code": "455_1"}, {"lat": 44.4222363, "lng": 26.1697723, "num": "11", "code": "455_1"}, {"lat": 44.4220864, "lng": 26.1687262, "num": "44", "code": "455_1"}, {"lat": 44.4251263, "lng": 26.1225248, "num": "37", "code": "149"}, {"lat": 44.4252105, "lng": 26.1217086, "num": "21", "code": "149"}, {"lat": 44.4252091, "lng": 26.1218965, "num": "15", "code": "149"}, {"lat": 44.4252088, "lng": 26.1219599, "num": "13", "code": "149"}, {"lat": 44.4252091, "lng": 26.121865, "num": "16", "code": "149"}, {"lat": 44.4251284, "lng": 26.1219272, "num": "12", "code": "149"}, {"lat": 44.4251312, "lng": 26.1215802, "num": "1", "code": "149"}, {"lat": 44.4251302, "lng": 26.1216443, "num": "3", "code": "149"}, {"lat": 44.4208426, "lng": 26.1147466, "num": "14", "code": "113_2"}, {"lat": 44.4208156, "lng": 26.1146309, "num": "12", "code": "113_2"}, {"lat": 44.4208005, "lng": 26.1146998, "num": "10", "code": "113_2"}, {"lat": 44.420805, "lng": 26.1147629, "num": "8", "code": "113_2"}, {"lat": 44.420809, "lng": 26.1148242, "num": "6", "code": "113_2"}, {"lat": 44.4208171, "lng": 26.1149501, "num": "2", "code": "113_2"}, {"lat": 44.4208136, "lng": 26.114889, "num": "4", "code": "113_2"}, {"lat": 44.420807, "lng": 26.1147939, "num": "7", "code": "113_2"}, {"lat": 44.4200099, "lng": 26.1227863, "num": "25", "code": "2810"}, {"lat": 44.4199507, "lng": 26.1232311, "num": "10", "code": "2810"}, {"lat": 44.4199815, "lng": 26.1229631, "num": "19", "code": "2810"}, {"lat": 44.4233266, "lng": 26.1466018, "num": "56", "code": "3045"}, {"lat": 44.4235438, "lng": 26.1484514, "num": "21", "code": "3045"}, {"lat": 44.4234383, "lng": 26.1478622, "num": "33", "code": "3045"}, {"lat": 44.4232522, "lng": 26.1486515, "num": "10", "code": "3045"}, {"lat": 44.4232547, "lng": 26.1465462, "num": "50", "code": "3045"}, {"lat": 44.4268802, "lng": 26.1207678, "num": "7", "code": "5315"}, {"lat": 44.4268868, "lng": 26.1206489, "num": "10", "code": "5315"}, {"lat": 44.4268824, "lng": 26.1207346, "num": "8", "code": "5315"}, {"lat": 44.4268775, "lng": 26.1208006, "num": "6", "code": "5315"}, {"lat": 44.426871, "lng": 26.1209003, "num": "3", "code": "5315"}, {"lat": 44.4268756, "lng": 26.1208345, "num": "5", "code": "5315"}, {"lat": 44.4268732, "lng": 26.1208674, "num": "4", "code": "5315"}, {"lat": 44.4232539, "lng": 26.1370032, "num": "4", "code": "537_3"}, {"lat": 44.4232864, "lng": 26.137009, "num": "3", "code": "537_3"}, {"lat": 44.4231577, "lng": 26.1369352, "num": "9", "code": "537_3"}, {"lat": 44.4232708, "lng": 26.1369571, "num": "13", "code": "537_3"}, {"lat": 44.4233251, "lng": 26.136968, "num": "15", "code": "537_3"}, {"lat": 44.4232389, "lng": 26.136951, "num": "12", "code": "537_3"}, {"lat": 44.4232015, "lng": 26.1369939, "num": "6", "code": "537_3"}, {"lat": 44.4275966, "lng": 26.1322423, "num": "30", "code": "146_2"}, {"lat": 44.4275151, "lng": 26.1321071, "num": "25", "code": "146_2"}, {"lat": 44.4274362, "lng": 26.1320817, "num": "2", "code": "146_2"}, {"lat": 44.427858, "lng": 26.1326335, "num": "44", "code": "146_2"}, {"lat": 44.4278037, "lng": 26.132595, "num": "42", "code": "146_2"}, {"lat": 44.4273187, "lng": 26.1318912, "num": "10", "code": "146_2"}, {"lat": 44.4277812, "lng": 26.1325585, "num": "41", "code": "146_2"}, {"lat": 44.4215467, "lng": 26.1190339, "num": "6", "code": "430"}, {"lat": 44.4215264, "lng": 26.1190325, "num": "7", "code": "430"}, {"lat": 44.4216514, "lng": 26.1190428, "num": "1", "code": "430"}, {"lat": 44.4268603, "lng": 26.170363, "num": "37", "code": "1021_2"}, {"lat": 44.4264729, "lng": 26.1679176, "num": "121", "code": "1021_2"}, {"lat": 44.4264566, "lng": 26.1677935, "num": "124", "code": "1021_2"}, {"lat": 44.4265913, "lng": 26.168812, "num": "94", "code": "1021_2"}, {"lat": 44.426817, "lng": 26.1700363, "num": "26", "code": "1021_2"}, {"lat": 44.4266637, "lng": 26.1693593, "num": "78", "code": "1021_2"}, {"lat": 44.4268087, "lng": 26.1704655, "num": "45", "code": "1021_2"}];

let map, mapList, mapFind;
let spotLayers = [], spotLayersList = [], spotLayersFind = [];
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

// GIS Global State
let allPolygons = [];
let polygonLayerFind, polygonLayerList, polygonLayerMain;


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded, starting onboarding check...");
    initOnboarding();
    
    // 2. Search Initialization
    try {
        initFindSpotSearch();
    } catch (e) { console.error("Search init failed", e); }

    // 2. Restul elementelor de UI
    initListForm();
    initNavigation();
    renderAuthUI();
    startClock();
    
    // 3. Hărțile (izolate pentru a nu bloca restul)
    try {
        initMap();
        initGeocoding();
    } catch (e) { console.error("Map init failed", e); }
    
    // 4. Datele în fundal
    loadState().then(() => {
        renderVisiblePolygons();
    });

    if (window.lucide) window.lucide.createIcons();
});


async function loadState() {
    try {
        console.log("Loading state from KVDB...");
        const response = await fetch(DB_URL, { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                // Dacă avem date locale mai noi (de ex. tocmai am salvat), nu le suprascriem imediat
                appState.spots = data;
                console.log("State loaded successfully:", data.length, "spots");
            }
        }
    } catch (err) {
        console.warn("Failed to load global state, using local fallback.", err);
        const local = localStorage.getItem('parkshare_spots');
        if (local) appState.spots = JSON.parse(local);
    }
    
    // Dacă avem prea puține locuri, populăm cu date de test pentru a părea activ
    if (appState.spots.length < 5) {
        seedMockSpots();
    }
}

function seedMockSpots() {
    console.log("Seeding 1000 clustered GIS spots with 50% active listings...");
    
    massiveMockSpots.forEach((data, index) => {
        const isActiveListing = index % 2 === 0; // 50% sunt la închiriat
        const belongsToMe = index % 4 === 0; // O parte din ele sunt tot ale mele, dar listate
        
        const owner = belongsToMe ? (currentUser?.username || "admin") : `User_${100 + index}`;
        const status = isActiveListing ? 'available' : 'verified';
        
        // Generăm intervale orare aleatorii pentru locurile disponibile
        let availability = [];
        if (isActiveListing) {
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            availability = [
                { date: today, start: "08:00", end: "14:00" },
                { date: tomorrow, start: "16:00", end: "22:00" }
            ];
        }

        appState.spots.push({
            id: 2000 + index,
            owner: owner,
            ownerFirstName: belongsToMe ? (currentUser?.firstName || "Proprietar") : "Utilizator",
            spotNumber: data.num,
            parkingCode: data.code,
            gpsFingerprint: `${data.lat.toFixed(6)},${data.lng.toFixed(6)}`,
            address: `Sector 3, Loc ${data.num}, Parcare ${data.code}`,
            price: 3 + Math.floor(Math.random() * 3), // Preț între 3 și 5 RON
            type: "Sedan",
            center: [data.lat, data.lng],
            status: status,
            availability: availability,
            description: isActiveListing ? "Loc disponibil pentru închiriere pe intervale orare." : "Locul tău verificat.",
            listedAt: new Date().toISOString(),
            isMock: true
        });
    });
}

async function saveState() {
    const dataStr = JSON.stringify(appState.spots);
    localStorage.setItem('parkshare_spots', dataStr);
    
    try {
        console.log("Saving state to KVDB...");
        const response = await fetch(DB_URL, { 
            method: 'POST', 
            body: dataStr,
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error("Server rejected save");
        console.log("State saved successfully to cloud.");
    } catch (err) { 
        console.error("CLOUD SAVE FAILED! Data remains local only.", err);
        showToast("Eroare la salvarea în cloud! Datele sunt salvate doar local.", true);
    }
}

function startClock() {
    const clockEl = document.getElementById('digitalClock');
    if (!clockEl) return;
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    }, 1000);
}

// --- Navigation ---

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a, .hero-action-buttons a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                navigateTo(targetId);
            }
        });
    });

    // Handle back/forward buttons
    window.addEventListener('hashchange', () => {
        navigateTo(window.location.hash || '#hero');
    });

    // Initial load
    if (window.location.hash) navigateTo(window.location.hash);

    // Global Modal Listener
    document.addEventListener('click', (e) => {
        // Deschidere modal
        const openBtn = e.target.closest('[data-open-modal]');
        if (openBtn) {
            const modalId = openBtn.getAttribute('data-open-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                modal.style.setProperty('display', 'flex', 'important');
            }
        }

        // Închidere modal (pe X sau pe overlay)
        if (e.target.classList.contains('modal-overlay') || e.target.closest('.btn-icon')) {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal && (e.target === activeModal || activeModal.contains(e.target.closest('.btn-icon')))) {
                activeModal.classList.remove('active');
                activeModal.style.setProperty('display', 'none', 'important');
            }
        }
    });
}

function navigateTo(targetId) {
    const sections = document.querySelectorAll('section');
    
    // Security check for Admin section - MUST happen before showing anything
    if (targetId === '#admin') {
        if (!currentUser || currentUser.username !== 'admin') {
            showToast("Acces restricționat! Doar administratorii pot accesa această pagină.", true);
            window.location.hash = '#hero';
            return;
        }
    }

    // Hide all
    sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.display = 'none';
    });

    const targetSec = document.querySelector(targetId);
    if (targetSec) {
        targetSec.classList.add('active');
        targetSec.style.display = 'block';
        window.location.hash = targetId;

        // Force map refreshes
        if (targetId === '#list' && typeof mapList !== 'undefined') setTimeout(() => mapList.invalidateSize(), 100);
        if (targetId === '#find-spot' && typeof mapFind !== 'undefined') setTimeout(() => mapFind.invalidateSize(), 100);
        if (targetId === '#my-spots' && typeof map !== 'undefined') {
            setTimeout(() => {
                map.invalidateSize();
                renderMySpots();
            }, 100);
        }
        
        if (targetId === '#admin') renderAdminPanel();
    }
}

// --- Authentication UI ---

function renderAuthUI() {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;

    if (currentUser) {
        // Restricted Admin Link Visibility
        const adminLi = document.getElementById('adminNavLi');
        if (adminLi) adminLi.style.display = (currentUser.username === 'admin') ? 'block' : 'none';

        const mySpotsLi = document.getElementById('mySpotsNavLi');
        if (mySpotsLi) mySpotsLi.style.display = 'block';

        const avatarUrl = currentUser.avatarBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName)}&background=3b82f6&color=fff`;
        authContainer.innerHTML = `
            <div id="navProfilePill" class="profile-pill" 
                onclick="document.getElementById('profileModal').classList.add('active')"
                style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: rgba(255,255,255,0.05); padding: 0.4rem 1rem; border-radius: 30px; border: 1px solid var(--glass-border);">
                <img src="${avatarUrl}" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
                <span style="font-weight: 600; font-size: 0.85rem;">Salut, ${currentUser.firstName}</span>
            </div>
        `;
    } else {
        const adminLi = document.getElementById('adminNavLi');
        if (adminLi) adminLi.style.display = 'none';
        const mySpotsLi = document.getElementById('mySpotsNavLi');
        if (mySpotsLi) mySpotsLi.style.display = 'none';
        authContainer.innerHTML = `
            <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-outline" data-open-modal="registerModal">Cont Nou</button>
                <button class="btn btn-primary" data-open-modal="loginModal">Autentificare</button>
            </div>
        `;
    }
}

// Global Click Listener for Modals
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-open-modal]');
    if (target) {
        const modalId = target.getAttribute('data-open-modal');
        document.getElementById(modalId)?.classList.add('active');
    }
    
    // Closer logic
    if (e.target.closest('.modal-overlay') && !e.target.closest('.modal-card')) {
        e.target.closest('.modal-overlay').classList.remove('active');
    }
    if (e.target.closest('.btn-icon') && e.target.closest('.modal-header')) {
        e.target.closest('.modal-overlay').classList.remove('active');
    }
});

// --- Auth Forms ---

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        username: document.getElementById('regUsername').value,
        contact: document.getElementById('regContact').value,
        password: document.getElementById('regPassword').value,
        avatarBase64: ""
    };

    try {
        const res = await fetch(USERS_URL);
        let users = res.ok ? (await res.json() || []) : [];
        if (users.find(u => u.username === user.username)) return showToast("Username deja existent!", true);
        
        users.push(user);
        await fetch(USERS_URL, { method: 'POST', body: JSON.stringify(users) });
        
        currentUser = user;
        localStorage.setItem('parkshare_user', JSON.stringify(user));
        
        // Marcăm ca onboarded la înregistrare
        localStorage.setItem('parkshare_onboarded', 'true');
        
        // Închidem modalele cu prioritate !important
        const regModal = document.getElementById('registerModal');
        const welcomeModal = document.getElementById('welcomeModal');
        if (regModal) {
            regModal.classList.remove('active');
            regModal.style.setProperty('display', 'none', 'important');
        }
        if (welcomeModal) {
            welcomeModal.style.setProperty('display', 'none', 'important');
        }

        renderAuthUI();
        showToast(`Bine ai venit, ${user.firstName}! Cont creat cu succes.`);
    } catch (err) { showToast("Eroare la înregistrare", true); }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contact = document.getElementById('loginContact').value;
    const pass = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(USERS_URL);
        const users = res.ok ? (await res.json() || []) : [];
        const user = users.find(u => (u.username === contact || u.contact === contact) && u.password === pass);
        if (user) {
            currentUser = user;
            localStorage.setItem('parkshare_user', JSON.stringify(user));
            document.getElementById('loginModal').classList.remove('active');
            renderAuthUI();
            showToast(`Salut, ${user.firstName}!`);
        } else {
            showToast("Date incorecte!", true);
        }
    } catch (err) { showToast("Eroare la conectare", true); }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('parkshare_user');
    document.getElementById('profileModal').classList.remove('active');
    renderAuthUI();
    window.location.hash = '#hero';
});

// --- Admin Panel ---

function renderAdminPanel() {
    const body = document.getElementById('adminRequestsBody');
    const emptyState = document.getElementById('adminEmptyState');
    if (!body) return;

    // Filter to show all spots, sorted: pending first
    const sorted = [...appState.spots].sort((a, b) => {
        const order = { pending_verification: 0, verified: 1, rejected: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

    if (emptyState) emptyState.style.display = 'none';

    // Header
    body.innerHTML = sorted.map(spot => {
        const statusClass = spot.status === 'pending_verification' ? 'pending'
            : spot.status === 'verified' ? 'verified' : 'rejected';
        const statusLabel = spot.status === 'pending_verification' ? '⏳ În așteptare'
            : spot.status === 'verified' ? '✅ Aprobat' : '❌ Respins';
        const dateStr = spot.listedAt
            ? new Date(spot.listedAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'N/A';
        const hasPdf = !!spot.contractPdf;
        const isPending = spot.status === 'pending_verification';

        return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" 
            onmouseover="this.style.background='rgba(255,255,255,0.03)'" 
            onmouseout="this.style.background='transparent'">
            <td style="padding: 1.25rem 1.5rem;">
                <div style="font-weight: 700; color: white;">${spot.ownerFirstName || spot.owner || 'N/A'}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">@${spot.owner || '—'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${dateStr}</div>
            </td>
            <td style="padding: 1.25rem 1.5rem;">
                <div style="font-weight: 700; color: var(--primary); font-size: 1rem;">${spot.spotNumber || '—'}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${spot.address || '—'}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">💰 ${spot.price || '—'} RON/oră</div>
            </td>
            <td style="padding: 1.25rem 1.5rem;">
                ${hasPdf
                    ? `<button class="btn btn-sm btn-outline" onclick="downloadContract(${spot.id})" 
                           style="display:flex; align-items:center; gap:0.4rem;">
                           📄 ${spot.contractName || 'Contract.pdf'}
                       </button>`
                    : `<span style="color: var(--text-muted); font-size: 0.8rem;">— fără fișier —</span>`
                }
            </td>
            <td style="padding: 1.25rem 1.5rem;">
                <span class="status-badge status-${statusClass}" style="white-space:nowrap;">${statusLabel}</span>
            </td>
            <td style="padding: 1.25rem 1.5rem; text-align: right; white-space: nowrap;">
                <button class="btn btn-sm ${spot.status === 'verified' ? 'btn-primary' : 'btn-outline'}" 
                    onclick="approveSpot(${spot.id})" 
                    style="margin-right: 0.5rem; ${spot.status === 'verified' ? 'cursor:default;opacity:0.7;' : ''}">
                    ${spot.status === 'verified' ? '✓ Aprobat' : 'Aprobă'}
                </button>
                <button class="btn btn-sm ${spot.status === 'rejected' ? 'btn-primary' : 'btn-outline'}" 
                    onclick="rejectSpot(${spot.id})" 
                    style="border-color: #ef4444; color: ${spot.status === 'rejected' ? 'white' : '#ef4444'}; ${spot.status === 'rejected' ? 'background:#ef4444;cursor:default;opacity:0.7;' : ''}">
                    ${spot.status === 'rejected' ? '✗ Respins' : 'Refuză'}
                </button>
            </td>
        </tr>`;
    }).join('');
}

function renderMySpots() {
    const list = document.getElementById('mySpotsList');
    const empty = document.getElementById('mySpotsEmpty');
    if (!list || !currentUser) return;

    // --- Secțiunea 1: Locurile mele (cele pe care le dețin) ---
    const myOwnedSpots = appState.spots.filter(s => s.owner === currentUser.username);
    
    // --- Secțiunea 2: Rezervările mele (cele pe care le-am închiriat) ---
    const myReservations = appState.spots.filter(s => s.bookedBy === currentUser.username && s.status === 'booked');

    if (myOwnedSpots.length === 0 && myReservations.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';

    let html = '';

    if (myReservations.length > 0) {
        html += `
        <div style="grid-column: 1 / -1; margin-bottom: 1rem;">
            <h2 style="font-size: 1.25rem; color: #f59e0b; display: flex; align-items: center; gap: 0.5rem;">
                <i data-lucide="clock"></i> Rezervările Mele Active
            </h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Locuri pe care le folosești acum</p>
        </div>`;
        
        myReservations.forEach(spot => {
            html += `
            <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid #f59e0b; display: flex; flex-direction: column; gap: 1rem; background: rgba(245, 158, 11, 0.05);">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <h3 style="color: #f59e0b; margin: 0;">Loc ${spot.spotNumber}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${spot.address}</p>
                    </div>
                    <div style="text-align: right;">
                        <div id="timer-label-${spot.id}" style="font-size: 0.7rem; color: #f59e0b; font-weight: 800;">STATUS:</div>
                        <div id="countdown-${spot.id}" class="status-text-top" style="font-size: 1.2rem; font-weight: 800; color: white; line-height:1.1;">--:--</div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: var(--text-muted);">Data:</span>
                        <b style="color: white;">${spot.availability?.date ? new Date(spot.availability.date).toLocaleDateString('ro-RO') : 'Azi'}</b>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted);">Interval:</span>
                        <b style="color: white;">${spot.availability?.start || 'N/A'} - ${spot.availability?.end || 'N/A'}</b>
                    </div>
                </div>
                <button class="btn btn-sm btn-primary btn-block" style="background: #f59e0b; border-color: #f59e0b;" 
                    onclick="map.flyTo([${spot.center}], 20); setTimeout(() => renderVisiblePolygons(), 500);">
                    Vezi Drumul spre Loc
                </button>
            </div>`;
        });
    }

    if (myOwnedSpots.length > 0) {
        html += `
        <div style="grid-column: 1 / -1; margin-top: 2rem; margin-bottom: 1rem;">
            <h2 style="font-size: 1.25rem; color: var(--primary);">Locurile Mele Listate</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Locurile pe care le deții și statusul lor</p>
        </div>`;

        myOwnedSpots.forEach(spot => {
            const isBooked = spot.status === 'booked';
            const statusClass = spot.status === 'pending_verification' ? 'pending'
                : (spot.status === 'verified' || isBooked) ? 'verified' : 'rejected';
            const statusLabel = spot.status === 'pending_verification' ? '⏳ În așteptare'
                : isBooked ? '✅ Aprobat (Rezervat)' : (spot.status === 'verified' ? '✅ Aprobat' : '❌ Respins');

            html += `
            <div class="glass-card" style="padding: 1.5rem; position: relative; display: flex; flex-direction: column; gap: 1rem; border-left: 4px solid ${isBooked ? '#f59e0b' : 'transparent'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h3 style="color: var(--primary); margin: 0;">Loc ${spot.spotNumber}</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${spot.address}</p>
                    </div>
                    <span class="status-badge status-${statusClass}" style="font-size: 0.75rem;">${statusLabel}</span>
                </div>
                
                <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                        <span style="color: var(--text-muted);">Tarif:</span>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-weight: 600; color: white;">${spot.price} RON/oră</span>
                            <button class="btn-icon" onclick="editSpotPrice(${spot.id})" style="padding: 2px; height: 24px; width: 24px;" title="Modifică Tarif">
                                <i data-lucide="edit-2" style="width: 14px; height: 14px; color: var(--primary);"></i>
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted);">Listat la:</span>
                        <span>${new Date(spot.listedAt).toLocaleDateString('ro-RO')}</span>
                    </div>
                    
                    ${isBooked ? `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="color: #f59e0b; font-weight: 700; font-size: 0.8rem; margin-bottom: 4px;">📅 LOC REZERVAT</div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <span style="color: var(--text-muted);">Interval:</span>
                            <span style="font-weight: 600; color: white;">${spot.availability?.start || 'N/A'} - ${spot.availability?.end || 'N/A'}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                    <button class="btn btn-sm btn-outline btn-block" onclick="map.flyTo([${spot.center}], 18); setTimeout(() => renderVisiblePolygons(), 500);">
                        Vezi pe Hartă
                    </button>
                    <button class="btn btn-sm btn-outline btn-block" style="border-color: #ef4444; color: #ef4444;" onclick="deleteSpot(${spot.id})">
                        Șterge
                    </button>
                </div>
            </div>`;
        });
    }

    list.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Inițiem cronometrele
    startAllCountdowns();
}

function startAllCountdowns() {
    const activeRes = appState.spots.filter(s => s.bookedBy === currentUser?.username && s.status === 'booked');
    activeRes.forEach(spot => {
        const timerEl = document.getElementById(`countdown-${spot.id}`);
        if (!timerEl) return;

        const update = () => {
            const now = new Date();
            const dateStr = spot.availability?.date || now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            const [year, month, day] = dateStr.split('-').map(Number);
            const [startH, startM] = (spot.availability?.start || "00:00").split(':').map(Number);
            const [endH, endM] = (spot.availability?.end || "23:59").split(':').map(Number);
            
            // Folosim constructorul local (an, luna-1, zi, ora, min) pentru a evita UTC offset bugs
            const startTime = new Date(year, month - 1, day, startH, startM, 0, 0);
            const endTime = new Date(year, month - 1, day, endH, endM, 0, 0);

            const labelEl = document.getElementById(`timer-label-${spot.id}`);

            // 1. VIITOR: Încă nu a început ora de rezervare
            if (now < startTime) {
                let diff = startTime - now;
                if (labelEl) labelEl.textContent = "URMEAZĂ SĂ PARCHEZI:";
                timerEl.style.color = "#3b82f6"; // Albastru pentru viitor
                
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                timerEl.textContent = `${h > 0 ? h + 'h ' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
                
                // Update the card status text if it exists
                const cardStatus = timerEl.closest('.glass-card').querySelector('.status-text-top');
                if (cardStatus) {
                    cardStatus.textContent = "URMEAZĂ";
                    cardStatus.style.color = "#3b82f6";
                }
                return;
            }

            // 2. ACTIV: Suntem în intervalul orar
            if (now >= startTime && now <= endTime) {
                let diff = endTime - now;
                if (labelEl) labelEl.textContent = "EXPIRĂ ÎN:";
                timerEl.style.color = "#4ade80"; // Verde pentru activ
                
                if (diff < 300000) timerEl.style.color = "#f59e0b"; // Portocaliu sub 5 min

                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                timerEl.textContent = `${h > 0 ? h + 'h ' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;

                const cardStatus = timerEl.closest('.glass-card').querySelector('.status-text-top');
                if (cardStatus) {
                    cardStatus.textContent = "ACTIVĂ";
                    cardStatus.style.color = "#4ade80";
                }
                return;
            }

            // 3. EXPIRAT
            if (labelEl) labelEl.textContent = "STATUS:";
            timerEl.textContent = "EXPIRAT";
            timerEl.style.color = "#ef4444";
            const cardStatus = timerEl.closest('.glass-card').querySelector('.status-text-top');
            if (cardStatus) {
                cardStatus.textContent = "EXPIRAT";
                cardStatus.style.color = "#ef4444";
            }
        };

        update();
        setInterval(update, 1000);
    });
}

let currentEditingSpotId = null;

window.editSpotPrice = (id) => {
    const spot = appState.spots.find(s => s.id === id);
    if (!spot) return;

    currentEditingSpotId = id;
    document.getElementById('editPriceInfo').textContent = `Loc ${spot.spotNumber} - ${spot.address}`;
    document.getElementById('newPriceInput').value = spot.price;
    document.getElementById('editPriceModal').classList.add('active');
};

window.confirmPriceChange = async () => {
    const spot = appState.spots.find(s => s.id === currentEditingSpotId);
    if (!spot) return;

    const newPrice = parseFloat(document.getElementById('newPriceInput').value);
    
    if (isNaN(newPrice) || newPrice <= 0) {
        showToast("Te rog introdu un preț valid!", true);
        return;
    }

    if (newPrice > 5) {
        showToast("Eroare: Prețul maxim permis este de 5 RON/oră!", true);
        return;
    }

    spot.price = newPrice;
    await saveState();
    document.getElementById('editPriceModal').classList.remove('active');
    renderMySpots();
    renderVisiblePolygons();
    showToast("Tarif actualizat cu succes! ✓");
};

window.deleteSpot = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest loc de parcare?")) return;
    appState.spots = appState.spots.filter(s => s.id !== id);
    await saveState();
    renderMySpots();
    showToast("Locul a fost șters.");
};


window.downloadContract = (id) => {
    const spot = appState.spots.find(s => s.id === id);
    if (!spot || !spot.contractPdf) {
        showToast('Contract indisponibil', true);
        return;
    }
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = spot.contractPdf;
    link.download = spot.contractName || `contract_${spot.spotNumber || id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Se descarcă: ${link.download}`);
};



window.approveSpot = async (id) => {
    console.log("Approving spot ID:", id);
    const spot = appState.spots.find(s => s.id === id);
    if (spot) {
        spot.status = 'verified';
        // Forțăm salvarea imediată în ambele părți
        await saveState(); 
        renderAdminPanel();
        renderMySpots();
        showToast("Loc aprobat cu succes! ✓");
    } else {
        console.error("Spot not found for ID:", id);
    }
};


window.rejectSpot = async (id) => {
    const spot = appState.spots.find(s => s.id === id);
    if (spot) {
        if (spot.status === 'verified') {
            if (!confirm("Acest loc este deja APROBAT. Sigur vrei să îl REPUGI?")) return;
        } else {
            if (!confirm("Sigur vrei să respingi această cerere?")) return;
        }
        
        spot.status = 'rejected';
        localStorage.setItem('parkshare_spots', JSON.stringify(appState.spots));
        await saveState();
        renderAdminPanel();
        renderMySpots();
        showToast("Locul a fost respins.", true);
    }
};

// --- Availability Scheduling ---
let currentAvailSpotId = null;

window.openAvailabilityModal = (id) => {
    const spot = appState.spots.find(s => s.id === id);
    if (!spot) return;
    currentAvailSpotId = id;
    document.getElementById('availSpotInfo').textContent = `Loc ${spot.spotNumber} - ${spot.address}`;
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('availDate').value = spot.availability?.date || today;
    
    if (spot.availability) {
        document.getElementById('availStart').value = spot.availability.start;
        document.getElementById('availEnd').value = spot.availability.end;
        document.getElementById('availType').value = spot.availability.type || 'Toate';
    } else {
        document.getElementById('availStart').value = '08:00';
        document.getElementById('availEnd').value = '18:00';
    }
    
    document.getElementById('availabilityModal').classList.add('active');
};

window.saveAvailability = async () => {
    const spotIndex = appState.spots.findIndex(s => s.id === currentAvailSpotId);
    if (spotIndex === -1) return;

    const date = document.getElementById('availDate').value;
    const start = document.getElementById('availStart').value;
    const end = document.getElementById('availEnd').value;
    const type = document.getElementById('availType').value;

    if (!date || !start || !end) {
        showToast("Te rog completează toate câmpurile!", true);
        return;
    }

    appState.spots[spotIndex].availability = { date, start, end, type };
    
    await saveState();
    document.getElementById('availabilityModal').classList.remove('active');
    renderMySpots();
    renderVisiblePolygons();
    showToast("Disponibilitate salvată! Locul poate fi acum rezervat.");
};

// --- Toast ---
function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'glass-card toast-message';
    toast.style = `
        position: fixed; 
        bottom: 2rem; 
        right: 2rem; 
        padding: 1rem 2rem; 
        border-left: 4px solid ${isError ? '#ef4444' : '#22c55e'}; 
        z-index: 100001; 
        animation: slideIn 0.3s ease;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        min-width: 300px;
        color: white;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


// Function to initialize the map
function initMap() {
    map = L.map('mapDashboard', {
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

    // Adaugă layerele de Parcări (POIs) pe TOATE hărțile
    poiLayers.parking.main.addTo(map);
    poiLayers.parking.list.addTo(mapList);
    poiLayers.parking.find.addTo(mapFind);
    
    // Initial fetch
    loadStaticPOIs();
    loadS3Polygons();

    // Layer initializations for GIS

    // Layer initializations for GIS
    polygonLayerFind = L.layerGroup().addTo(mapFind);
    polygonLayerList = L.layerGroup().addTo(mapList);
    polygonLayerMain = L.layerGroup().addTo(map);

    mapFind.on('moveend', renderVisiblePolygons);
    mapFind.on('zoomend', renderVisiblePolygons);
    mapList.on('moveend', renderVisiblePolygons);
    mapList.on('zoomend', renderVisiblePolygons);
    map.on('moveend', renderVisiblePolygons);
    map.on('zoomend', renderVisiblePolygons);

    window.expandInlineMap = () => {
        const mapContainer = document.getElementById('inlineMapContainer');
        const targetY = window.scrollY + mapContainer.getBoundingClientRect().top - (window.innerHeight / 2) + 300;
        if (!mapContainer.classList.contains('expanded')) {
            mapContainer.classList.add('expanded');
            window.scrollTo({ top: targetY, behavior: 'smooth' });
            setTimeout(() => map.invalidateSize(), 300);
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


    document.getElementById('mapSearch')?.addEventListener('focus', () => window.expandInlineMap());
    
    document.getElementById('btnApplyFilters')?.addEventListener('click', () => renderVisiblePolygons());

    const toggleLayer = (id, type) => {
        document.getElementById(id)?.addEventListener('change', (e) => {
            if (e.target.checked) mapFind.addLayer(poiLayers[type].find);
            else mapFind.removeLayer(poiLayers[type].find);
        });
    };
    toggleLayer('togglePOIParking', 'parking');
    toggleLayer('togglePOIBanks', 'bank');
    toggleLayer('togglePOIShops', 'shop');

    const handleMapClick = async (e) => {
        document.getElementById('spotNumber').value = "";
        if (appState.tempMarker) {
            map.removeLayer(appState.tempMarker);
            mapList.removeLayer(appState.tempMarkerList);
        }
        appState.selectedCoord = e.latlng;
        const createMarker = () => L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#3b82f6; width:12px; height:12px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(59,130,246,0.8);'></div>",
                iconSize: [12, 12], iconAnchor: [6, 6]
            })
        });
        appState.tempMarker = createMarker().addTo(map);
        appState.tempMarkerList = createMarker().addTo(mapList);

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                document.getElementById('address').value = data.display_name.split(',').slice(0, 3).join(',');
            }
        } catch (err) {}
    };

    map.on('click', handleMapClick);
    mapList.on('click', handleMapClick);
    
    // Defensive listeners for time filters
    const startEl = document.getElementById('startTime');
    const endEl = document.getElementById('endTime');
    if (startEl) startEl.addEventListener('change', renderVisiblePolygons);
    if (endEl) endEl.addEventListener('change', renderVisiblePolygons);
}



// --- GIS Logic (Global Scope) ---

async function loadS3Polygons() {
    try {
        console.log("Downloading 83k polygons...");
        const response = await fetch('s3_polygons.json');
        if(!response.ok) return;
        const data = await response.json();
        allPolygons = data.features;
        console.log(`Loaded ${allPolygons.length} polygons.`);
        renderVisiblePolygons();
    } catch(e) { console.warn("S3 load failed", e); }
}

function renderVisiblePolygons() {
    if(!polygonLayerMain) return; 
    renderPolygonsForMap(mapFind, polygonLayerFind, false);
    renderPolygonsForMap(mapList, polygonLayerList, true);
    renderPolygonsForMap(map, polygonLayerMain, false);
}

function renderPolygonsForMap(targetMap, targetLayer, isListMap) {
    if (!targetMap || targetMap.getZoom() < 18) {
        targetLayer?.clearLayers();
        return;
    }
    const bounds = targetMap.getBounds();
    targetLayer.clearLayers();

    
    const getPolygonColor = (status) => {

            switch(status) {
                case 0: return '#5a835b';
                case 1: return '#b8525b';
                case 2: return '#cca42b';
                case 3: return '#2c74a0';
                case 4: return '#48acd8';
                case 5: return '#98628b';
                case 6: return '#000000';
                case 7: return '#aaa0a5';
                case 8: return '#a69fa5';
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

        const polyStyle = (feature) => ({
            color: '#1e293b',
            weight: 1,
            fillColor: getPolygonColor(feature.properties.ocupat),
            fillOpacity: 0.85
        });

        const visibleFeatures = allPolygons.filter(f => {
            const coords = f.geometry.coordinates[0][0];
            const isVisible = bounds.contains([coords[1], coords[0]]);
            if (!isVisible) return false;

            // Includem poligonul dacă:
            // 1. Este nominal ocupat (cele roșii pe care vrem să le vedem ca să le selectăm)
            if (f.properties.ocupat === 1) return true;

            // 2. Există deja în ParkShare (trebuie să-l vedem colorat ca rezervat/verificat)
            const fingerprint = `${coords[1].toFixed(6)},${coords[0].toFixed(6)}`;
            return appState.spots.some(s => s.gpsFingerprint === fingerprint);
        });

        // Pass 1: Municipal layer (EXCLUDE any spot that exists in ParkShare)
        // Se afișează DOAR pe harta de înscriere (isListMap) pentru a putea selecta locul
        if (isListMap) {
            L.geoJSON(visibleFeatures, {
                filter: (f) => {
                    const props = f.properties;
                    const spotNum = String(props.numar || props.zona || 'N/A').replace('Loc nominal', '').trim();
                    const parkCode = String(props.cod_parcare || props.id_parcare || props.id_zona || props.nume_parcare || props.cod_loc || props.baterie || props.zona || '');
                    const gisId = String(props.id || props.OBJECTID || props.FID || '');
                    
                    // Generăm o amprentă GPS unică bazată pe prima coordonată a poligonului
                    let fingerprint = "";
                    try {
                        const firstCoord = f.geometry.coordinates[0][0];
                        fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                    } catch(e) {}

                    return !appState.spots.some(s => {
                        if (s.status === 'rejected') return false;

                        // 1. Potrivire prin Fingerprint GPS (Cea mai sigură metodă)
                        if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;

                        // 2. Potrivire prin ID-uri oficiale
                        if (s.gisId && gisId && String(s.gisId) === gisId) return true;
                        if (s.parkingCode && parkCode && s.parkingCode === parkCode && String(s.spotNumber).replace('Loc nominal', '').trim() === spotNum) return true;
                        
                        return false;
                    });
                },
                style: (feature) => polyStyle(feature),
                onEachFeature: (feature, layer) => {
                    const props = feature.properties;
                    const spotNum = String(props.numar || props.zona || 'N/A').replace('Loc nominal', '').trim();
                    const parkCode = String(props.cod_parcare || props.id_parcare || props.id_zona || props.nume_parcare || props.cod_loc || props.baterie || props.zona || '');
                    const gisId = String(props.id || props.OBJECTID || props.FID || '');

                    let coordStr = "";
                    try {
                        const ring = feature.geometry.coordinates[0];
                        if (Array.isArray(ring)) coordStr = ring.map(c => '[' + c[1] + ',' + c[0] + ']').join(',');
                    } catch(e) {}

                    if (isListMap) {
                        layer.bindPopup(`
                            <div style="text-align:center; min-width:160px;">
                                <b style="color:#3b82f6;">Loc: ${spotNum}</b><br>
                                <span style="font-size:11px; color:gray;">Parcare: ${parkCode || 'N/A'}</span><br>
                                <span style="font-size:12px;">${getPolygonTypeText(props.ocupat)}</span><br><br>
                                <button onclick="selectSpotFromMap('${spotNum}', [${coordStr}], '${gisId}', '${parkCode}')" 
                                    style="background:#3b82f6;color:white;border:none;padding:6px 16px;border-radius:8px;cursor:pointer;font-weight:600;">
                                    ✓ Selectează Locul
                                </button>
                            </div>
                        `, { maxWidth: 220 });
                    }
                    layer.on('click', (e) => L.DomEvent.stopPropagation(e.originalEvent));
                }
            }).addTo(targetLayer);
        }

        // Pass 3: Removed Fallback Markers to keep the map clean and polygon-focused as per user request.
        
        // Refresh icons for new markers
        if (window.lucide) window.lucide.createIcons();

        // Pass 2: ParkShare layer (Verified, Booked or Pending)
        L.geoJSON(visibleFeatures, {
            filter: (f) => {
                const props = f.properties;
                const spotNum = String(props.numar || props.zona || 'N/A').replace('Loc nominal', '').trim();
                const parkCode = String(props.cod_parcare || props.id_parcare || props.id_zona || props.nume_parcare || props.cod_loc || props.baterie || props.zona || '');
                const gisId = String(props.id || props.OBJECTID || props.FID || '');

                let fingerprint = "";
                try {
                    const firstCoord = f.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                return appState.spots.some(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;
                    if (s.gisId && gisId && String(s.gisId) === gisId) return true;
                    if (s.parkingCode && parkCode && s.parkingCode === parkCode && String(s.spotNumber).replace('Loc nominal', '').trim() === spotNum) return true;
                    return false;
                });
            },
            style: (feature) => {
                const props = feature.properties;
                const spotNum = String(props.numar || props.zona || 'N/A').replace('Loc nominal', '').trim();
                const parkCode = String(props.cod_parcare || props.id_parcare || props.id_zona || props.nume_parcare || props.cod_loc || props.baterie || props.zona || '');
                const gisId = String(props.id || props.OBJECTID || props.FID || '');

                let fingerprint = "";
                try {
                    const firstCoord = feature.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                const listedSpot = appState.spots.find(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;
                    if (s.gisId && gisId && String(s.gisId) === gisId) return true;
                    if (s.parkingCode && parkCode && s.parkingCode === parkCode && String(s.spotNumber).replace('Loc nominal', '').trim() === spotNum) return true;
                    return false;
                });
                if (!listedSpot) return { stroke: false, fill: false };
                const isMine = listedSpot.owner === currentUser?.username;
                
                // Culori diferite în funcție de status
                let color = isMine ? '#4ade80' : '#3b82f6'; // Verde/Albastru default
                if (listedSpot.status === 'booked') color = '#f59e0b'; // Portocaliu pentru rezervat
                if (listedSpot.status === 'pending_verification') color = '#94a3b8'; // Gri pentru pending
                
                return {
                    color: color,
                    weight: 4,
                    fillColor: color,
                    fillOpacity: 1,
                    pane: 'markerPane'
                };
            },
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                const spotNum = String(props.numar || props.zona || 'N/A').replace('Loc nominal', '').trim();
                const parkCode = String(props.cod_parcare || props.id_parcare || props.id_zona || props.nume_parcare || props.cod_loc || props.baterie || props.zona || '');
                const gisId = String(props.id || props.OBJECTID || props.FID || '');

                let fingerprint = "";
                try {
                    const firstCoord = feature.geometry.coordinates[0][0];
                    fingerprint = `${firstCoord[1].toFixed(6)},${firstCoord[0].toFixed(6)}`;
                } catch(e) {}

                const listedSpot = appState.spots.find(s => {
                    if (s.status === 'rejected') return false;
                    if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;
                    if (s.gisId && gisId && String(s.gisId) === gisId) return true;
                    if (s.parkingCode && parkCode && s.parkingCode === parkCode && String(s.spotNumber).replace('Loc nominal', '').trim() === spotNum) return true;
                    return false;
                });

                if (!listedSpot) return;
                const isMine = listedSpot.owner === currentUser?.username;
                const isBooked = listedSpot.status === 'booked';

                layer.bindPopup(`
                    <div class="map-popup" style="min-width:180px; padding: 5px;">
                        <div class="popup-tag" style="background: ${isBooked ? '#f59e0b' : (isMine ? '#4ade80' : '#3b82f6')}; color: white; font-size: 0.65rem; margin-bottom: 8px;">
                            ${isBooked ? '🔒 REZERVAT' : (isMine ? '✓ Locul Meu' : 'ParkShare Verificat')}
                        </div>
                        <div style="margin-bottom: 10px;">
                            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: white;">Locul ${listedSpot.spotNumber}</h3>
                            <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${listedSpot.address}</p>
                        </div>
                        
                        ${isBooked ? 
                            `<div style="background: rgba(245,158,11,0.1); color: #f59e0b; padding: 8px; border-radius: 8px; font-size: 0.85rem; border: 1px solid rgba(245,158,11,0.2); text-align: center;">
                                Acest loc este ocupat momentan.
                             </div>` : 
                            `<div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                                    <span style="color: var(--text-muted);">Tarif:</span> <b style="color: white;">${listedSpot.price} RON/h</b>
                                </div>
                             </div>
                             ${isMine ? 
                                `<button class="btn btn-primary btn-block" style="padding: 10px; font-size: 0.9rem; font-weight: 700; background: #4ade80; border-color: #4ade80; color: #064e3b;" 
                                    onclick="openAvailabilityModal(${listedSpot.id})">Setează Disponibilitate</button>` :
                                `<button class="btn btn-primary btn-block" style="padding: 10px; font-size: 0.9rem; font-weight: 700;" 
                                    onclick="bookSpot(${listedSpot.id})">Rezervă Acum</button>`
                             }`
                        }
                    </div>
                `, { className: 'custom-popup', autoPan: true, autoPanPadding: [50, 50], offset: [0, -5] });
                layer.on('click', (e) => L.DomEvent.stopPropagation(e.originalEvent));
                // Adăugăm numărul locului într-un stil minimalist (fără fundal)
                layer.bindTooltip(String(spotNum), { 
                    permanent: true, 
                    direction: 'center', 
                    className: 'parking-number-label' 
                });
            }
        }).addTo(targetLayer);
    }

    // Event listeners moved inside initMap to prevent early execution errors



    

// --- Onboarding & Welcome Logic ---
function initOnboarding() {
    console.log("Initializing Onboarding...");
    const welcomeModal = document.getElementById('welcomeModal');
    if (!welcomeModal) {
        console.error("Welcome modal element not found!");
        return;
    }

    const onboarded = localStorage.getItem('parkshare_onboarded');
    const forceWelcome = new URLSearchParams(window.location.search).has('welcome');
    
    // Verificăm dacă suntem cu adevărat logați (nu doar un obiect gol)
    const isActuallyLoggedIn = currentUser && currentUser.username;

    console.log("Onboarding Check:", { isActuallyLoggedIn, onboarded, forceWelcome });

    if (forceWelcome || (!isActuallyLoggedIn && !onboarded)) {
        welcomeModal.style.display = 'flex';
        console.log("Welcome modal displayed.");
    } else {
        welcomeModal.style.display = 'none';
    }

    // Validare Termeni la Înregistrare
    const termsCheck = document.getElementById('regTerms');
    const submitBtn = document.getElementById('regSubmitBtn');
    
    if (termsCheck && submitBtn) {
        termsCheck.addEventListener('change', () => {
            submitBtn.disabled = !termsCheck.checked;
        });
    }
}

window.closeWelcome = () => {
    console.log("Closing welcome modal...");
    localStorage.setItem('parkshare_onboarded', 'true');
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        // Folosim setProperty pentru a suprascrie !important din <style>
        modal.style.setProperty('display', 'none', 'important');
    }
};

window.openRegisterFromWelcome = () => {
    console.log("Opening register from welcome...");
    const welcome = document.getElementById('welcomeModal');
    const register = document.getElementById('registerModal');
    
    if (welcome) {
        welcome.style.setProperty('display', 'none', 'important');
    }
    if (register) {
        // Forțăm vizibilitatea
        register.style.setProperty('display', 'flex', 'important');
        register.style.opacity = '1';
        register.style.visibility = 'visible';
        register.classList.add('active');
        console.log("Register modal FORCE DISPLAYED.");
    } else {
        console.error("Register modal NOT FOUND in DOM!");
    }
};
window.selectSpotFromMap = (spotNumber, coordsArray, gisId, parkingCode) => {
    document.getElementById('spotNumber').value = spotNumber;
    appState.currentGisId = gisId; 
    appState.currentParkingCode = parkingCode;
    
    // Generăm amprenta GPS unică (Fingerprint)
    const firstCoord = coordsArray[0];
    appState.currentGpsFingerprint = `${firstCoord[0].toFixed(6)},${firstCoord[1].toFixed(6)}`;

    // Compute centroid from coordinates
    const lats = coordsArray.map(c => c[0]);
    const lngs = coordsArray.map(c => c[1]);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    appState.selectedCoord = { lat: centerLat, lng: centerLng };
    appState.selectedPolygon = coordsArray; // Salvează poligonul exact
    document.getElementById('address').value = `Loc nominal ${spotNumber}, Sector 3, București`;

    // Remove old temp marker
    if (appState.tempMarkerList) {
        mapList.removeLayer(appState.tempMarkerList);
    }
    appState.tempMarkerList = L.marker([centerLat, centerLng], {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style='background:#22c55e; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(34,197,94,0.8);'></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        })
    }).addTo(mapList);

    mapList.closePopup();
    showToast(`Ai selectat locul ${spotNumber} (Parcare: ${parkingCode || 'N/A'})! ✓`);
};



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
    // În noua versiune, randarea locurilor ParkShare este integrată direct în renderPolygonsForMap
    // pentru a evita dublarea poligoanelor.
    // Apelăm pur și simplu un refresh al poligoanelor GIS.
    renderVisiblePolygons();
}

// Booking function
let currentBookingSpotId = null;

window.bookSpot = (id) => {
    if (!currentUser) {
        showToast("Trebuie să fii autentificat pentru a rezerva!", true);
        document.getElementById('loginModal').classList.add('active');
        return;
    }

    const spot = appState.spots.find(s => s.id === id);
    if (!spot) return;

    if (spot.status === 'booked') {
        showToast("Acest loc a fost deja rezervat!", true);
        return;
    }

    currentBookingSpotId = id;
    
    // Populate modal
    document.getElementById('bookingSpotTitle').textContent = `Loc ${spot.spotNumber}`;
    document.getElementById('bookingSpotAddress').textContent = spot.address;
    
    const start = spot.availability?.start || "08:00";
    const end = spot.availability?.end || "18:00";
    document.getElementById('bookingAvailableRange').textContent = `${start} - ${end}`;
    
    // Set default times
    document.getElementById('bookingStart').value = start;
    document.getElementById('bookingEnd').value = end;
    
    // Set limits for browser-native time pickers (where supported)
    document.getElementById('bookingStart').min = start;
    document.getElementById('bookingStart').max = end;
    document.getElementById('bookingEnd').min = start;
    document.getElementById('bookingEnd').max = end;

    document.getElementById('bookingModal').classList.add('active');
    updateBookingSummary();
};

window.updateBookingSummary = () => {
    const spot = appState.spots.find(s => s.id === currentBookingSpotId);
    if (!spot) return;

    const startVal = document.getElementById('bookingStart').value;
    const endVal = document.getElementById('bookingEnd').value;
    const summaryEl = document.getElementById('bookingSummary');

    if (!startVal || !endVal) {
        summaryEl.style.display = 'none';
        return;
    }

    const [startH, startM] = startVal.split(':').map(Number);
    const [endH, endM] = endVal.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const diffMinutes = endTotal - startTotal;

    if (diffMinutes <= 0) {
        summaryEl.style.display = 'none';
        return;
    }

    summaryEl.style.display = 'block';
    const hours = diffMinutes / 60;
    document.getElementById('bookingDuration').textContent = `${hours.toFixed(1)} ore`;
    
    const totalPrice = hours * spot.price;
    document.getElementById('bookingTotalPrice').textContent = `${totalPrice.toFixed(2)} RON`;
};

window.confirmBooking = async () => {
    const spot = appState.spots.find(s => s.id === currentBookingSpotId);
    if (!spot) return;

    const startVal = document.getElementById('bookingStart').value;
    const endVal = document.getElementById('bookingEnd').value;

    if (!startVal || !endVal) {
        showToast("Te rog selectează intervalul orar!", true);
        return;
    }

    const [startH, startM] = startVal.split(':').map(Number);
    const [endH, endM] = endVal.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    
    // Validation against availability
    const [availStartH, availStartM] = (spot.availability?.start || "08:00").split(':').map(Number);
    const [availEndH, availEndM] = (spot.availability?.end || "18:00").split(':').map(Number);
    const availStartTotal = availStartH * 60 + availStartM;
    const availEndTotal = availEndH * 60 + availEndM;

    if (startTotal < availStartTotal || endTotal > availEndTotal) {
        showToast(`Intervalul selectat este în afara orelor disponibile (${spot.availability?.start} - ${spot.availability?.end})!`, true);
        return;
    }

    if (endTotal - startTotal < 60) {
        showToast("Rezervarea minimă este de 1 oră!", true);
        return;
    }

    // Save booking
    spot.status = 'booked';
    spot.bookedBy = currentUser.username;
    spot.bookedAt = Date.now();
    
    // Update availability to the selected range for countdown display
    spot.availability = {
        ...spot.availability,
        start: startVal,
        end: endVal
    };

    await saveState();
    document.getElementById('bookingModal').classList.remove('active');
    renderVisiblePolygons();
    renderMySpots();
    showToast(`Succes! Locul ${spot.spotNumber} a fost rezervat până la ${endVal}. ✓`);
    navigateTo('#my-spots');
};


function initListForm() {
    const contractPdf = document.getElementById('contractPdf');
    if (contractPdf) {
        contractPdf.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const nameEl = document.getElementById('pdfFileName');
            const dropzone = document.getElementById('pdfDropzone');
            if (file) {
                console.log("PDF Selected:", file.name);
                nameEl.textContent = `✓ Fișier selectat: ${file.name}`;
                nameEl.style.display = 'block';
                if (dropzone) dropzone.style.borderColor = '#22c55e';
                showToast("Contract încărcat cu succes! ✓");
            }
        });
    }

    // Handle Form Submission (Listing)
    const listForm = document.getElementById('listForm');
    if (!listForm) {
        console.warn('listForm not found in DOM');
        return;
    }

    listForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const submitBtn = listForm.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Se trimite...';
        if (window.lucide) window.lucide.createIcons();

        try {
            // Auth check
            if (!currentUser) {
                showToast("Trebuie să fii autentificat pentru a lista un loc!", true);
                document.getElementById('loginModal')?.classList.add('active');
                return;
            }

            const spotNum = document.getElementById('spotNumber').value.trim();
            if (!spotNum) {
                showToast("Selectează mai întâi un loc de pe hartă!", true);
                return;
            }

            const pdfInput = document.getElementById('contractPdf');
            if (!pdfInput || !pdfInput.files[0]) {
                showToast("Încarcă contractul PDF înainte de a trimite!", true);
                return;
            }

            const priceVal = document.getElementById('price').value;
            if (!priceVal || parseFloat(priceVal) <= 0) {
                showToast("Introdu un preț valid!", true);
                return;
            }

            const price = parseFloat(priceVal);
            const type = document.getElementById('type').value;
            const description = document.getElementById('description')?.value || '';
            const address = document.getElementById('address').value || `Loc nominal ${spotNum}, Sector 3, București`;

            // Read PDF as base64
            const pdfFile = pdfInput.files[0];
            showToast("Se procesează fișierul...");

            const pdfBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.onerror = () => reject(new Error('Eroare la citirea PDF-ului'));
                reader.readAsDataURL(pdfFile);
            });

            let lat = 44.435, lng = 26.102;
            if (appState.selectedCoord) {
                lat = appState.selectedCoord.lat;
                lng = appState.selectedCoord.lng;
            }

            const newSpot = {
                id: Date.now(),
                gisId: appState.currentGisId || '',
                parkingCode: appState.currentParkingCode || '',
                gpsFingerprint: appState.currentGpsFingerprint || '',
                owner: currentUser.username,
                ownerFirstName: currentUser.firstName,
                spotNumber: spotNum,
                address: address,
                price: price,
                type: type,
                center: [lat, lng],
                polygon: appState.selectedPolygon, // Atașează poligonul la cerere
                status: 'pending_verification',
                description: description,
                contractPdf: pdfBase64,
                contractName: pdfFile.name,
                listedAt: new Date().toISOString()
            };

            appState.spots.push(newSpot);
            await saveState();

            // Clear temp marker
            if (appState.tempMarkerList && mapList) {
                mapList.removeLayer(appState.tempMarkerList);
                appState.tempMarkerList = null;
            }
            appState.selectedCoord = null;

            // Reset form UI
            listForm.reset();
            const pdfFileName = document.getElementById('pdfFileName');
            const pdfDropzone = document.getElementById('pdfDropzone');
            if (pdfFileName) pdfFileName.style.display = 'none';
            if (pdfDropzone) pdfDropzone.style.borderColor = 'var(--glass-border)';

            showToast("✅ Locul a fost trimis spre verificare! Poți vedea statusul în panoul de administrare.");
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;

        } catch (err) {
            console.error('Eroare la trimiterea cererii:', err);
            showToast("Eroare la trimitere: " + err.message, true);
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}


// Geocoding Search Logic
function initGeocoding() {
    const searchInput = document.getElementById('mapSearch');
    const resultsEl = document.getElementById('searchResults');
    if (!searchInput || !resultsEl) return;
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
                const data = await res.ok ? await res.json() : [];
                
                resultsEl.innerHTML = '';
                if (data.length > 0) {
                    data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'search-item';
                        div.textContent = item.display_name.split(',').slice(0, 3).join(',');
                        div.onclick = () => {
                            const lat = parseFloat(item.lat);
                            const lon = parseFloat(item.lon);
                            navigateTo('#my-spots');
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

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            resultsEl.classList.remove('show');
        }
    });
}



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
    let closestSpot = null;
    let minDistance = Infinity;
    
    appState.spots.forEach(spot => {
        const isOccupied = spot.status === 'booked';
        
        if (!isOccupied && spot.status === 'verified') {
            const dist = getDistance(userLat, userLng, spot.center[0], spot.center[1]);
            if (dist < minDistance) {
                minDistance = dist;
                closestSpot = spot;
            }
        }
    });
    
    if (closestSpot) {
        if(targetMap === map) navigateTo('#my-spots');
        targetMap.flyTo(closestSpot.center, 18);
        showToast(`Cel mai apropiat loc: ${closestSpot.address} (${minDistance.toFixed(2)} km)`);
        
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

// --- Find Spot Search Logic (3-Column) ---
let currentSearchCoords = null;

function initFindSpotSearch() {
    const input = document.getElementById('addressSearchInput');
    const suggestions = document.getElementById('addressSuggestions');
    const btnMagic = document.getElementById('magicSearchBtn');
    const btnFilters = document.getElementById('btnApplyFilters');

    if (!input || !suggestions) return;

    // 1. Autocomplete Search
    let debounceTimer;
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 3) {
            suggestions.style.display = 'none';
            return;
        }

        // Diagnostic: Arătăm că am detectat tastarea
        console.log("Searching for:", query);

        debounceTimer = setTimeout(async () => {
            try {
                suggestions.innerHTML = '<div style="padding:10px; color:#94a3b8; font-size:12px;">Se caută sugestii...</div>';
                suggestions.style.display = 'block';

                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bucuresti')}&limit=5&addressdetails=1`);
                const data = await res.json();
                
                if (data.length > 0) {
                    suggestions.innerHTML = data.map(item => `
                        <div class="suggestion-item" onclick="selectSearchAddress('${item.display_name.replace(/'/g, "\\'")}', ${item.lat}, ${item.lon})">
                            <span class="main-text">${item.name || item.display_name.split(',')[0]}</span>
                            <span class="sub-text">${item.display_name}</span>
                        </div>
                    `).join('');
                } else {
                    suggestions.innerHTML = '<div style="padding:10px; color:#94a3b8; font-size:12px;">Nicio sugestie găsită în București.</div>';
                }
            } catch (err) { 
                console.error("Geocoding error:", err);
                suggestions.style.display = 'none';
            }
        }, 400);
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });

    // 3. Filters Integration
    if (btnFilters) {
        btnFilters.addEventListener('click', () => {
            updateSearchResultsList();
            renderVisiblePolygons();
            showToast("Filtre aplicate!");
        });
    }
}

window.handleMagicSearch = async (e) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const input = document.getElementById('addressSearchInput');
    const query = input ? input.value.trim() : "";

    // Dacă avem text dar nu avem coordonate (sau textul s-a schimbat), căutăm adresa
    if (query.length > 2 && (!currentSearchCoords || input.dataset.lastQuery !== query)) {
        showToast("Căutăm adresa introdusă...");
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bucuresti')}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                currentSearchCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                input.dataset.lastQuery = query;
                // Mutăm și harta acolo pentru confirmare vizuală
                mapFind.flyTo(currentSearchCoords, 17);
            }
        } catch (err) { console.error("Search error:", err); }
    }

    // Dacă tot nu avem coordonate, folosim locația utilizatorului
    if (!currentSearchCoords) {
        if (appState.userLocation) {
            currentSearchCoords = [appState.userLocation.lat, appState.userLocation.lng];
            showToast("Căutăm cel mai apropiat loc de tine...");
        } else {
            const center = mapFind.getCenter();
            currentSearchCoords = [center.lat, center.lng];
            showToast("Folosim centrul hărții ca referință.");
        }
    }
    
    findAndShowNearest();
};

window.selectSearchAddress = (name, lat, lon) => {
    const input = document.getElementById('addressSearchInput');
    const suggestions = document.getElementById('addressSuggestions');
    
    input.value = name;
    suggestions.style.display = 'none';
    currentSearchCoords = [lat, lon];
    
    // Move map to the searched address
    mapFind.flyTo([lat, lon], 17);
    
    // Update the list based on this new point
    updateSearchResultsList();
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function updateSearchResultsList() {
    const listEl = document.getElementById('searchResultsList');
    const countEl = document.getElementById('resultsCount');
    if (!listEl) return;

    // Get filter values
    const minPrice = parseFloat(document.getElementById('filterPriceMin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('filterPriceMax').value) || 100;
    
    // Filter available spots (exclude rejected, or MINE)
    let availableSpots = appState.spots.filter(s => {
        if (s.status !== 'available') return false;
        if (s.price < minPrice || s.price > maxPrice) return false;
        
        // EXCLUDEM locurile proprii din rezultatele căutării
        if (currentUser && s.owner === currentUser.username) return false;
        
        return true;
    });

    // Sort and Filter by distance
    if (currentSearchCoords) {
        availableSpots.forEach(s => {
            s.dist = calculateDistance(currentSearchCoords[0], currentSearchCoords[1], s.center[0], s.center[1]);
        });
        
        // LIMITĂ: Doar locurile la maxim 1km distanță
        availableSpots = availableSpots.filter(s => s.dist <= 1.0);
        
        availableSpots.sort((a, b) => a.dist - b.dist);
    }

    countEl.textContent = `${availableSpots.length} rezultate`;

    if (availableSpots.length === 0) {
        listEl.innerHTML = `
            <div class="empty-results">
                <i data-lucide="search-x"></i>
                <p>Niciun loc găsit pentru filtrele selectate.</p>
            </div>`;
    } else {
        listEl.innerHTML = availableSpots.slice(0, 30).map(spot => `
            <div class="spot-card-premium" onclick="mapFind.flyTo([${spot.center}], 21); setTimeout(() => renderVisiblePolygons(), 500);">
                <div class="card-glow"></div>
                <div class="card-content">
                    <div class="card-top">
                        <div class="price-tag">${spot.price} <small>RON/h</small></div>
                        <div class="dist-tag"><i data-lucide="navigation-2"></i> ${spot.dist ? spot.dist.toFixed(2) + ' km' : 'Sector 3'}</div>
                    </div>
                    <div class="card-body">
                        <h5>Locul ${spot.spotNumber}</h5>
                        <p><i data-lucide="map-pin"></i> ${spot.address}</p>
                    </div>
                    <div class="card-footer">
                        <span>Disponibil Acum</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    if (window.lucide) window.lucide.createIcons();
}

function findAndShowNearest() {
    // Filter out own spots for the "Find Nearest" logic too
    const availableSpots = appState.spots.filter(s => {
        const isMine = currentUser && s.owner === currentUser.username;
        return s.status === 'available' && !isMine;
    });

    if (availableSpots.length === 0) {
        showToast("Nu am găsit niciun loc disponibil (al altor utilizatori) în acest moment.", true);
        return;
    }

    // Re-calculate distances
    availableSpots.forEach(s => {
        s.dist = calculateDistance(currentSearchCoords[0], currentSearchCoords[1], s.center[0], s.center[1]);
    });

    const sorted = availableSpots.sort((a, b) => a.dist - b.dist);
    const nearest = sorted[0];
    
    if (nearest) {
        // Punem un marker temporar la locația căutată de utilizator
        if (window.searchMarker) mapFind.removeLayer(window.searchMarker);
        window.searchMarker = L.marker(currentSearchCoords, {
            icon: L.divIcon({
                className: 'dest-marker',
                html: `<div style="background:#ef4444; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 15px rgba(239,68,68,1);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        }).addTo(mapFind).bindTooltip("Destinația ta", { permanent: true, direction: 'top' });

        // Zburăm la locul de parcare
        mapFind.flyTo(nearest.center, 21);
        
        setTimeout(() => {
            renderVisiblePolygons(); // Forțează randarea poligoanelor GIS
            
            // Găsim layer-ul corespunzător pentru a deschide popup-ul
            mapFind.eachLayer(layer => {
                if (layer.feature && layer.feature.properties) {
                    const props = layer.feature.properties;
                    const spotNum = String(props.numar || props.zona || '').replace('Loc nominal', '').trim();
                    if (spotNum === String(nearest.spotNumber)) {
                        layer.openPopup();
                    }
                }
            });

            showToast(`Găsit! Cel mai apropiat loc (${nearest.spotNumber}) este la ${(nearest.dist * 1000).toFixed(0)}m.`);
        }, 1200);
    }
}

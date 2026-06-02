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
const massiveMockSpots = [{"lat":44.411981,"lng":26.108311,"num":"3","code":"459"},{"lat":44.383634,"lng":26.1138612,"num":"12","code":"2067"},{"lat":44.3965545,"lng":26.1087635,"num":"17","code":"1446"},{"lat":44.3781495,"lng":26.1212175,"num":"15","code":"666"},{"lat":44.3910065,"lng":26.11439,"num":"39","code":"2644"},{"lat":44.3854288,"lng":26.1002355,"num":"3","code":"1547"},{"lat":44.3772827,"lng":26.104562,"num":"7","code":"113"},{"lat":44.3784845,"lng":26.1214515,"num":"12","code":"2599"},{"lat":44.384518,"lng":26.1180485,"num":"2","code":"3247"},{"lat":44.3839675,"lng":26.097026,"num":"1","code":"1551"},{"lat":44.392189,"lng":26.096568,"num":"13","code":"1490"},{"lat":44.380588,"lng":26.1051932,"num":"14","code":"3048"},{"lat":44.419873,"lng":26.0988242,"num":"3","code":"4560"},{"lat":44.384034,"lng":26.111707,"num":"6","code":"4190"},{"lat":44.3910335,"lng":26.0966802,"num":"10","code":"1487"},{"lat":44.387016,"lng":26.1176658,"num":"3","code":"2404"},{"lat":44.3836258,"lng":26.1137755,"num":"15","code":"2067"},{"lat":44.4085637,"lng":26.11424,"num":"14","code":"4202"},{"lat":44.3872025,"lng":26.1058965,"num":"5","code":"16"},{"lat":44.385397,"lng":26.1002792,"num":"1","code":"1547"},{"lat":44.386996,"lng":26.117795,"num":"2","code":"2404"},{"lat":44.3835785,"lng":26.1281433,"num":"6","code":"776"},{"lat":44.3939405,"lng":26.1183945,"num":"10","code":"3188"},{"lat":44.3950085,"lng":26.1184625,"num":"13","code":"3933"},{"lat":44.4172145,"lng":26.1034878,"num":"35","code":"504"},{"lat":44.3830445,"lng":26.1060153,"num":"27","code":"61"},{"lat":44.3800308,"lng":26.116862,"num":"1","code":"2085"},{"lat":44.381522,"lng":26.1031895,"num":"5","code":"47"},{"lat":44.4007113,"lng":26.1192422,"num":"1","code":"323"},{"lat":44.3912507,"lng":26.113224,"num":"4","code":"1350"},{"lat":44.384495,"lng":26.10475,"num":"2","code":"3108"},{"lat":44.384341,"lng":26.1217487,"num":"37","code":"2622"},{"lat":44.380367,"lng":26.1297755,"num":"11","code":"3481"},{"lat":44.3996985,"lng":26.102268,"num":"1","code":"1491"},{"lat":44.406334,"lng":26.1199465,"num":"5","code":"334"},{"lat":44.378107,"lng":26.123206,"num":"67","code":"805"},{"lat":44.390687,"lng":26.1086865,"num":"10","code":"4465"},{"lat":44.3811245,"lng":26.1328965,"num":"7","code":"938"},{"lat":44.4198395,"lng":26.0978125,"num":"5","code":"4576"},{"lat":44.3706655,"lng":26.1367435,"num":"9","code":"3908"},{"lat":44.393493,"lng":26.1091065,"num":"11","code":"1666"},{"lat":44.391504,"lng":26.1127405,"num":"7","code":"1347"},{"lat":44.382932,"lng":26.1257417,"num":"5","code":"753"},{"lat":44.388943,"lng":26.1321165,"num":"19","code":"3606"},{"lat":44.3832865,"lng":26.0956143,"num":"3","code":"1275"},{"lat":44.388952,"lng":26.1298178,"num":"1","code":"1115"},{"lat":44.3829057,"lng":26.1255903,"num":"10","code":"753"},{"lat":44.3802655,"lng":26.123659,"num":"25","code":"2608"},{"lat":44.388309,"lng":26.0949925,"num":"5","code":"4254"},{"lat":44.417192,"lng":26.1010218,"num":"3","code":"4577"},{"lat":44.4006695,"lng":26.115744,"num":"6","code":"4208"},{"lat":44.3849182,"lng":26.1076155,"num":"77","code":"4172"},{"lat":44.3837835,"lng":26.1064147,"num":"13","code":"230"},{"lat":44.3907685,"lng":26.1142955,"num":"13","code":"1359"},{"lat":44.4283685,"lng":26.0963537,"num":"5","code":"3772"},{"lat":44.420574,"lng":26.103596,"num":"38","code":"515"},{"lat":44.3872243,"lng":26.1059045,"num":"6","code":"16"},{"lat":44.3780305,"lng":26.120791,"num":"12","code":"2529"},{"lat":44.3909615,"lng":26.12962,"num":"13","code":"3571"},{"lat":44.3779625,"lng":26.11747,"num":"29","code":"2940"},{"lat":44.3869807,"lng":26.1036207,"num":"66","code":"4002"},{"lat":44.3857457,"lng":26.095152,"num":"8","code":"3829"},{"lat":44.3898667,"lng":26.1316505,"num":"13","code":"1790"},{"lat":44.3954148,"lng":26.1176878,"num":"2","code":"3804"},{"lat":44.3820195,"lng":26.1339445,"num":"5","code":"1078"},{"lat":44.384727,"lng":26.12126,"num":"13","code":"800"},{"lat":44.395821,"lng":26.1117742,"num":"10","code":"1291"},{"lat":44.3911555,"lng":26.0967445,"num":"15","code":"1487"},{"lat":44.380421,"lng":26.1297335,"num":"14","code":"3481"},{"lat":44.3812942,"lng":26.1344613,"num":"10","code":"2294"},{"lat":44.3779605,"lng":26.117298,"num":"27","code":"2940"},{"lat":44.424978,"lng":26.1024595,"num":"1","code":"4564"},{"lat":44.3806705,"lng":26.129335,"num":"2","code":"913"},{"lat":44.3807743,"lng":26.109769,"num":"11","code":"64"},{"lat":44.392205,"lng":26.0965498,"num":"14","code":"1490"},{"lat":44.3912095,"lng":26.114386,"num":"43","code":"2644"},{"lat":44.3713417,"lng":26.1378438,"num":"4","code":"2428"},{"lat":44.3772692,"lng":26.1046545,"num":"10","code":"113"},{"lat":44.3813495,"lng":26.1280692,"num":"18","code":"3484"},{"lat":44.3828635,"lng":26.120311,"num":"2","code":"722"},{"lat":44.3905985,"lng":26.1178375,"num":"7","code":"1374"},{"lat":44.4089558,"lng":26.1169745,"num":"11","code":"399"},{"lat":44.3812537,"lng":26.0965972,"num":"3","code":"1239"},{"lat":44.3958643,"lng":26.1117745,"num":"12","code":"1291"},{"lat":44.3809552,"lng":26.118419,"num":"13","code":"811"},{"lat":44.3805435,"lng":26.1052,"num":"12","code":"3048"},{"lat":44.380298,"lng":26.1237325,"num":"22","code":"2608"},{"lat":44.408529,"lng":26.1144278,"num":"8","code":"4202"},{"lat":44.3834467,"lng":26.0950333,"num":"5","code":"1275"},{"lat":44.3813725,"lng":26.1343145,"num":"13","code":"2294"},{"lat":44.380879,"lng":26.118306,"num":"10","code":"811"},{"lat":44.3821045,"lng":26.1346367,"num":"3","code":"2127"},{"lat":44.3958857,"lng":26.1117745,"num":"13","code":"1291"},{"lat":44.3818857,"lng":26.1322743,"num":"4","code":"849"},{"lat":44.3843385,"lng":26.105151,"num":"13","code":"274"},{"lat":44.3811625,"lng":26.1329647,"num":"4","code":"938"},{"lat":44.3774277,"lng":26.1088432,"num":"12","code":"3788"},{"lat":44.3939343,"lng":26.1010705,"num":"3","code":"4369"},{"lat":44.3837527,"lng":26.1214785,"num":"4","code":"2623"},{"lat":44.3912715,"lng":26.1132237,"num":"5","code":"1350"},{"lat":44.400464,"lng":26.1192358,"num":"12","code":"323"},{"lat":44.3870832,"lng":26.1036865,"num":"61","code":"4002"},{"lat":44.398948,"lng":26.1018792,"num":"32","code":"3143"},{"lat":44.3829135,"lng":26.120261,"num":"5","code":"722"},{"lat":44.4198705,"lng":26.0979385,"num":"3","code":"4576"},{"lat":44.3852353,"lng":26.1188953,"num":"3","code":"3251"},{"lat":44.3862872,"lng":26.099862,"num":"7","code":"1744"},{"lat":44.3875445,"lng":26.0909982,"num":"13","code":"1683"},{"lat":44.3911222,"lng":26.108671,"num":"4","code":"4465"},{"lat":44.390828,"lng":26.1299365,"num":"1","code":"3571"},{"lat":44.385223,"lng":26.118872,"num":"2","code":"3251"},{"lat":44.3802765,"lng":26.1236835,"num":"24","code":"2608"},{"lat":44.383096,"lng":26.0943172,"num":"61","code":"3490"},{"lat":44.387022,"lng":26.1036475,"num":"64","code":"4002"},{"lat":44.3898335,"lng":26.1317235,"num":"10","code":"1790"},{"lat":44.392482,"lng":26.1164805,"num":"10","code":"3521"},{"lat":44.3909285,"lng":26.129699,"num":"10","code":"3571"},{"lat":44.3829448,"lng":26.0943265,"num":"54","code":"3490"},{"lat":44.3792878,"lng":26.0938765,"num":"5","code":"1833"},{"lat":44.378303,"lng":26.1112257,"num":"6","code":"3653"},{"lat":44.3738535,"lng":26.0933085,"num":"4","code":"1169"},{"lat":44.3838555,"lng":26.0979097,"num":"4","code":"1573"},{"lat":44.3893947,"lng":26.1151335,"num":"15","code":"3231"},{"lat":44.3810488,"lng":26.0956572,"num":"16","code":"2029"},{"lat":44.3828333,"lng":26.133747,"num":"93","code":"3711"},{"lat":44.3838777,"lng":26.0978208,"num":"1","code":"1573"},{"lat":44.3966452,"lng":26.1124213,"num":"14","code":"1294"},{"lat":44.3903873,"lng":26.1249785,"num":"13","code":"2806"},{"lat":44.386552,"lng":26.1366045,"num":"11","code":"3711"},{"lat":44.3982678,"lng":26.108106,"num":"7","code":"4477"},{"lat":44.3862085,"lng":26.0997417,"num":"2","code":"1744"},{"lat":44.3824897,"lng":26.0984177,"num":"19","code":"3087"},{"lat":44.419957,"lng":26.099089,"num":"6","code":"4560"},{"lat":44.380013,"lng":26.120076,"num":"12","code":"898"},{"lat":44.377739,"lng":26.115428,"num":"4","code":"2938"},{"lat":44.412112,"lng":26.109397,"num":"12","code":"461"},{"lat":44.3866402,"lng":26.130588,"num":"45","code":"3714"},{"lat":44.377305,"lng":26.1044088,"num":"2","code":"113"},{"lat":44.381479,"lng":26.120977,"num":"10","code":"715"},{"lat":44.392074,"lng":26.0955085,"num":"12","code":"1636"}];

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
        // Așteptăm până la 10 secunde ca Firebase să se descarce și să se inițializeze
        for(let i=0; i<100; i++) {
            if(window.fbAPI) break;
            await new Promise(r => setTimeout(r, 100));
        }

        if (!window.fbAPI) {
            throw new Error("Firebase SDK timeout");
        }

        console.log("Loading spots from Firebase Firestore...");
        const spots = await window.fbAPI.getAllActiveSpots();
        
        if (spots && spots.length > 0) {
            // Păstrăm în memorie doar parcările valide (cu coordonate)
            appState.spots = spots.filter(s => s.center || (s.lat && s.lng));
            console.log(`State loaded: ${appState.spots.length} active spots from cloud.`);
        } else {
            console.log("No active spots in cloud database yet.");
            appState.spots = [];
        }
    } catch (err) {
        console.warn("Failed to load spots from Firebase.", err);
        appState.spots = [];
    }
}

async function saveState() {
    // Funcția saveState() globală (care salva tot array-ul) devine redundantă
    // Deoarece Firebase lucrează cu documente individuale (addSpot / updateSpot)
    // Lăsăm funcția goală pentru backward compatibility în caz că mai e chemată din greșeală
    console.log("saveState() a fost înlocuit cu operațiuni atomice Firebase.");
}

function startClock() {
    const clockEls = document.querySelectorAll('.digital-clock');
    if (!clockEls.length) return;
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        clockEls.forEach(el => el.textContent = timeStr);
    }, 1000);
}

// --- Navigation ---

function initNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                // Nu prevenim pentru modale dacă folosesc alt sistem, dar pentru navigare e OK
                if (link.hasAttribute('data-open-modal')) return;
                
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

        // Update bottom nav active state
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === targetId) {
                item.classList.add('active');
            }
        });

        // Force map refreshes
        if (targetId === '#list' && typeof mapList !== 'undefined') setTimeout(() => mapList.invalidateSize(), 100);
        if (targetId === '#my-spots' && typeof map !== 'undefined') setTimeout(() => map.invalidateSize(), 100);
        if (targetId === '#find-spot' && typeof mapFind !== 'undefined') {
            setTimeout(() => {
                mapFind.invalidateSize();
                if (navigator.geolocation && !window.hasCenteredMapFind) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        mapFind.flyTo([lat, lng], 17);
                        window.hasCenteredMapFind = true;
                        
                        if (typeof appState !== 'undefined') {
                            appState.userLocation = { lat, lng };
                        }
                        if (typeof currentSearchCoords !== 'undefined') {
                            currentSearchCoords = [lat, lng];
                        }
                        if (typeof showToast !== 'undefined') {
                            showToast("Harta a fost centrată pe locația ta.");
                        }
                        if (typeof updateSearchResultsList === 'function') {
                            updateSearchResultsList();
                        }
                    }, (err) => {
                        console.warn("Geolocation error on #find-spot open", err);
                    }, { timeout: 5000, enableHighAccuracy: true });
                }
            }, 100);
        }
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
    const authContainers = document.querySelectorAll('.authContainer');
    const adminLis = document.querySelectorAll('.adminNavLi');
    const mySpotsLis = document.querySelectorAll('.mySpotsNavLi');

    if (currentUser) {
        // Restricted Admin Link Visibility
        adminLis.forEach(li => li.style.display = (currentUser.username === 'admin') ? '' : 'none');
        mySpotsLis.forEach(li => li.style.display = '');

        const avatarUrl = currentUser.avatarBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName)}&background=3b82f6&color=fff`;
        
        // Ensure wallet balance is initialized
        if (currentUser.walletBalance === undefined) currentUser.walletBalance = 45;

        authContainers.forEach(container => {
            container.innerHTML = `
                <div class="wallet-pill" onclick="document.getElementById('walletModal').classList.add('active'); document.getElementById('walletBalanceDisplay').textContent = currentUser.walletBalance + ' RON';"
                    style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; background: rgba(245, 158, 11, 0.1); padding: 0.35rem 0.65rem; border-radius: 30px; border: 1px solid rgba(245, 158, 11, 0.3); color: #f59e0b; font-weight: 700; font-size: 0.8rem;" title="Portofel Virtual (Circuit Închis)">
                    <i data-lucide="wallet" style="width: 14px; height: 14px;"></i> ${currentUser.walletBalance} RON
                </div>
                <div class="profile-pill" 
                    data-open-modal="profileModal"
                    style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: rgba(255,255,255,0.05); padding: 0.4rem 1rem; border-radius: 30px; border: 1px solid var(--glass-border);">
                    <img src="${avatarUrl}" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">
                    <span style="font-weight: 600; font-size: 0.85rem;" class="hide-mobile">Salut, ${currentUser.firstName}</span>
                </div>
            `;
        });
    } else {
        adminLis.forEach(li => li.style.display = 'none');
        mySpotsLis.forEach(li => li.style.display = 'none');
        authContainers.forEach(container => {
            container.innerHTML = `
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-outline hide-mobile" data-open-modal="registerModal">Cont Nou</button>
                    <button class="btn btn-primary" data-open-modal="loginModal"><i data-lucide="user" class="mobile-only" style="display:none;"></i> <span class="hide-mobile">Autentificare</span></button>
                </div>
            `;
        });
    }
}

// Global Click Listener for Modals
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-open-modal]');
    if (target) {
        const modalId = target.getAttribute('data-open-modal');
        
        if (modalId === 'profileModal' && currentUser) {
            document.getElementById('profFirstName').value = currentUser.firstName || '';
            document.getElementById('profLastName').value = currentUser.lastName || '';
            document.getElementById('profPhone').value = currentUser.phone || currentUser.contact || '';
            document.getElementById('profCarPlate').value = currentUser.carPlate || '';
        }
        
        document.getElementById(modalId)?.classList.add('active');
    }
    
    // Closer logic
    if (e.target.closest('.modal-overlay') && !e.target.closest('.modal-card') && !e.target.closest('.modal-content') && !e.target.closest('.chat-fs')) {
        e.target.closest('.modal-overlay').classList.remove('active');
    }
    if (e.target.closest('.btn-icon') && e.target.closest('.modal-header')) {
        e.target.closest('.modal-overlay').classList.remove('active');
    }
});

// --- Auth Forms ---

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return showToast("Adresa de email nu este validă!", true);
    }
    if (!/^07\d{8}$/.test(phone)) {
        return showToast("Numărul de telefon trebuie să înceapă cu 07 și să aibă exact 10 cifre!", true);
    }
    if (password.length < 8 || !/\d/.test(password)) {
        return showToast("Parola trebuie să aibă minim 8 caractere și să conțină cel puțin o cifră!", true);
    }

    const userData = {
        firstName: document.getElementById('regFirstName').value.trim(),
        lastName: document.getElementById('regLastName').value.trim(),
        username: document.getElementById('regUsername').value.trim(),
        phone: phone,
        avatarBase64: ""
    };

    try {
        // Apelează Firebase Register
        const fbUser = await window.fbAPI.register(email, password, userData);
        
        currentUser = { email, ...userData };
        localStorage.setItem('parkshare_user', JSON.stringify(currentUser));
        localStorage.setItem('parkshare_onboarded', 'true');
        
        // Închidem modalele
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
        showToast(`Bine ai venit, ${userData.firstName}! Cont creat în cloud cu succes.`);
    } catch (err) { 
        console.error(err);
        if(err.code === 'auth/email-already-in-use') {
            showToast("Acest email este deja înregistrat!", true);
        } else {
            showToast("Eroare la înregistrare: " + err.message, true);
        }
    }
});

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const contact = document.getElementById('loginContact').value.trim();
    const pass = document.getElementById('loginPassword').value;
    
    // Transformăm telefonul în email fictiv dacă user-ul introduce telefon
    let emailToUse = contact;
    if (/^07\d{8}$/.test(contact)) {
        emailToUse = `${contact}@parkshare.local`;
    }

    try {
        // Apelează Firebase Login
        const fbUser = await window.fbAPI.login(emailToUse, pass);
        
        // Preluăm profilul complet din Firestore
        const profile = await window.fbAPI.getUserProfile(fbUser.uid);
        if (profile) {
            currentUser = profile;
            localStorage.setItem('parkshare_user', JSON.stringify(currentUser));
        } else {
            // Fallback în caz că datele din Firestore lipsesc
            currentUser = { email: fbUser.email, firstName: "Utilizator" };
        }
        
        document.getElementById('loginModal').classList.remove('active');
        renderAuthUI();
        showToast(`Salut, ${currentUser.firstName}! Logat din cloud.`);
    } catch (err) { 
        console.error(err);
        showToast("Date incorecte sau cont inexistent!", true); 
    }
});

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const newFirstName = document.getElementById('profFirstName').value.trim();
    const newLastName = document.getElementById('profLastName').value.trim();
    const newPhone = document.getElementById('profPhone').value.trim();
    const newCarPlate = document.getElementById('profCarPlate').value.trim();

    if (!/^07\d{8}$/.test(newPhone)) {
        return showToast("Numărul de telefon trebuie să înceapă cu 07 și să aibă exact 10 cifre!", true);
    }

    currentUser.firstName = newFirstName;
    currentUser.lastName = newLastName;
    currentUser.phone = newPhone;
    currentUser.carPlate = newCarPlate;

    try {
        const res = await fetch(USERS_URL);
        let users = res.ok ? (await res.json() || []) : [];
        
        // Update user in DB
        users = users.map(u => u.username === currentUser.username ? currentUser : u);
        
        await fetch(USERS_URL, { method: 'POST', body: JSON.stringify(users) });
        
        localStorage.setItem('parkshare_user', JSON.stringify(currentUser));
        
        document.getElementById('profileModal').classList.remove('active');
        renderAuthUI();
        showToast("Profil actualizat cu succes!");
    } catch (err) { 
        showToast("Eroare la salvarea profilului", true); 
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        await window.fbAPI.logout();
        currentUser = null;
        localStorage.removeItem('parkshare_user');
        document.getElementById('profileModal').classList.remove('active');
        renderAuthUI();
        window.location.hash = '#hero';
        showToast("Te-ai deconectat cu succes.");
    } catch(err) {
        showToast("Eroare la deconectare.", true);
    }
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
                    ? `<button class="btn btn-sm btn-outline" onclick="downloadContract(\'${spot.id}\')" 
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
                    onclick="approveSpot(\'${spot.id}\')" 
                    style="margin-right: 0.5rem; ${spot.status === 'verified' ? 'cursor:default;opacity:0.7;' : ''}">
                    ${spot.status === 'verified' ? '✓ Aprobat' : 'Aprobă'}
                </button>
                <button class="btn btn-sm ${spot.status === 'rejected' ? 'btn-primary' : 'btn-outline'}" 
                    onclick="rejectSpot(\'${spot.id}\')" 
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
    
    try {
        const myOwnedSpots = appState.spots.filter(s => s.owner === currentUser.username);
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
                const dateStr = spot.availability?.date ? new Date(spot.availability.date).toLocaleDateString('ro-RO') : 'Azi';
                const lat = spot.center?.[0] || 0;
                const lng = spot.center?.[1] || 0;

                html += `
                <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid #f59e0b; display: flex; flex-direction: column; gap: 1rem; background: rgba(245, 158, 11, 0.05);">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <h3 style="color: #f59e0b; margin: 0;">Loc ${spot.spotNumber || '?'}</h3>
                            <p style="font-size: 0.85rem; color: var(--text-muted);">${spot.address || 'Fără adresă'}</p>
                        </div>
                        <div style="text-align: right;">
                            <div id="timer-label-${spot.id}" style="font-size: 0.7rem; color: #f59e0b; font-weight: 800;">STATUS:</div>
                            <div id="countdown-${spot.id}" class="status-text-top" style="font-size: 1.2rem; font-weight: 800; color: white; line-height:1.1;">--:--</div>
                        </div>
                    </div>
                    <div style="font-size: 0.85rem; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: var(--text-muted);">Data:</span>
                            <b style="color: white;">${dateStr}</b>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">Interval:</span>
                            <b style="color: white;">${spot.availability?.start || 'N/A'} - ${spot.availability?.end || 'N/A'}</b>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                        <button class="btn btn-sm btn-outline" onclick="startInternalCall('${spot.owner || ''}')" style="border-color: #22c55e; color: #22c55e; display: flex; justify-content: center; align-items: center; gap: 0.5rem;">
                            <i data-lucide="phone" style="width: 14px; height: 14px;"></i> Sună (Intern)
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="openChat('${spot.owner || ''}')" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem;">
                            <i data-lucide="message-circle" style="width: 14px; height: 14px;"></i> Mesaj
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="btn btn-sm btn-primary btn-block" style="background: #34a853; border-color: #34a853; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 0.5rem; font-weight: 700; padding: 0.75rem;">
                            <i data-lucide="map-pin" style="width: 16px; height: 16px;"></i> Deschide în Google Maps
                        </a>
                        <button class="btn btn-sm btn-primary btn-block" style="background: var(--primary); border-color: var(--primary); font-weight: 700; padding: 0.75rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem;" onclick="openReviewModal('${spot.id}', '${spot.spotNumber}')">
                            <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Finalizează Parcarea
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem;">
                        <button class="btn btn-sm btn-outline btn-block" style="border-color: var(--glass-border); color: var(--text-muted); display: flex; justify-content: center; align-items: center; gap: 0.5rem;" onclick="cancelBooking(\'${spot.id}\')">
                            <i data-lucide="x-circle" style="width: 14px; height: 14px;"></i> Anulează
                        </button>
                        <button class="btn btn-sm btn-outline btn-block" style="border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.05); display: flex; justify-content: center; align-items: center; gap: 0.5rem;" onclick="openIncidentModal(\'${spot.id}\')">
                            <i data-lucide="alert-triangle" style="width: 14px; height: 14px;"></i> Alertă Abuz
                        </button>
                    </div>
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
                const isAvailable = spot.status === 'available';
                const statusClass = spot.status === 'pending_verification' ? 'pending'
                    : (spot.status === 'verified' || isAvailable || isBooked) ? 'verified' : 'rejected';
                
                let statusLabel = '❌ Respins';
                if (spot.status === 'pending_verification') statusLabel = '⏳ În așteptare';
                else if (isBooked) statusLabel = '✅ Aprobat (Rezervat)';
                else if (isAvailable) statusLabel = '✅ Activ (Listat)';
                else if (spot.status === 'verified') statusLabel = '✅ Aprobat';

                const lat = spot.center?.[0] || 0;
                const lng = spot.center?.[1] || 0;
                const listedDate = spot.listedAt ? new Date(spot.listedAt).toLocaleDateString('ro-RO') : 'N/A';
                const availDate = spot.availability?.date ? new Date(spot.availability.date).toLocaleDateString('ro-RO') : 'Azi';

                html += `
                <div class="glass-card" style="padding: 1.5rem; position: relative; display: flex; flex-direction: column; gap: 1rem; border-left: 4px solid ${isBooked ? '#f59e0b' : (isAvailable ? '#3b82f6' : 'transparent')};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3 style="color: var(--primary); margin: 0;">Loc ${spot.spotNumber || '?'}</h3>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${spot.address || 'Fără adresă'}</p>
                        </div>
                        <span class="status-badge status-${statusClass}" style="font-size: 0.75rem;">${statusLabel}</span>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                            <span style="color: var(--text-muted);">Tarif:</span>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-weight: 600; color: white;">${spot.price || 0} RON/oră</span>
                                ${isBooked ? '' : `
                                <button class="btn-icon" onclick="editSpotPrice(\'${spot.id}\')" style="padding: 2px; height: 24px; width: 24px;" title="Modifică Tarif">
                                    <i data-lucide="edit-2" style="width: 14px; height: 14px; color: var(--primary);"></i>
                                </button>
                                `}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-muted);">Listat la:</span>
                            <span>${listedDate}</span>
                        </div>
                        
                        ${isBooked || isAvailable ? `
                        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
                            <div style="color: ${isBooked ? '#f59e0b' : '#3b82f6'}; font-weight: 700; font-size: 0.8rem; margin-bottom: 4px;">
                                ${isBooked ? '📅 LOC REZERVAT' : '📅 LISTAT ACTIV'}
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                                <span style="color: var(--text-muted);">Data:</span>
                                <span style="font-weight: 600; color: white;">${availDate}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                <span style="color: var(--text-muted);">Interval:</span>
                                <span style="font-weight: 600; color: white;">${spot.availability?.start || 'N/A'} - ${spot.availability?.end || 'N/A'}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                        ${spot.status === 'pending_verification' ? `
                        <button class="btn btn-sm btn-primary btn-block" style="background: #475569; border-color: #475569; opacity: 0.5; cursor: not-allowed;" disabled title="Locul trebuie aprobat de administrator înainte de a fi listat.">
                            <i data-lucide="clock" style="width: 14px; height: 14px; margin-right: 4px;"></i> Așteaptă Aprobare
                        </button>
                        <button class="btn btn-sm btn-outline btn-block" style="border-color: #ef4444; color: #ef4444;" onclick="deleteSpot(\'${spot.id}\')">
                            Șterge
                        </button>
                        ` : `
                        <button class="btn btn-sm btn-primary btn-block" style="background: ${isBooked ? '#475569' : '#3b82f6'}; border-color: ${isBooked ? '#475569' : '#3b82f6'}; ${isBooked ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${isBooked ? 'disabled' : `onclick="openListSpotModal(\'${spot.id}\')"`} title="${isBooked ? 'Nu poți modifica un loc cât timp este rezervat.' : ''}">
                            <i data-lucide="clock" style="width: 14px; height: 14px; margin-right: 4px;"></i> ${isBooked ? 'Indisponibil' : 'Listează Acum'}
                        </button>
                        <button class="btn btn-sm btn-outline btn-block" style="border-color: #ef4444; color: #ef4444; ${isBooked ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${isBooked ? 'disabled' : `onclick="deleteSpot(\'${spot.id}\')"`} title="${isBooked ? 'Nu poți șterge un loc rezervat.' : ''}">
                            Șterge
                        </button>
                        `}
                    </div>
                    ${isBooked ? `
                    <button class="btn btn-sm btn-primary btn-block" style="margin-top: 0.5rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem;" onclick="openChat('${spot.bookedBy || 'Chiriaș'}')">
                        <i data-lucide="message-circle" style="width: 14px; height: 14px;"></i> Mesaj Chiriaș
                    </button>
                    ` : ''}
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="btn btn-sm btn-outline btn-block" style="margin-top: 0.5rem; text-decoration: none; display: flex; justify-content: center; align-items: center; gap: 0.5rem;">
                        <i data-lucide="navigation" style="width: 14px; height: 14px;"></i> Vezi Drumul spre Loc
                    </a>
                </div>`;
            });
        }

        list.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        startAllCountdowns();
    } catch (err) {
        list.innerHTML = '<div style="color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 2rem; border-radius: 12px; border: 1px solid #ef4444; text-align: center;">Eroare la afișare. Te rog reîncarcă pagina. (' + err.message + ')</div>';
        empty.style.display = 'none';
        console.error("renderMySpots error:", err);
    }
}

function startAllCountdowns() {
    const activeRes = appState.spots.filter(s => s.bookedBy === currentUser?.username && s.status === 'booked');
    activeRes.forEach(spot => {
        const timerEl = document.getElementById(`countdown-${spot.id}`);
        if (!timerEl) return;

        const update = () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const [startH, startM] = (spot.availability?.start || "00:00").split(':').map(Number);
            const [endH, endM] = (spot.availability?.end || "23:59").split(':').map(Number);
            
            // Folosim constructorul local (an, luna-1, zi, ora, min) pentru a evita UTC offset bugs
            const startTime = new Date(year, month - 1, day, startH, startM, 0, 0);
            const endTime = new Date(year, month - 1, day, endH, endM, 0, 0);

            const labelEl = document.getElementById(`timer-label-${spot.id}`);
            let cardStatus = timerEl.closest('.glass-card').querySelector('.status-text-top');

            // 1. VIITOR: Încă nu a început ora de rezervare
            if (now < startTime) {
                let diff = startTime - now;
                if (labelEl) labelEl.textContent = "URMEAZĂ SĂ PARCHEZI:";
                timerEl.style.color = "#3b82f6"; // Albastru pentru viitor
                
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                timerEl.textContent = `${h > 0 ? h + 'h ' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
                
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
                
                // 15-minute warning (900,000 ms)
                if (diff <= 900000 && diff > 899000 && !spot._notified15m) {
                    spot._notified15m = true;
                    window.sendPushNotification(
                        "Timp la limită!", 
                        "Atenție, expiră timpul în 15 min! Eliberează locul sau cere o prelungire.",
                        "alert"
                    );
                }
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                timerEl.textContent = `${h > 0 ? h + 'h ' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;


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

            if (cardStatus) {
                cardStatus.textContent = "EXPIRAT";
                cardStatus.style.color = "#ef4444";
            }
            
            if (spot.status === 'booked') {
                spot.status = 'available';
                delete spot.bookedBy;
                delete spot.bookedAt;
                saveState();
                window.sendPushNotification("Timp Expirat", `Rezervarea pentru locul ${spot.spotNumber} a expirat!`);
                setTimeout(() => renderMySpots(), 2000);
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
    
    if (isNaN(newPrice) || newPrice < 1 || newPrice > 5) {
        showToast("Prețul trebuie să fie între 1 și 5 RON/oră.", true);
        return;
    }

    spot.price = newPrice;
    await saveState();
    
    document.getElementById('editPriceModal').classList.remove('active');
    renderMySpots();
    renderVisiblePolygons();
    showToast("Tarif actualizat cu succes!");
};

let currentListingSpotId = null;

window.openListSpotModal = (id) => {
    const spot = appState.spots.find(s => s.id === id);
    if (!spot) return;

    currentListingSpotId = id;
    document.getElementById('listSpotInfo').textContent = `Loc ${spot.spotNumber} - ${spot.address}`;
    
    // Set default date to today using local timezone
    const now = new Date();
    const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    document.getElementById('listSpotDate').value = today;
    
    document.getElementById('listSpotModal').classList.add('active');
};

window.confirmListSpot = async () => {
    const spot = appState.spots.find(s => s.id === currentListingSpotId);
    if (!spot) return;

    const dateVal = document.getElementById('listSpotDate').value;
    const startVal = document.getElementById('listSpotStart').value;
    const endVal = document.getElementById('listSpotEnd').value;

    if (!dateVal || !startVal || !endVal) {
        showToast("Te rog completează toate câmpurile!", true);
        return;
    }

    spot.availability = {
        date: dateVal,
        start: startVal,
        end: endVal
    };
    spot.status = 'available'; // Mark it as actively listed for rent

    await saveState();
    
    document.getElementById('listSpotModal').classList.remove('active');
    renderMySpots();
    renderVisiblePolygons();
    showToast("Locul a fost listat cu succes!");
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

// --- Push Notifications ---
window.requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
};

window.playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // WhatsApp-like double beep
        const playBeep = (freq, startTime, duration) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
            gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + startTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + startTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start(audioCtx.currentTime + startTime);
            oscillator.stop(audioCtx.currentTime + startTime + duration);
        };

        playBeep(880, 0, 0.1);
        playBeep(880, 0.15, 0.1);
    } catch (e) {
        console.log("AudioContext not supported or blocked");
    }
};

window.sendPushNotification = async (title, body, type = 'default') => {
    // Play sound & Vibrate strongly (WhatsApp style) if it's a message or alert
    window.playNotificationSound();
    if (navigator.vibrate) {
        if (type === 'message') {
            navigator.vibrate([200, 100, 200]); // Short double vibrate
        } else if (type === 'alert') {
            navigator.vibrate([500, 200, 500, 200, 500]); // Long emergency vibrate
        }
    }

    const hasPermission = await window.requestNotificationPermission();
    if (hasPermission) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification(title, {
                    body: body,
                    vibrate: type === 'alert' ? [500, 200, 500] : [200, 100, 200],
                    requireInteraction: type === 'alert'
                });
            } catch (e) {
                new Notification(title, { body: body });
            }
        } else {
            new Notification(title, { body: body });
        }
    } else {
        // Fallback
        showToast(title + " - " + body);
    }
};
// Function to initialize the map
function initMap() {
    map = L.map('mapDashboard', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.397, 26.103], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(map);

    mapList = L.map('map-list', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.397, 26.103], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
        maxNativeZoom: 19,
        maxZoom: 22
    }).addTo(mapList);

    mapFind = L.map('mapFind', {
        scrollWheelZoom: true,
        maxZoom: 22
    }).setView([44.397, 26.103], 13);

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
    
    // Layer initializations for GIS
    polygonLayerFind = L.layerGroup().addTo(mapFind);
    polygonLayerList = L.layerGroup().addTo(mapList);
    polygonLayerMain = L.layerGroup().addTo(map);

    // Initial fetch
    loadStaticPOIs();
    loadS4Polygons();

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

async function loadS4Polygons() {
    if (window.S4_POINTS) {
        allPolygons = window.S4_POINTS.features.filter(f => [0, 1, 2, 3, 4].includes(f.properties.ocupat));
        renderVisiblePolygons();
        return;
    }

    // Load dynamically so it doesn't block the UI thread during initial startup
    console.log("Loading S4 Polygons (12MB) in the background...");
    const script = document.createElement('script');
    script.src = "s4_points_nominatim.js";
    script.async = true;
    script.onload = () => {
        console.log("S4_POINTS loaded successfully.");
        if (window.S4_POINTS) {
            allPolygons = window.S4_POINTS.features.filter(f => [0, 1, 2, 3, 4].includes(f.properties.ocupat));
            renderVisiblePolygons();
        }
    };
    script.onerror = () => {
        console.warn("Failed to load s4_points_nominatim.js");
    };
    document.body.appendChild(script);
}

function renderVisiblePolygons() {
    if(!polygonLayerMain) return; 
    
    // Optimizare: Randăm doar hărțile care sunt vizibile pe ecran
    if (document.getElementById('mapFind') && document.getElementById('mapFind').offsetParent !== null) {
        renderPolygonsForMap(mapFind, polygonLayerFind, false);
    }
    if (document.getElementById('map-list') && document.getElementById('map-list').offsetParent !== null) {
        renderPolygonsForMap(mapList, polygonLayerList, true);
    }
    if (document.getElementById('mapDashboard') && document.getElementById('mapDashboard').offsetParent !== null) {
        renderPolygonsForMap(map, polygonLayerMain, false);
    }
}

async function renderPolygonsForMap(targetMap, targetLayer, isListMap) {
    // Pragul de afișare la zoom 19 pentru performanță
    if (!targetMap || targetMap.getZoom() < 19) {
        targetLayer?.clearLayers();
        return;
    }
    const bounds = targetMap.getBounds();
    
    let visibleFeatures = [];
    
    // Verificăm dacă folosim API-ul nou sau varianta veche (fallback fără server)
    if (window.S4_POINTS && typeof allPolygons !== 'undefined') {
        visibleFeatures = allPolygons.filter(f => {
            const coords = f.geometry.coordinates; 
            if (!coords || coords.length !== 2) return false;
            return bounds.contains(L.latLng(coords[1], coords[0]));
        });
    } else {
        // Apel API Dinamic (Bounding Box)
        try {
            const n = bounds.getNorth();
            const s = bounds.getSouth();
            const e = bounds.getEast();
            const w = bounds.getWest();
            
            // Limităm zecimalele pentru URL mai curat
            const url = `/api/parking?n=${n.toFixed(6)}&s=${s.toFixed(6)}&e=${e.toFixed(6)}&w=${w.toFixed(6)}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error("HTTP " + response.status);
            visibleFeatures = await response.json();
            
        } catch (err) {
            console.warn("API Bounding Box Error:", err);
            // Dacă API-ul pică, nu ștergem markerele vechi
            return;
        }
    }

    // Ștergem markerele vechi doar după ce am descărcat cu succes datele noi
    targetLayer.clearLayers();

    const getPolygonTypeText = (status) => {
        switch(status) {
            case 0: return 'Loc nominal liber';
            case 1: return 'Loc nominal ocupat';
            case 2: return 'Loc persoană cu handicap';
            case 3: return 'Loc persoană cu handicap';
            case 4: return 'Handicap aflat în tranzit';
            case 5: return 'Rezervat instituție publică';
            case 6: return 'Loc nenominal';
            case 7: return 'Loc nenominal temporar';
            case 8: return 'În procedură de atribuire';
            default: return 'Tip necunoscut';
        }
    };

    const getStatusClass = (status) => {
        if (status >= 0 && status <= 8) return `spot-status-${status}`;
        return 'spot-status-default';
    };

    visibleFeatures.forEach(feature => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        const lat = coords[1];
        const lng = coords[0];
        
        const spotNum = String(props.numar || props.zona || 'N/A').replace('Loc nominal', '').trim();
        const parkCode = String(props.cod_parcare || props.id_parcare || props.id_zona || props.nume_parcare || props.cod_loc || props.baterie || props.zona || '');
        const gisId = String(props.id || props.OBJECTID || props.FID || '');
        
        let fingerprint = `${lat.toFixed(6)},${lng.toFixed(6)}`;

        const listedSpot = appState.spots.find(s => {
            if (s.status === 'rejected') return false;
            if (s.gpsFingerprint && fingerprint && s.gpsFingerprint === fingerprint) return true;
            if (s.gisId && gisId && String(s.gisId) === gisId) return true;
            if (s.parkingCode && parkCode && s.parkingCode === parkCode && String(s.spotNumber).replace('Loc nominal', '').trim() === spotNum) return true;
            return false;
        });

        // Pentru harta de căutare (mapFind), arătăm DOAR locurile disponibile (albastre)
        if (targetMap === mapFind) {
            const isBlue = listedSpot && (listedSpot.status === 'available' || listedSpot.status === 'verified' || listedSpot.status === 'pending_verification');
            if (!isBlue) return; // Sărim peste randarea acestui marker
        }

        // Pentru harta de ofertare (mapList), ascundem complet locurile care sunt deja listate/oferite
        if (isListMap && listedSpot) {
            return;
        }

        const isMine = listedSpot ? (listedSpot.owner === currentUser?.username) : false;
        const isBooked = listedSpot ? (listedSpot.status === 'booked') : false;
        
        let htmlClass = getStatusClass(props.ocupat);
        if (listedSpot) {
            if (isBooked) htmlClass = 'spot-status-temp';
            else if (isMine) htmlClass = 'spot-status-0';
            else htmlClass = 'spot-status-default';
        }

        let iconHtml = '';
        
        // Dacă locul e pentru handicap (2, 3 sau 4), folosim iconița de scaun cu rotile
        // Ocupat=2 (relocare) devine tot loc de handicap conform cerinței
        if (props.ocupat === 2 || props.ocupat === 3 || props.ocupat === 4) {
            iconHtml = `
            <div style="width: 22px; height: 22px; position: relative; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border-radius: 2px; border: 1px solid #94a3b8; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.6569 2 15 3.34315 15 5C15 6.65685 13.6569 8 12 8C10.3431 8 9 6.65685 9 5C9 3.34315 10.3431 2 12 2ZM8.08332 9.07067C8.1752 9.02052 8.27838 9 8.38423 9H13V11H10.8741L12.7842 16.5936C12.8228 16.7067 12.8123 16.8294 12.756 16.9351C12.6997 17.0409 12.6027 17.1199 12.4883 17.1557L8.91038 18.2737L9.50856 20H15C15.5523 20 16 19.5523 16 19V15H18V19C18 20.6569 16.6569 22 15 22H8C7.62534 22 7.2796 21.7925 7.09886 21.4608L5.59886 18.7057C5.46231 18.4548 5.4859 18.1504 5.66014 17.9221L9.13038 13.3768L8.60105 11.8268L6.5 12.5V10.5L8.08332 9.07067Z"/>
                </svg>
                <div style="position: absolute; bottom: 0px; right: 0px; font-family: 'Times New Roman', Times, serif; font-size: 10px; font-weight: bold; color: #333; line-height: 1; z-index: 2;">${spotNum}</div>
            </div>`;
        } else {
            let bgColor = '#b8525b'; // default ocupat (1) - ROSU
            if(props.ocupat === 0) bgColor = '#5a835b'; // liber (0) - VERDE

            if(listedSpot) {
                if(listedSpot.status === 'available' || listedSpot.status === 'verified') bgColor = '#3b82f6'; // ALBASTRU (disponibil la închiriere)
                else if(isBooked) bgColor = '#eab308'; // GALBEN (deja închiriat/rezervat)
                else if(isMine) bgColor = '#4ade80'; // VERDE DESCHIS (locul meu)
            }

            iconHtml = `
            <div style="width: 22px; height: 22px; position: relative; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border-radius: 2px; border: 1px solid rgba(255,255,255,0.7); background-color: ${bgColor}; color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.6);">
                <span style="font-family: Arial, sans-serif; font-size: 14px; font-weight: 900; line-height: 1; margin-top: -2px; margin-left: -2px;">P</span>
                <div style="position: absolute; bottom: -3px; right: -2px; font-family: 'Times New Roman', Times, serif; font-size: 11px; font-weight: bold; color: white; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 2px 2px rgba(0,0,0,0.8); line-height: 1; z-index: 2;">${spotNum}</div>
            </div>`;
        }

        const icon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const marker = L.marker([lat, lng], { icon: icon, pane: listedSpot ? 'markerPane' : 'overlayPane' });
        marker.spotNumber = spotNum; // Attach for easy lookup

        // Popup logic
        if (!listedSpot) {
            if (isListMap) {
                marker.bindPopup(`
                    <div style="text-align:center; min-width:160px;">
                        <b style="color:#3b82f6;">Loc: ${spotNum}</b><br>
                        <span style="font-size:11px; color:gray;">Parcare: ${parkCode || 'N/A'}</span><br>
                        <span style="font-size:12px;">${getPolygonTypeText(props.ocupat)}</span><br><br>
                        <button type="button" onclick="selectSpotFromMap('${spotNum}', [[${lat},${lng}]], '${gisId}', '${parkCode}')" 
                            style="background:#3b82f6;color:white;border:none;padding:6px 16px;border-radius:8px;cursor:pointer;font-weight:600;">
                            ✓ Selectează Locul
                        </button>
                    </div>
                `, { maxWidth: 220 });
            } else {
                marker.bindPopup(`
                    <div style="text-align:center; min-width:160px;">
                        <b style="color:#3b82f6;">Loc: ${spotNum}</b><br>
                        <span style="font-size:11px; color:gray;">Parcare: ${parkCode || 'N/A'}</span><br>
                        <span style="font-size:12px;">${getPolygonTypeText(props.ocupat)}</span>
                    </div>
                `, { maxWidth: 220 });
            }
        } else {
            marker.bindPopup(`
                <div class="map-popup" style="min-width:180px; padding: 5px;">
                    <div class="popup-tag" style="background: ${isBooked ? '#f59e0b' : (isMine ? '#4ade80' : '#3b82f6')}; color: white; font-size: 0.65rem; margin-bottom: 8px;">
                        ${isBooked ? '🔒 REZERVAT' : (isMine ? '✓ Locul Meu' : 'ParkShare Verificat')}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: white;">Locul ${listedSpot.spotNumber}</h3>
                        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${listedSpot.address}</p>
                        <div class="spot-rating-container" style="margin-top: 4px; display: flex; align-items: center; gap: 4px; min-height: 18px;">
                            <span style="color: var(--text-muted); font-size: 0.8rem;">Se încarcă rating...</span>
                        </div>
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
                                onclick="openAvailabilityModal('${listedSpot.id}')">Setează Disponibilitate</button>` :
                            `<button class="btn btn-primary btn-block" style="padding: 10px; font-size: 0.9rem; font-weight: 700;" 
                                onclick="bookSpot('${listedSpot.id}')">Rezervă Acum</button>`
                         }`
                    }
                </div>
            `, { className: 'custom-popup', autoPan: true, autoPanPadding: [50, 50], offset: [0, -5] });
            
            // Fetch rating when popup opens
            marker.on('popupopen', async (e) => {
                const popupNode = e.popup._contentNode;
                if (!popupNode) return;
                const ratingContainer = popupNode.querySelector('.spot-rating-container');
                if (ratingContainer) {
                    const rating = await window.fbAPI.getSpotRating(listedSpot.id);
                    if (rating.count > 0) {
                        ratingContainer.innerHTML = `<i data-lucide="star" style="width: 14px; height: 14px; color: #facc15; fill: #facc15; vertical-align: middle;"></i> <span style="color: #facc15; font-weight: 700;">${rating.average}</span> <span style="color: var(--text-muted); font-size: 0.75rem;">(${rating.count} review-uri)</span>`;
                        lucide.createIcons({ root: ratingContainer });
                    } else {
                        ratingContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Fără review-uri încă</span>`;
                    }
                }
            });
        }
        
        marker.on('click', (e) => L.DomEvent.stopPropagation(e.originalEvent));
        marker.addTo(targetLayer);
    });
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
    document.getElementById('address').value = `Loc nominal ${spotNumber}, Sector 4, București`;

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
    
    // Enable "Continuă" button for Step 1
    const btnNext1 = document.getElementById('btnNext1');
    if (btnNext1) btnNext1.disabled = false;

    showToast(`Ai selectat locul ${spotNumber} (Parcare: ${parkingCode || 'N/A'})! ✓`);
};

// --- Wizard Logic ---
window.nextWizardStep = (step) => {
    try {
        console.log("Navigating to step", step);
        document.querySelectorAll('.wizard-step').forEach(el => el.style.setProperty('display', 'none', 'important'));
        const nextStepEl = document.getElementById('wizard-step-' + step);
        if (nextStepEl) {
            nextStepEl.style.setProperty('display', 'flex', 'important');
            nextStepEl.style.setProperty('flex', '1', 'important');
            nextStepEl.style.setProperty('flex-direction', 'column', 'important');
        } else {
            showToast("Eroare internă: Pasul " + step + " nu a fost găsit!", true);
            return;
        }
        
        document.querySelectorAll('.wizard-step-indicator').forEach(el => {
            el.classList.remove('active');
        });
        
        // Mark previous steps as completed
        for(let i = 1; i < step; i++) {
            const ind = document.getElementById('indicator-' + i);
            if (ind) {
                ind.classList.remove('active');
                ind.classList.add('completed');
                ind.innerHTML = `✓ ${ind.innerHTML.split('. ')[1] || ind.innerHTML}`;
            }
        }
        
        // Set current step as active
        const currentInd = document.getElementById('indicator-' + step);
        if (currentInd) {
            currentInd.classList.add('active');
            currentInd.classList.remove('completed');
            // If it was completed, restore its original text format
            if (step === 2) currentInd.innerHTML = '2. Documente';
            if (step === 3) currentInd.innerHTML = '3. Detalii';
        }
    } catch (e) {
        showToast("Eroare navigare: " + e.message, true);
    }
};

window.prevWizardStep = (step) => {
    document.querySelectorAll('.wizard-step').forEach(el => el.style.setProperty('display', 'none', 'important'));
    const prevStepEl = document.getElementById('wizard-step-' + step);
    if (prevStepEl) {
        prevStepEl.style.setProperty('display', 'flex', 'important');
        prevStepEl.style.setProperty('flex', '1', 'important');
        prevStepEl.style.setProperty('flex-direction', 'column', 'important');
    }
    
    document.querySelectorAll('.wizard-step-indicator').forEach(el => {
        el.classList.remove('active');
    });
    
    for(let i = step + 1; i <= 3; i++) {
        const ind = document.getElementById('indicator-' + i);
        if (ind) {
            ind.classList.remove('completed');
            ind.classList.remove('active');
            if (i === 2) ind.innerHTML = '2. Documente';
            if (i === 3) ind.innerHTML = '3. Detalii';
        }
    }
    
    const currentInd = document.getElementById('indicator-' + step);
    if (currentInd) {
        currentInd.classList.add('active');
        currentInd.classList.remove('completed');
        if (step === 1) currentInd.innerHTML = '1. Locație';
        if (step === 2) currentInd.innerHTML = '2. Documente';
    }

    if (step === 1) {
        setTimeout(() => mapList.invalidateSize(), 300);
    }
};

window.handlePdfSelect = (input, source) => {
    if (input.files[0]) {
        // Clear the other input so we only have one file
        if (source === 'photo') {
            document.getElementById('contractPdf').value = '';
        } else if (source === 'file') {
            const photoInput = document.getElementById('contractPhoto');
            if (photoInput) photoInput.value = '';
        }

        const el = document.getElementById('pdfFileName');
        el.textContent = '✓ Selectat: ' + input.files[0].name;
        el.style.display = 'block';
        document.getElementById('pdfDropzone').style.borderColor = '#22c55e';
        const btnNext2 = document.getElementById('btnNext2');
        if (btnNext2) btnNext2.disabled = false;
    }
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

    const spot = appState.spots.find(s => s.id == id);
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
    const spot = appState.spots.find(s => s.id == currentBookingSpotId);
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
    const spot = appState.spots.find(s => s.id == currentBookingSpotId);
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

    // Check if the selected time is already in the past
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const endTimeObj = new Date(year, month - 1, day, endH, endM, 0, 0);

    if (now >= endTimeObj) {
        showToast("Nu poți rezerva un interval care s-a încheiat deja (ora selectată a trecut)!", true);
        return;
    }

    // Save booking to Firebase
    try {
        const bookingData = {
            startTime: startVal,
            endTime: endVal,
            bookedBy: currentUser.username,
            durationHours: (endTotal - startTotal) / 60
        };
        
        await window.fbAPI.bookSpot(spot.id, bookingData);
        
        // Update local state for immediate UI reflection
        spot.status = 'booked';
        spot.bookedBy = currentUser.username;
        spot.bookedAt = Date.now();
        spot.availability = {
            ...spot.availability,
            start: startVal,
            end: endVal
        };

        document.getElementById('bookingModal').classList.remove('active');
        renderVisiblePolygons();
        renderMySpots();
        window.sendPushNotification("Rezervare Confirmată", `Ai rezervat cu succes locul ${spot.spotNumber} până la ora ${endVal}. ✓`);
        navigateTo('#my-spots');
    } catch (err) {
        showToast("Eroare la rezervare! Te rugăm să încerci din nou.", true);
    }
};

window.cancelBooking = async (spotId) => {
    if (!confirm("Ești sigur că vrei să anulezi această rezervare?")) return;
    
    const spot = appState.spots.find(s => s.id === spotId);
    if (!spot) return;

    try {
        // În viața reală am șterge sau marca `booking`-ul ca anulat. 
        // Aici doar resetăm statusul spotului în Firestore
        await window.fbAPI.updateSpot(spot.id, { 
            status: 'available',
            bookedBy: null,
            bookedAt: null
        });

        // Update local state
        spot.status = 'available';
        delete spot.bookedBy;
        delete spot.bookedAt;
        
        renderMySpots();
        renderVisiblePolygons();
        showToast("Rezervare anulată cu succes!");
    } catch (err) {
        showToast("Eroare la anulare!", true);
    }
};

// --- REVIEW & RATING LOGIC ---
window.openReviewModal = (spotId, spotNumber) => {
    document.getElementById('reviewSpotId').value = spotId;
    document.getElementById('reviewSpotName').textContent = spotNumber || 'N/A';
    document.getElementById('reviewComment').value = '';
    document.getElementById('reviewSelectedRating').value = '0';
    
    // Reset stars
    document.querySelectorAll('.rating-star').forEach(s => s.classList.remove('active'));
    
    document.getElementById('reviewModal').classList.add('active');
};

// Initialize star rating logic
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const value = parseInt(e.currentTarget.getAttribute('data-value'));
            document.getElementById('reviewSelectedRating').value = value;
            
            // Highlight stars up to selected value
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-value')) <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
});

window.submitReview = async () => {
    const spotId = document.getElementById('reviewSpotId').value;
    const rating = parseInt(document.getElementById('reviewSelectedRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (!rating || rating === 0) {
        showToast("Te rugăm să selectezi un număr de stele (1-5)!", true);
        return;
    }
    
    const btn = document.getElementById('btnSubmitReview');
    btn.disabled = true;
    btn.textContent = 'Se trimite...';
    
    try {
        const spot = appState.spots.find(s => s.id === spotId);
        if (!spot) throw new Error("Spot not found");
        
        // 1. Save Review to Firebase
        await window.fbAPI.addReview({
            spotId: spotId,
            reviewerId: currentUser.username,
            rating: rating,
            comment: comment
        });
        
        // 2. Complete parking session (Release spot)
        await window.fbAPI.updateSpot(spot.id, { 
            status: 'available',
            bookedBy: null,
            bookedAt: null
        });

        // Update local state
        spot.status = 'available';
        delete spot.bookedBy;
        delete spot.bookedAt;
        
        document.getElementById('reviewModal').classList.remove('active');
        showToast("Parcare finalizată și review trimis cu succes! Îți mulțumim!");
        
        renderMySpots();
        renderVisiblePolygons();
    } catch (err) {
        showToast("Eroare la trimiterea review-ului. Încearcă din nou.", true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Trimite Review ⭐';
    }
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
            const photoInput = document.getElementById('contractPhoto');
            const selectedFile = (pdfInput && pdfInput.files[0]) || (photoInput && photoInput.files[0]);
            
            if (!selectedFile) {
                showToast("Încarcă contractul (PDF sau Poză) înainte de a trimite!", true);
                return;
            }

            const priceVal = document.getElementById('price').value;
            if (!priceVal || parseFloat(priceVal) <= 0) {
                showToast("Introdu un preț valid!", true);
                return;
            }
            if (parseFloat(priceVal) > 5) {
                showToast("Suma maximă permisă este de 5 RON / oră!", true);
                return;
            }

            const price = parseFloat(priceVal);
            const type = document.getElementById('type').value;
            const description = document.getElementById('description')?.value || '';
            const address = document.getElementById('address').value || `Loc nominal ${spotNum}, Sector 4, București`;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader" class="spin"></i> Se trimite...';
            if (window.lucide) window.lucide.createIcons();

            // Read PDF as base64
            const pdfFile = selectedFile;
            showToast("Se procesează fișierul...");

            const pdfBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (ev) => resolve(ev.target.result);
                reader.onerror = () => reject(new Error('Eroare la citirea PDF-ului'));
                reader.readAsDataURL(pdfFile);
            });

            let lat = 44.397, lng = 26.103;
            if (appState.selectedCoord) {
                lat = appState.selectedCoord.lat;
                lng = appState.selectedCoord.lng;
            }

            const newSpot = {
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
                polygon: appState.selectedPolygon ? JSON.stringify(appState.selectedPolygon) : null,
                status: 'available', // PENTRU TESTARE: Verificare automată ca să apară direct pe hartă și la căutare
                description: description,
                contractPdf: "[FILE_UPLOADED_TO_CLOUD_STORAGE_MOCK]", // Avoid localStorage quota exceeded
                contractName: pdfFile.name
            };

            // Salvare în Firebase Firestore
            const fbSpotId = await window.fbAPI.addSpot(newSpot);
            
            // Adaugă ID-ul primit de la Firebase și îl pune în memorie
            newSpot.id = fbSpotId;
            appState.spots.push(newSpot);

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

            showToast("✅ Locul a fost trimis spre verificare!");
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
            
            // Redirect to home and reset form
            setTimeout(() => {
                navigateTo('#hero');
                window.prevWizardStep(1); // Reset wizard
                listForm.reset(); // Reset inputs
                if (pdfFileName) {
                    pdfFileName.textContent = '';
                    pdfFileName.style.display = 'none';
                }
            }, 2500);

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
            findClosestSpotTo(44.3970, 26.1030, targetMap, targetLayers);
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
        let res;
        let success = false;
        try {
            res = await fetch('./pois.json');
            if (res.ok) success = true;
        } catch(e) {
            console.warn("Relative fetch for pois.json failed, trying local server fallback...", e);
        }
        if (!success) {
            try {
                res = await fetch('http://localhost:8080/pois.json');
                if (res.ok) success = true;
            } catch(e) {
                console.error("Local server fallback for pois.json failed...", e);
            }
        }
        if (!success || !res) return;
        const data = await res.json();
        
        data.forEach(poi => {
            const lat = poi.lat;
            const lon = poi.lon;
            const type = poi.type;
            const name = poi.name;
            
            // Filtru pentru perimetrul Sectorului 4
            if (lat > 44.428 || lat < 44.330 || lon < 26.070 || lon > 26.160) return;
            // Tăiem colțul de NE (Sectorul 3 - IOR, Dristor, Vitan) deasupra Dâmboviței
            if (lon > 26.10) {
                const latMax = 44.425 - 0.625 * (lon - 26.10);
                if (lat > latMax) return;
            }
            
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
        if (s.status !== 'available' && s.status !== 'pending_verification') return false;
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
            <div class="spot-card-premium" onclick="flyAndOpenSpot('${spot.spotNumber}', ${spot.center[0]}, ${spot.center[1]})">
                <div class="card-glow"></div>
                <div class="card-content">
                    <div class="card-top">
                        <div class="price-tag">${spot.price} <small>RON/h</small></div>
                        <div class="dist-tag"><i data-lucide="navigation-2"></i> ${spot.dist ? spot.dist.toFixed(2) + ' km' : 'Sector 4'}</div>
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
    
    // Asigură-te că lista este deschisă când vin rezultate noi
    if(window.innerWidth <= 768 && availableSpots.length > 0) {
        listEl.classList.remove('collapsed');
    }
    
    if (window.lucide) window.lucide.createIcons();
}

window.flyAndOpenSpot = (spotNum, lat, lng) => {
    // Închidem lista pe mobil ca să vedem harta
    if(window.innerWidth <= 768) {
        const listEl = document.getElementById('searchResultsList');
        if (listEl) listEl.classList.add('collapsed');
    }
    
    // Auto-minimize the top search panel to free up map space
    const sidebar = document.getElementById('findSidebar');
    if (sidebar) {
        sidebar.classList.add('minimized');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    mapFind.flyTo([lat, lng], 21);

    // Funcție robustă care caută repetat markerul până îl găsește (maxim 2 secunde)
    const tryOpenPopup = (attempts) => {
        if (attempts <= 0) return;
        let found = false;
        if (polygonLayerFind) {
            polygonLayerFind.eachLayer(layer => {
                if (layer.spotNumber && String(layer.spotNumber) === String(spotNum)) {
                    layer.openPopup();
                    found = true;
                }
            });
        }
        if (!found) {
            setTimeout(() => tryOpenPopup(attempts - 1), 200);
        }
    };

    // Începem să căutăm după 600ms (pentru a lăsa flyTo să înceapă)
    setTimeout(() => tryOpenPopup(10), 600);
};

function findAndShowNearest() {
    // Filter out own spots for the "Find Nearest" logic too
    const availableSpots = appState.spots.filter(s => {
        const isMine = currentUser && s.owner === currentUser.username;
        return (s.status === 'available' || s.status === 'pending_verification') && !isMine;
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

        // Auto-minimize the top search panel to free up map space
        const sidebar = document.getElementById('findSidebar');
        if (sidebar) {
            sidebar.classList.add('minimized');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        const tryOpenPopup = (attempts) => {
            if (attempts <= 0) return;
            let found = false;
            if (polygonLayerFind) {
                polygonLayerFind.eachLayer(layer => {
                    if (layer.spotNumber && String(layer.spotNumber) === String(nearest.spotNumber)) {
                        layer.openPopup();
                        found = true;
                    }
                });
            }
            if (!found) {
                setTimeout(() => tryOpenPopup(attempts - 1), 200);
            }
        };

        setTimeout(() => {
            tryOpenPopup(10);
            showToast(`Găsit! Cel mai apropiat loc (${nearest.spotNumber}) este la ${(nearest.dist * 1000).toFixed(0)}m.`);
        }, 600);
    }
}

window.goToTestSpot = (e) => {
    if (e) e.preventDefault();
    
    // Ensure we navigate to the search section
    navigateTo('#find-spot');
    
    // Find the first mock rentable spot in Sector 4
    const testSpot = appState.spots.find(s => s.status === 'available' && s.isMock);
    
    if (!testSpot) {
        showToast("Nu am găsit niciun loc de test disponibil.", true);
        return;
    }
    
    // Center and zoom in to mapFind
    mapFind.setView(testSpot.center, 21);
    
    setTimeout(() => {
        renderVisiblePolygons(); // Force render S4 polygons
        
        // Open the popup directly on mapFind for this spot coordinate
        L.popup({ className: 'custom-popup' })
            .setLatLng(testSpot.center)
            .setContent(`
                <div class="map-popup" style="min-width:180px; padding: 5px;">
                    <div class="popup-tag" style="background: #3b82f6; color: white; font-size: 0.65rem; margin-bottom: 8px;">
                        ParkShare Verificat (Loc de Test)
                    </div>
                    <div style="margin-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: white;">Locul ${testSpot.spotNumber}</h3>
                        <p style="margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-muted);">${testSpot.address}</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                            <span style="color: var(--text-muted);">Tarif:</span> <b style="color: white;">${testSpot.price} RON/h</b>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-block" style="padding: 10px; font-size: 0.9rem; font-weight: 700;" 
                        onclick="bookSpot(\'${testSpot.id}\')">Rezervă Acum</button>
                </div>
            `)
            .openOn(mapFind);
            
        showToast(`Harta s-a mutat pe locul de test ${testSpot.spotNumber} din Sectorul 4.`);
    }, 1000);
};

// --- PWA Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.warn('ServiceWorker registration failed: ', err);
            });
    });
}

// --- PWA Install Prompt ---
let deferredPrompt;
const pwaBanner = document.getElementById('pwaInstallBanner');
const pwaInstallBtn = document.getElementById('pwaInstallBtn');
const pwaCancelBtn = document.getElementById('pwaCancelBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    if (pwaBanner) {
        pwaBanner.style.display = 'flex';
        // Add a slight delay for better UX on initial load
        pwaBanner.style.animation = 'slideUpPwa 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 1s';
    }
});

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (pwaBanner) pwaBanner.style.display = 'none';
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        }
    });
}

if (pwaCancelBtn) {
    pwaCancelBtn.addEventListener('click', () => {
        if (pwaBanner) pwaBanner.style.display = 'none';
    });
}

// --- Chat Logic ---
let currentChatUser = null;
let chatPollInterval = null;

function getChatThreadId(user1, user2) {
    return [user1, user2].sort().join('_');
}

async function loadMessages(ownerUsername, autoScroll = false) {
    if (!currentUser) return;
    const threadId = getChatThreadId(currentUser.username, ownerUsername);
    const msgsContainer = document.getElementById('chatMessages');
    
    try {
        const res = await fetch("https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/chat_" + threadId + "?t=" + Date.now());
        let messages = [];
        if (res.ok) {
            messages = await res.json() || [];
        }
        
        let html = '';
        messages.forEach(m => {
            const isMe = m.sender === currentUser.username;
            const align = isMe ? 'flex-end' : 'flex-start';
            const bg = isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)';
            const border = isMe ? 'none' : '1px solid var(--glass-border)';
            const radius = isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px';
            const textAlign = isMe ? 'right' : 'left';
            
            html += `
                <div style="align-self: ${align}; background: ${bg}; border: ${border}; color: white; padding: 0.75rem 1rem; border-radius: ${radius}; max-width: 80%;">
                    <p style="margin: 0; font-size: 0.9rem;">${m.text}</p>
                    <span style="font-size: 0.65rem; color: ${isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'}; display: block; text-align: ${textAlign}; margin-top: 4px;">${m.time}</span>
                </div>
            `;
        });
        if (!window.lastMessageCount) window.lastMessageCount = {};
        const prevCount = window.lastMessageCount[threadId] || 0;
        window.lastMessageCount[threadId] = messages.length;
        
        // Prevent clearing innerHTML if not changed, to avoid flicker
        if (msgsContainer && msgsContainer.innerHTML.length !== html.length) {
            const isAtBottom = msgsContainer.scrollHeight - msgsContainer.scrollTop <= msgsContainer.clientHeight + 50;
            msgsContainer.innerHTML = html;
            if (autoScroll || isAtBottom) {
                msgsContainer.scrollTop = msgsContainer.scrollHeight;
            }
        }
        
        // Push notification logic for new incoming messages
        if (messages.length > prevCount && prevCount > 0) { 
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender !== currentUser.username) {
                window.sendPushNotification("Mesaj nou de la " + lastMsg.sender, lastMsg.text, "message");
            }
        }
        
        return messages;
    } catch (e) {
        console.error("Eroare la incarcare mesaje", e);
    }
}

// Global Background Message Polling
setInterval(async () => {
    if (!currentUser) return;
    try {
        // Fetch all keys to find active threads for current user
        const res = await fetch("https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/?prefix=chat_");
        if (!res.ok) return;
        const keys = await res.json();
        
        for (const key of keys) {
            // key format: chat_user1_user2
            if (key.includes(currentUser.username)) {
                // Determine the other user's username
                const parts = key.replace('chat_', '').split('_');
                const otherUser = parts[0] === currentUser.username ? parts[1] : parts[0];
                
                // If the chat is open, the local interval handles it, but we can safely call loadMessages in background
                if (currentChatUser !== otherUser) {
                    await loadMessages(otherUser, false);
                }
            }
        }
    } catch(e) {
        // Silent fail for background polling
    }
}, 5000);

window.openChat = (ownerUsername) => {
    currentChatUser = ownerUsername;
    document.getElementById('chatOwnerName').textContent = ownerUsername;
    document.getElementById('chatModal').classList.add('active');
    
    const msgsContainer = document.getElementById('chatMessages');
    msgsContainer.innerHTML = '<div style="color: white; text-align: center; margin-top: 2rem; font-size: 0.9rem;">Se încarcă mesajele...</div>';
    
    loadMessages(ownerUsername, true);
    
    // Polling every 1.5 seconds for live chat effect
    if (chatPollInterval) clearInterval(chatPollInterval);
    chatPollInterval = setInterval(() => {
        if (currentChatUser) {
            loadMessages(currentChatUser, false);
        }
    }, 1500);
};

window.closeChat = () => {
    currentChatUser = null;
    if (chatPollInterval) clearInterval(chatPollInterval);
    document.getElementById('chatModal').classList.remove('active');
};

window.sendChatMessage = async () => {
    if (!currentChatUser || !currentUser) return;
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    input.value = ''; // clear immediately
    
    const time = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    const msgObj = { sender: currentUser.username, text, time };
    const threadId = getChatThreadId(currentUser.username, currentChatUser);
    
    try {
        const res = await fetch("https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/chat_" + threadId + "?t=" + Date.now());
        let messages = [];
        if (res.ok) messages = await res.json() || [];
        messages.push(msgObj);
        
        await fetch("https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/chat_" + threadId, {
            method: 'POST',
            body: JSON.stringify(messages)
        });
        
        loadMessages(currentChatUser, true);
    } catch (e) {
        console.error(e);
    }
};

// ============ IN-APP CALL SYSTEM ============
let callState = {
    active: false,
    connected: false,
    muted: false,
    speaker: false,
    callee: null,
    caller: null,
    timerInterval: null,
    timerSeconds: 0,
    pollInterval: null,
    ringTimeout: null,
    isIncoming: false
};

const CALL_URL_BASE = "https://kvdb.io/77TAwJmXQUH7pgjBJgGx1x/call_";

window.startInternalCall = async (username) => {
    if (!currentUser) {
        showToast("Trebuie să fii autentificat!", true);
        return;
    }
    if (callState.active) {
        showToast("Ești deja într-un apel!", true);
        return;
    }

    callState.active = true;
    callState.connected = false;
    callState.callee = username;
    callState.muted = false;
    callState.speaker = false;
    callState.isIncoming = false;

    // Update UI
    const screen = document.getElementById('callScreen');
    screen.classList.add('active');
    screen.classList.remove('connected');
    document.getElementById('callUsername').textContent = `@${username}`;
    document.getElementById('callStatusSub').textContent = 'Se sună...';
    document.getElementById('callTimer').style.display = 'none';
    document.getElementById('callSecondaryActions').style.display = 'none';
    
    const ring = document.querySelector('.call-avatar-ring');
    ring.classList.add('call-ringing');
    ring.classList.remove('call-connected');
    
    if (window.lucide) window.lucide.createIcons();

    // Signal the callee via kvdb
    try {
        await fetch(CALL_URL_BASE + username, {
            method: 'POST',
            body: JSON.stringify({ 
                caller: currentUser.username, 
                status: 'ringing', 
                timestamp: Date.now() 
            })
        });
    } catch(e) { console.error("Call signal failed", e); }

    // Poll for answer
    callState.pollInterval = setInterval(async () => {
        try {
            const res = await fetch(CALL_URL_BASE + username + "?t=" + Date.now(), { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'accepted' && !callState.connected) {
                    connectCall();
                } else if (data.status === 'declined' || data.status === 'ended') {
                    endCall();
                    showToast(`@${username} a refuzat apelul.`, true);
                }
            }
        } catch(e) {}
    }, 2000);

    // Auto-end after 30s if no answer
    callState.ringTimeout = setTimeout(() => {
        if (callState.active && !callState.connected) {
            document.getElementById('callStatusSub').textContent = 'Nu răspunde...';
            setTimeout(() => endCall(), 2000);
        }
    }, 30000);
};

function connectCall() {
    callState.connected = true;
    callState.timerSeconds = 0;

    const screen = document.getElementById('callScreen');
    screen.classList.add('connected');
    document.getElementById('callStatusSub').textContent = 'Conectat';
    document.getElementById('callTimer').style.display = 'block';
    document.getElementById('callTimer').textContent = '00:00';
    document.getElementById('callSecondaryActions').style.display = 'flex';

    const ring = document.querySelector('.call-avatar-ring');
    ring.classList.remove('call-ringing');
    ring.classList.add('call-connected');

    if (window.lucide) window.lucide.createIcons();

    // Start timer
    callState.timerInterval = setInterval(() => {
        callState.timerSeconds++;
        const mins = String(Math.floor(callState.timerSeconds / 60)).padStart(2, '0');
        const secs = String(callState.timerSeconds % 60).padStart(2, '0');
        document.getElementById('callTimer').textContent = `${mins}:${secs}`;
    }, 1000);

    // Stop ringing poll, start connection poll
    if (callState.pollInterval) clearInterval(callState.pollInterval);
    if (callState.ringTimeout) clearTimeout(callState.ringTimeout);
    
    // Poll for call end from other side
    callState.pollInterval = setInterval(async () => {
        try {
            const target = callState.isIncoming ? currentUser.username : callState.callee;
            const res = await fetch(CALL_URL_BASE + target + "?t=" + Date.now(), { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'ended') {
                    endCall();
                    showToast("Apelul s-a încheiat.", false);
                }
            }
        } catch(e) {}
    }, 3000);
}

window.endCall = async () => {
    const screen = document.getElementById('callScreen');
    screen.classList.remove('active', 'connected');
    
    // Signal end
    if (callState.callee || callState.caller) {
        const target = callState.isIncoming ? currentUser.username : callState.callee;
        try {
            await fetch(CALL_URL_BASE + target, {
                method: 'POST',
                body: JSON.stringify({ caller: currentUser?.username, status: 'ended', timestamp: Date.now() })
            });
        } catch(e) {}
    }

    if (callState.timerInterval) clearInterval(callState.timerInterval);
    if (callState.pollInterval) clearInterval(callState.pollInterval);
    if (callState.ringTimeout) clearTimeout(callState.ringTimeout);
    
    if (callState.connected) {
        const mins = String(Math.floor(callState.timerSeconds / 60)).padStart(2, '0');
        const secs = String(callState.timerSeconds % 60).padStart(2, '0');
        showToast(`Apel încheiat • ${mins}:${secs}`, false);
    }
    
    callState = { active: false, connected: false, muted: false, speaker: false, callee: null, caller: null, timerInterval: null, timerSeconds: 0, pollInterval: null, ringTimeout: null, isIncoming: false };
};

window.toggleMute = () => {
    callState.muted = !callState.muted;
    const btn = document.getElementById('btnMute');
    btn.classList.toggle('active-toggle', callState.muted);
    btn.querySelector('span').textContent = callState.muted ? 'Activează' : 'Mut';
    showToast(callState.muted ? '🔇 Microfon dezactivat' : '🔊 Microfon activat', false);
};

window.toggleSpeaker = () => {
    callState.speaker = !callState.speaker;
    const btn = document.getElementById('btnSpeaker');
    btn.classList.toggle('active-toggle', callState.speaker);
    btn.querySelector('span').textContent = callState.speaker ? 'Intern' : 'Speaker';
    showToast(callState.speaker ? '🔈 Speaker activat' : '🔇 Speaker dezactivat', false);
};

window.toggleKeypad = () => {
    showToast('Tastatura nu este disponibilă pentru apeluri interne.', false);
};

// --- Incoming Call Polling ---
function startIncomingCallPoll() {
    if (!currentUser) return;
    setInterval(async () => {
        if (callState.active) return; // don't check if already in a call
        try {
            const res = await fetch(CALL_URL_BASE + currentUser.username + "?t=" + Date.now(), { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'ringing' && data.caller !== currentUser.username && (Date.now() - data.timestamp < 35000)) {
                    showIncomingCall(data.caller);
                }
            }
        } catch(e) {}
    }, 3000);
}

let incomingCaller = null;
function showIncomingCall(callerUsername) {
    if (document.getElementById('incomingCallBanner').classList.contains('active')) return;
    incomingCaller = callerUsername;
    document.getElementById('incomingCallerName').textContent = `@${callerUsername}`;
    document.getElementById('incomingCallBanner').classList.add('active');
    if (window.lucide) window.lucide.createIcons();
    
    // Auto-dismiss after 30s
    setTimeout(() => {
        if (document.getElementById('incomingCallBanner').classList.contains('active')) {
            declineIncomingCall();
        }
    }, 30000);
}

window.acceptIncomingCall = async () => {
    document.getElementById('incomingCallBanner').classList.remove('active');
    
    // Signal acceptance
    try {
        await fetch(CALL_URL_BASE + currentUser.username, {
            method: 'POST',
            body: JSON.stringify({ caller: incomingCaller, status: 'accepted', timestamp: Date.now() })
        });
    } catch(e) {}

    // Open call screen as receiver
    callState.active = true;
    callState.connected = false;
    callState.callee = null;
    callState.caller = incomingCaller;
    callState.isIncoming = true;

    const screen = document.getElementById('callScreen');
    screen.classList.add('active');
    screen.classList.remove('connected');
    document.getElementById('callUsername').textContent = `@${incomingCaller}`;
    document.getElementById('callStatusSub').textContent = 'Se conectează...';
    document.getElementById('callTimer').style.display = 'none';
    document.getElementById('callSecondaryActions').style.display = 'none';
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => connectCall(), 1000);
};

window.declineIncomingCall = async () => {
    document.getElementById('incomingCallBanner').classList.remove('active');
    try {
        await fetch(CALL_URL_BASE + currentUser.username, {
            method: 'POST',
            body: JSON.stringify({ caller: incomingCaller, status: 'declined', timestamp: Date.now() })
        });
    } catch(e) {}
    incomingCaller = null;
};

// Start polling for incoming calls after page load
setTimeout(() => startIncomingCallPoll(), 5000);


// --- Wallet Logic (Circuit Financiar Închis) ---
window.payTaxesS4 = () => {
    const btn = document.getElementById('btnPayTaxes');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Se procesează...';
    btn.disabled = true;
    
    setTimeout(() => {
        if (currentUser) {
            currentUser.walletBalance = 0;
            localStorage.setItem('parkshare_user', JSON.stringify(currentUser));
            document.getElementById('walletBalanceDisplay').textContent = '0 RON';
            // Also update the pill if it's rendered
            renderAuthUI();
        }
        
        btn.innerHTML = '<i data-lucide="check-circle"></i> Transfer Efectuat';
        btn.style.background = '#10b981';
        btn.style.borderColor = '#10b981';
        
        showToast("Transfer efectuat către DGITL Sector 4. Fondurile au fost virate în contul de taxe locale.", false);
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
            btn.style.borderColor = '';
            document.getElementById('walletModal').classList.remove('active');
        }, 3000);
    }, 1500);
};

// --- Incident Management Logic ---
window.handleIncidentPhoto = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('incidentPhotoImg').src = e.target.result;
            document.getElementById('incidentDropzoneContent').style.display = 'none';
            document.getElementById('incidentPhotoPreview').style.display = 'block';
            document.getElementById('incidentDropzone').style.borderColor = '#10b981';
            document.getElementById('incidentDropzone').style.borderStyle = 'solid';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.openIncidentModal = (spotId) => {
    document.getElementById('incidentSpotId').value = spotId;
    // Reset the dropzone
    document.getElementById('incidentDropzoneContent').style.display = '';
    document.getElementById('incidentPhotoPreview').style.display = 'none';
    document.getElementById('incidentDropzone').style.borderColor = 'rgba(255,255,255,0.2)';
    document.getElementById('incidentDropzone').style.borderStyle = 'dashed';
    document.getElementById('incidentPhoto').value = '';
    document.getElementById('incidentModal').classList.add('active');
};

window.submitIncidentReport = async () => {
    const spotId = parseInt(document.getElementById('incidentSpotId').value);
    const spot = appState.spots.find(s => s.id === spotId);
    
    const btn = document.getElementById('btnSubmitIncident');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Se trimite alerta...';
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Simulate network delay for realistic UX
    await new Promise(r => setTimeout(r, 1500));
    
    if (spot) {
        spot.status = 'available';
        spot.bookedBy = null;
        await saveState();
    }
    
    // Add refund to wallet
    if (currentUser) {
        currentUser.walletBalance = (currentUser.walletBalance || 0) + 5;
        localStorage.setItem('parkshare_user', JSON.stringify(currentUser));
    }
    
    // Close modal
    document.getElementById('incidentModal').classList.remove('active');
    
    // Reset button
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    // Update UI safely
    try { renderAuthUI(); } catch(e) { console.error("renderAuthUI error", e); }
    try { renderSpotsList(); } catch(e) { console.error("renderSpotsList error", e); }
    try { if (window.location.hash === '#my-spots') renderMySpots(); } catch(e) { console.error("renderMySpots error", e); }
    try { if (typeof lucide !== 'undefined') lucide.createIcons(); } catch(e) {}
    
    showToast("Alertă trimisă oficial către Poliția Locală S4. Contravaloarea de 5 RON a fost rambursată integral în portofel.", false);
};

// --- Mobile UX Polish (Punctul 3) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestionarea Tastaturii Virtuale (Scroll into view on focus)
    if (window.innerWidth <= 1024) {
        document.addEventListener('focusin', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    }

    // 2. Gesturi prin Swipe pentru navigare rapida
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    const navSections = ['#hero', '#find-spot', '#list', '#my-spots'];

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        // Ignoram swipe-ul daca suntem pe harta, in modale, formulare, sau in lista de swipe orizontal
        if (e.target.closest('.leaflet-container') || e.target.closest('.modal-card') || e.target.closest('form') || e.target.closest('.list-card')) {
            return;
        }

        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeNavigation();
    }, {passive: true});

    function handleSwipeNavigation() {
        const xDiff = touchStartX - touchEndX;
        const yDiff = touchStartY - touchEndY;
        
        // Verifica daca a fost o glisare orizontala dominanta
        if (Math.abs(xDiff) > 80 && Math.abs(yDiff) < 60) {
            let currentHash = window.location.hash;
            // Daca hash-ul lipseste sau nu este in lista (ex. cand pagina abia se incarca)
            if (!currentHash || !navSections.includes(currentHash)) {
                // Incearca sa gasesti sectiunea activa
                const activeSec = document.querySelector('main > section.active');
                currentHash = activeSec ? '#' + activeSec.id : '#hero';
            }

            const currentIndex = navSections.indexOf(currentHash);
            if (currentIndex === -1) return;

            if (xDiff > 0 && currentIndex < navSections.length - 1) {
                // Swipe Left -> Next Section
                navigateTo(navSections[currentIndex + 1]);
            } else if (xDiff < 0 && currentIndex > 0) {
                // Swipe Right -> Prev Section
                navigateTo(navSections[currentIndex - 1]);
            }
        }
    }
});

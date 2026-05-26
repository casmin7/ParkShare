$lines = Get-Content -Path 'app.js' -Encoding UTF8
$anchor = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'pwaCancelBtn.addEventListener') {
        $anchor = $i
        break
    }
}

if ($anchor -ne -1) {
    $close_idx = $anchor + 3
    $newLines = $lines[0..$close_idx]
    
    $extraLines = @"

// --- Chat Logic ---
window.openChat = (ownerUsername) => {
    document.getElementById('chatOwnerName').textContent = ownerUsername;
    document.getElementById('chatModal').classList.add('active');
    
    // Auto-scroll to bottom of messages
    const msgs = document.getElementById('chatMessages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
};

window.closeChat = () => {
    document.getElementById('chatModal').classList.remove('active');
};

window.sendChatMessage = () => {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    const msgsContainer = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    msgsContainer.innerHTML += \`
        <div style="align-self: flex-end; background: var(--primary); color: white; padding: 0.75rem 1rem; border-radius: 16px; border-bottom-right-radius: 4px; max-width: 80%;">
            <p style="margin: 0; font-size: 0.9rem;">\${msg}</p>
            <span style="font-size: 0.65rem; color: rgba(255,255,255,0.7); display: block; text-align: right; margin-top: 4px;">\${time}</span>
        </div>
    \`;
    
    input.value = '';
    msgsContainer.scrollTop = msgsContainer.scrollHeight;
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
"@

    $newLines += $extraLines -split "`n"
    $newLines | Set-Content -Path 'app.js' -Encoding UTF8
    Write-Output "Fixed app.js successfully."
} else {
    Write-Output "Anchor not found!"
}

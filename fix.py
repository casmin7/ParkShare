import sys

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

anchor = -1
for i, line in enumerate(lines):
    if 'pwaCancelBtn.addEventListener' in line:
        anchor = i
        break

if anchor != -1:
    close_idx = anchor + 3
    lines = lines[:close_idx + 1]

    lines.append('\n// --- Chat Logic ---\n')
    lines.append('window.openChat = (ownerUsername) => {\n')
    lines.append('    document.getElementById(\'chatOwnerName\').textContent = ownerUsername;\n')
    lines.append('    document.getElementById(\'chatModal\').classList.add(\'active\');\n')
    lines.append('    \n')
    lines.append('    // Auto-scroll to bottom of messages\n')
    lines.append('    const msgs = document.getElementById(\'chatMessages\');\n')
    lines.append('    if (msgs) msgs.scrollTop = msgs.scrollHeight;\n')
    lines.append('};\n\n')

    lines.append('window.closeChat = () => {\n')
    lines.append('    document.getElementById(\'chatModal\').classList.remove(\'active\');\n')
    lines.append('};\n\n')

    lines.append('window.sendChatMessage = () => {\n')
    lines.append('    const input = document.getElementById(\'chatInput\');\n')
    lines.append('    const msg = input.value.trim();\n')
    lines.append('    if (!msg) return;\n')
    lines.append('    \n')
    lines.append('    const msgsContainer = document.getElementById(\'chatMessages\');\n')
    lines.append('    const time = new Date().toLocaleTimeString(\'ro-RO\', { hour: \'2-digit\', minute: \'2-digit\' });\n')
    lines.append('    \n')
    lines.append('    // Add user message\n')
    lines.append('    msgsContainer.innerHTML += `\n')
    lines.append('        <div style="align-self: flex-end; background: var(--primary); color: white; padding: 0.75rem 1rem; border-radius: 16px; border-bottom-right-radius: 4px; max-width: 80%;">\n')
    lines.append('            <p style="margin: 0; font-size: 0.9rem;">${msg}</p>\n')
    lines.append('            <span style="font-size: 0.65rem; color: rgba(255,255,255,0.7); display: block; text-align: right; margin-top: 4px;">${time}</span>\n')
    lines.append('        </div>\n')
    lines.append('    `;\n')
    lines.append('    \n')
    lines.append('    input.value = \'\';\n')
    lines.append('    msgsContainer.scrollTop = msgsContainer.scrollHeight;\n')
    lines.append('};\n\n')

    lines.append('// --- Mobile UX Polish (Punctul 3) ---\n')
    lines.append('document.addEventListener(\'DOMContentLoaded\', () => {\n')
    lines.append('    // 1. Gestionarea Tastaturii Virtuale (Scroll into view on focus)\n')
    lines.append('    if (window.innerWidth <= 1024) {\n')
    lines.append('        document.addEventListener(\'focusin\', (e) => {\n')
    lines.append('            if (e.target.tagName === \'INPUT\' || e.target.tagName === \'TEXTAREA\' || e.target.tagName === \'SELECT\') {\n')
    lines.append('                setTimeout(() => {\n')
    lines.append('                    e.target.scrollIntoView({ behavior: \'smooth\', block: \'center\' });\n')
    lines.append('                }, 300);\n')
    lines.append('            }\n')
    lines.append('        });\n')
    lines.append('    }\n\n')

    lines.append('    // 2. Gesturi prin Swipe pentru navigare rapida\n')
    lines.append('    let touchStartX = 0;\n')
    lines.append('    let touchEndX = 0;\n')
    lines.append('    let touchStartY = 0;\n')
    lines.append('    let touchEndY = 0;\n\n')

    lines.append('    const navSections = [\'#hero\', \'#find-spot\', \'#list\', \'#my-spots\'];\n\n')

    lines.append('    document.addEventListener(\'touchstart\', e => {\n')
    lines.append('        touchStartX = e.changedTouches[0].screenX;\n')
    lines.append('        touchStartY = e.changedTouches[0].screenY;\n')
    lines.append('    }, {passive: true});\n\n')

    lines.append('    document.addEventListener(\'touchend\', e => {\n')
    lines.append('        // Ignoram swipe-ul daca suntem pe harta, in modale, formulare, sau in lista de swipe orizontal\n')
    lines.append('        if (e.target.closest(\'.leaflet-container\') || e.target.closest(\'.modal-card\') || e.target.closest(\'form\') || e.target.closest(\'.list-card\')) {\n')
    lines.append('            return;\n')
    lines.append('        }\n\n')

    lines.append('        touchEndX = e.changedTouches[0].screenX;\n')
    lines.append('        touchEndY = e.changedTouches[0].screenY;\n')
    lines.append('        handleSwipeNavigation();\n')
    lines.append('    }, {passive: true});\n\n')

    lines.append('    function handleSwipeNavigation() {\n')
    lines.append('        const xDiff = touchStartX - touchEndX;\n')
    lines.append('        const yDiff = touchStartY - touchEndY;\n')
    lines.append('        \n')
    lines.append('        // Verifica daca a fost o glisare orizontala dominanta\n')
    lines.append('        if (Math.abs(xDiff) > 80 && Math.abs(yDiff) < 60) {\n')
    lines.append('            let currentHash = window.location.hash;\n')
    lines.append('            // Daca hash-ul lipseste sau nu este in lista (ex. cand pagina abia se incarca)\n')
    lines.append('            if (!currentHash || !navSections.includes(currentHash)) {\n')
    lines.append('                // Incearca sa gasesti sectiunea activa\n')
    lines.append('                const activeSec = document.querySelector(\'main > section.active\');\n')
    lines.append('                currentHash = activeSec ? \'#\' + activeSec.id : \'#hero\';\n')
    lines.append('            }\n\n')

    lines.append('            const currentIndex = navSections.indexOf(currentHash);\n')
    lines.append('            if (currentIndex === -1) return;\n\n')

    lines.append('            if (xDiff > 0 && currentIndex < navSections.length - 1) {\n')
    lines.append('                // Swipe Left -> Next Section\n')
    lines.append('                navigateTo(navSections[currentIndex + 1]);\n')
    lines.append('            } else if (xDiff < 0 && currentIndex > 0) {\n')
    lines.append('                // Swipe Right -> Prev Section\n')
    lines.append('                navigateTo(navSections[currentIndex - 1]);\n')
    lines.append('            }\n')
    lines.append('        }\n')
    lines.append('    }\n')
    lines.append('});\n')

    with open('app.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('Fixed app.js successfully.')
else:
    print('Anchor not found!')

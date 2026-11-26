// Quiet Cmd+K / Ctrl+K command palette.
(() => {
    let overlay, dialog, input, listEl, activeIndex = 0, filtered = [], lastFocus = null;

    function getSections() {
        return [...document.querySelectorAll('body > .container > section')]
            .map(section => {
                const heading = section.querySelector('h2');
                if (!heading) return null;
                const label = heading.textContent.trim().replace(/\s+/g, ' ');
                return {
                    group: '',
                    label,
                    keywords: label.toLowerCase(),
                    run: () => section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                };
            })
            .filter(Boolean);
    }

    function getCommands() {
        const isDark = document.body.classList.contains('dark-mode');
        return [
            ...getSections(),
            {
                group: 'Actions',
                label: 'Copy email address',
                hint: 'keivalyapandya@gmail.com',
                keywords: 'email mail contact copy',
                run: () => {
                    const email = 'keivalyapandya@gmail.com';
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(email).then(() => {
                            if (window.showSiteToast) window.showSiteToast('Copied keivalyapandya@gmail.com');
                        }).catch(() => { window.location.href = 'mailto:' + email; });
                    } else {
                        window.location.href = 'mailto:' + email;
                    }
                }
            },
            {
                group: 'Actions',
                label: 'Open CV / Resume',
                hint: 'PDF',
                keywords: 'cv resume pdf',
                run: () => window.open('resume.pdf', '_blank', 'noopener')
            },
            {
                group: 'Actions',
                label: 'GitHub',
                hint: '@keivalya',
                keywords: 'github code repos',
                run: () => window.open('https://github.com/keivalya', '_blank', 'noopener')
            },
            {
                group: 'Actions',
                label: 'Google Scholar',
                hint: 'Papers',
                keywords: 'scholar papers citations publications',
                run: () => window.open('https://scholar.google.com/citations?user=Swvp-1MAAAAJ', '_blank', 'noopener')
            },
            {
                group: 'Actions',
                label: 'LinkedIn',
                hint: 'Profile',
                keywords: 'linkedin work',
                run: () => window.open('https://linkedin.com/in/keivalya', '_blank', 'noopener')
            },
            {
                group: 'Actions',
                label: 'X (Twitter)',
                hint: '@keivalyap',
                keywords: 'x twitter social',
                run: () => window.open('https://x.com/keivalyap', '_blank', 'noopener')
            },
            {
                group: 'Preferences',
                label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
                hint: 'Theme',
                keywords: 'theme dark light mode appearance',
                run: () => { if (typeof toggleTheme === 'function') toggleTheme(); }
            },
            {
                group: 'Preferences',
                label: 'Switch portrait photo',
                hint: 'Hero',
                keywords: 'photo portrait picture avatar randomize',
                run: () => { if (typeof window.cycleHeroPhoto === 'function') window.cycleHeroPhoto(); }
            }
        ];
    }

    function ensureDOM() {
        if (overlay) return;
        overlay = document.createElement('div');
        overlay.className = 'cmd-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="cmd-dialog" role="dialog" aria-modal="true" aria-label="Command palette">
                <div class="cmd-head">
                    <input type="text" class="cmd-input" placeholder="Type a command or search..." autocomplete="off" spellcheck="false" aria-label="Search commands">
                    <kbd class="cmd-kbd">ESC</kbd>
                </div>
                <div class="cmd-list" role="listbox"></div>
            </div>
        `;
        dialog = overlay.querySelector('.cmd-dialog');
        input = overlay.querySelector('.cmd-input');
        listEl = overlay.querySelector('.cmd-list');

        overlay.addEventListener('click', e => {
            if (e.target === overlay) close();
        });

        input.addEventListener('input', () => {
            activeIndex = 0;
            render();
        });

        input.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filtered.length) {
                    activeIndex = (activeIndex + 1) % filtered.length;
                    updateActive();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filtered.length) {
                    activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
                    updateActive();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[activeIndex]) execute(filtered[activeIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                close();
            }
        });

        document.body.appendChild(overlay);
    }

    function render() {
        const q = input.value.trim().toLowerCase();
        const all = getCommands();
        filtered = q
            ? all.filter(c => (c.label + ' ' + (c.hint || '') + ' ' + c.keywords).toLowerCase().includes(q))
            : all;

        if (!filtered.length) {
            listEl.innerHTML = '<div class="cmd-empty">No matching commands.</div>';
            return;
        }

        let html = '';
        let lastGroup = '';
        filtered.forEach((cmd, idx) => {
            if (cmd.group && cmd.group !== lastGroup) {
                lastGroup = cmd.group;
                html += `<div class="cmd-group">${cmd.group}</div>`;
            }
            const active = idx === activeIndex ? ' is-active' : '';
            const hint = cmd.hint ? `<span class="cmd-hint">${cmd.hint}</span>` : '';
            html += `<button type="button" class="cmd-item${active}" role="option" data-idx="${idx}"><span>${cmd.label}</span>${hint}</button>`;
        });
        listEl.innerHTML = html;

        listEl.querySelectorAll('.cmd-item').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                activeIndex = Number(btn.dataset.idx);
                updateActive();
            });
            btn.addEventListener('click', () => {
                const item = filtered[Number(btn.dataset.idx)];
                if (item) execute(item);
            });
        });
    }

    function updateActive() {
        listEl.querySelectorAll('.cmd-item').forEach(btn => {
            const isMatch = Number(btn.dataset.idx) === activeIndex;
            btn.classList.toggle('is-active', isMatch);
            if (isMatch) btn.scrollIntoView({ block: 'nearest' });
        });
    }

    function execute(cmd) {
        close();
        setTimeout(() => cmd.run(), 40);
    }

    function open() {
        ensureDOM();
        lastFocus = document.activeElement;
        input.value = '';
        activeIndex = 0;
        render();
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => input.focus());
    }

    function close() {
        if (!overlay || !overlay.classList.contains('is-open')) return;
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (overlay && overlay.classList.contains('is-open')) close();
            else open();
        } else if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
            e.preventDefault();
            close();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const trigger = document.getElementById('cmd-trigger');
        if (trigger) {
            const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
            trigger.innerHTML = isMac ? '&#8984;K' : 'Ctrl K';
            trigger.addEventListener('click', open);
        }
    });
})();

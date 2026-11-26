function applyTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) { }
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', String(isDark));
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

function toggleTheme(originEvent) {
    const nextDark = !document.body.classList.contains('dark-mode');
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || reduced) {
        applyTheme(nextDark);
        return;
    }

    const btn = document.getElementById('theme-toggle');
    let x = window.innerWidth - 36;
    let y = 32;
    if (originEvent && typeof originEvent.clientX === 'number' && (originEvent.clientX || originEvent.clientY)) {
        x = originEvent.clientX;
        y = originEvent.clientY;
    } else if (btn) {
        const rect = btn.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
    }

    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
        applyTheme(nextDark);
    });

    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                ]
            },
            {
                duration: 460,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    }).catch(() => { });
}

document.addEventListener('DOMContentLoaded', function () {
    const isDark = document.body.classList.contains('dark-mode');
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.setAttribute('aria-pressed', String(isDark));
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        btn.addEventListener('click', toggleTheme);
    }

    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

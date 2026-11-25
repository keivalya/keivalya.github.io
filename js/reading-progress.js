// Show a subtle reading position without intercepting or animating scroll.
(() => {
    const track = document.createElement('div');
    track.className = 'reading-progress';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', 'Page reading progress');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    const fill = document.createElement('span');
    fill.setAttribute('aria-hidden', 'true');
    track.append(fill);
    document.body.append(track);
    let frame = 0;
    function update() {
        frame = 0;
        const scrollable = document.documentElement.scrollHeight - innerHeight;
        const progress = scrollable > 0 ? Math.max(0, Math.min(1, scrollY / scrollable)) : 0;
        fill.style.transform = `scaleX(${progress})`;
        track.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    }
    function schedule() {
        if (!frame) frame = requestAnimationFrame(update);
    }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    update();
})();

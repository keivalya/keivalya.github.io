// A shared, noninteractive stage in the spare desktop margin.
(() => {
    const desktop = matchMedia('(min-width: 1280px) and (hover: hover) and (pointer: fine)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection;
    const rows = [...document.querySelectorAll('section .row > .d-flex')]
        .filter(row => row.querySelector(':scope > img') && row.querySelector('h5 a'));
    if (!rows.length) return;
    const stage = document.createElement('aside');
    stage.className = 'project-stage';
    // Existing links, descriptions, and thumbnails provide the accessible content.
    stage.setAttribute('aria-hidden', 'true');
    const media = document.createElement('div');
    media.className = 'project-stage-media';
    const layers = [];
    function dispose(element) {
        if (!element) return;
        element.onload = element.onloadeddata = element.onerror = null;
        if (element.tagName === 'VIDEO') element.pause();
        element.removeAttribute('src');
        if (element.tagName === 'VIDEO') element.load();
        element.remove();
    }
    const caption = document.createElement('div');
    caption.className = 'project-stage-caption';
    stage.append(media, caption);
    document.body.append(stage);
    let hovered = null, focused = null, active = null, version = 0, layer = 0, pending = 0, positionFrame = 0;
    function positionStage() {
        positionFrame = 0;
        if (!active || !stage.classList.contains('is-visible')) return;
        const rect = active.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight) {
            hovered = focused = null; clear(); return;
        }
        const height = stage.offsetHeight;
        const top = Math.max(16, Math.min(rect.top + rect.height / 2 - height / 2, innerHeight - height - 16));
        stage.style.top = `${top}px`;
    }
    function schedulePosition() {
        if (active && !positionFrame) positionFrame = requestAnimationFrame(positionStage);
    }
    function sizeStage(element) {
        const width = element.videoWidth || element.naturalWidth || 1;
        const height = element.videoHeight || element.naturalHeight || 1;
        const ratio = width / height;
        const availableWidth = Math.min(340, innerWidth / 2 - 424);
        const maxHeight = Math.min(420, innerHeight * .55);
        const displayWidth = Math.min(availableWidth, maxHeight * ratio);
        stage.style.width = `${displayWidth}px`;
        media.style.height = `${displayWidth / ratio}px`;
    }
    function clear() {
        clearTimeout(pending);
        cancelAnimationFrame(positionFrame);
        positionFrame = 0;
        version++;
        active?.classList.remove('is-previewed');
        active = null;
        stage.classList.remove('is-visible');
        // Stop offscreen GIFs and prevent a stale frame flashing on the next visit.
        layers.forEach(dispose);
        layers.length = 0;
    }
    function show(row) {
        if (!desktop.matches || reducedMotion.matches || connection?.saveData || document.hidden || !row) { clear(); return; }
        if (active === row) return;
        const token = ++version;
        layers.forEach(element => { if (element?.tagName === 'VIDEO') element.pause(); });
        active?.classList.remove('is-previewed');
        active = row;
        const thumbnail = row.querySelector(':scope > img');
        const title = row.querySelector('h5 a').textContent.trim().replace(/\s+/g, ' ');
        const next = 1 - layer;
        dispose(layers[next]);
        const source = thumbnail.dataset.previewSrc || thumbnail.currentSrc || thumbnail.src;
        const isVideo = /\.(mp4|webm)(?:[?#]|$)/i.test(source);
        const incoming = isVideo ? document.createElement('video') : new Image();
        if (isVideo) {
            incoming.muted = true;
            incoming.loop = true;
            incoming.playsInline = true;
            incoming.preload = 'auto';
        } else {
            incoming.alt = '';
            incoming.decoding = 'async';
        }
        layers[next] = incoming;
        media.append(incoming);
        const reveal = () => {
            if (token !== version || active !== row) return;
            const outgoing = layers[layer];
            outgoing?.classList.remove('is-current');
            if (outgoing?.tagName === 'VIDEO') outgoing.pause();
            // Keep only the short crossfade, then release the previous decoder.
            if (outgoing) setTimeout(() => {
                if (!outgoing.classList.contains('is-current')) dispose(outgoing);
            }, 220);
            incoming.classList.add('is-current');
            layer = next;
            caption.textContent = title;
            row.classList.add('is-previewed');
            sizeStage(incoming);
            stage.classList.add('is-visible');
            positionStage();
            if (isVideo) incoming.play().catch(() => { /* Keep its first frame if autoplay is blocked. */ });
        };
        if (isVideo) incoming.onloadeddata = reveal;
        else incoming.onload = reveal;
        incoming.onerror = () => { if (token === version) clear(); };
        incoming.src = source;
    }
    function update(immediate = false) {
        clearTimeout(pending);
        const row = hovered || focused;
        if (!row) { clear(); return; }
        if (immediate) show(row);
        else pending = setTimeout(() => show(row), 120);
    }
    rows.forEach(row => {
        row.addEventListener('pointerenter', event => {
            if (event.pointerType === 'touch') return;
            hovered = row; update();
        });
        row.addEventListener('pointerleave', () => {
            // Passing across a row shouldn't start a media download.
            if (hovered === row && active !== row) { hovered = null; clearTimeout(pending); }
        });
        row.addEventListener('focusin', () => { hovered = null; focused = row; update(true); });
        row.addEventListener('focusout', event => {
            if (!row.contains(event.relatedTarget)) {
                focused = rows.find(candidate => candidate.contains(event.relatedTarget)) || null;
                update(Boolean(focused));
            }
        });
    });
    new Set(rows.map(row => row.closest('section'))).forEach(section => {
        section.addEventListener('pointerleave', () => {
            if (hovered?.closest('section') === section) { hovered = null; update(); }
        });
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') { hovered = focused = null; clear(); }
    });
    // Clear the stage once the project section leaves the viewport.
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && active?.closest('section') === entry.target) {
                hovered = focused = null; clear();
            }
        });
    });
    new Set(rows.map(row => row.closest('section'))).forEach(section => observer.observe(section));
    window.addEventListener('scroll', schedulePosition, { passive: true });
    window.addEventListener('resize', () => {
        if (active && layers[layer]) { sizeStage(layers[layer]); schedulePosition(); }
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { hovered = focused = null; clear(); }
    });
    connection?.addEventListener('change', () => { if (connection.saveData) clear(); });
    desktop.addEventListener('change', () => { hovered = focused = null; clear(); });
    reducedMotion.addEventListener('change', () => { hovered = focused = null; clear(); });
})();

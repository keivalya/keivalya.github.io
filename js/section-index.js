// A quiet index into the existing page sections.
(() => {
    const sections = [...document.querySelectorAll('body > .container > section')];
    if (!sections.length) return;
    const nav = document.createElement('nav');
    nav.className = 'section-index';
    nav.setAttribute('aria-label', 'On this page');
    const marker = document.createElement('span');
    marker.className = 'section-index-marker';
    marker.setAttribute('aria-hidden', 'true');
    const list = document.createElement('ol');
    const used = new Set();
    const links = sections.map(section => {
        const heading = section.querySelector('h2');
        if (!heading) return null;
        let id = section.id || heading.id;
        if (!id) {
            const base = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
            id = base;
            let suffix = 2;
            while (used.has(id) || document.getElementById(id)) id = `${base}-${suffix++}`;
            section.id = id;
        }
        used.add(id);
        const item = document.createElement('li');
        item.className = 'section-index-item';
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent.trim().replace(/\s+/g, ' ');
        link.addEventListener('click', () => setActive(section));
        item.append(link);
        list.append(item);
        return { section, link, item };
    }).filter(Boolean);
    nav.append(marker, list);
    document.body.append(nav);
    let activeSection = null;
    function setActive(section) {
        const active = links.find(entry => entry.section === section);
        if (!active) return;
        activeSection = section;
        links.forEach(({ section: candidate, link }) => {
            if (candidate === section) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
        marker.style.transform = `translateY(${active.item.offsetTop}px)`;
    }
    const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target);
    }, { rootMargin: '-16% 0px -72% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
    const intro = document.querySelector('.hero');
    function updateVisibility() {
        const visible = intro ? intro.getBoundingClientRect().bottom < 24 : scrollY > 24;
        document.body.classList.toggle('has-scrolled-intro', visible);
        if (visible && !activeSection) setActive(sections[0]);
        if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) setActive(sections.at(-1));
        else if (scrollY < 8) {
            activeSection = null;
            links.forEach(({ link }) => link.removeAttribute('aria-current'));
        }
    }
    let frame = 0;
    function scheduleUpdate() {
        if (frame) return;
        frame = requestAnimationFrame(() => { frame = 0; updateVisibility(); });
    }
    addEventListener('scroll', scheduleUpdate, { passive: true });
    addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();
})();

(function () {
    'use strict';

    const footer = document.querySelector('.visitor-statistics');
    const counter = footer.querySelector('.visitor-count');
    const map = document.getElementById('visitor-map');
    const mapId = 'HfGicQYyVuJkCQMq6LmDR9BiwsBXOAnJfiZtLBDbeOQ';
    const updateFooter = () => footer.classList.toggle('has-content',
        !counter.hidden || (!map.hidden && !map.classList.contains('is-loading')));

    async function loadCount() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch('https://runhua.goatcounter.com/counter/TOTAL.json', {
                signal: controller.signal,
                credentials: 'omit'
            });
            if (!response.ok) return;
            const data = await response.json();
            if (!['string', 'number'].includes(typeof data.count) ||
                !/^\d[\d\s,.]*$/.test(String(data.count))) return;
            document.getElementById('visitor-count-value').textContent = String(data.count);
            counter.hidden = false;
            updateFooter();
        } catch (_) {
            // Private counters, blocked requests and outages leave no error panel.
        } finally {
            clearTimeout(timeout);
        }
    }

    const palette = () => document.body.classList.contains('light-mode')
        ? {background: 'f5f5f5', land: '606060', text: '333333'}
        : {background: '212121', land: 'aaaaaa', text: 'cccccc'};
    let finished = false;
    let backgroundReady = false;
    let backgroundUrl = '';
    let timeout;
    let mutations;

    function failMap() {
        finished = true;
        clearTimeout(timeout);
        mutations.disconnect();
        map.hidden = true;
        map.classList.remove('is-loading');
        updateFooter();
    }

    function showMap() {
        if (finished || !backgroundReady || !map.querySelector('svg') ||
            map.querySelector('.mapmyvisitors-loading')) return;
        finished = true;
        clearTimeout(timeout);
        mutations.disconnect();
        const link = map.querySelector('#mapmyvisitors-widget');
        const summary = document.createElement('div');
        summary.className = 'visitor-map-summary';
        summary.append(...map.querySelectorAll('.mapmyvisitors-visitors, .mapmyvisitors-date'));
        map.querySelector('.mapmyvisitors-map-container').appendChild(summary);
        if (link) {
            const url = new URL(link.href);
            url.protocol = 'https:';
            link.href = url.href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', 'Visitor map by MapMyVisitors');
        }
        map.classList.remove('is-loading');
        updateFooter();
        window.dispatchEvent(new Event('resize'));
    }

    function updateMapAppearance() {
        if (map.hidden) return;
        const surface = map.querySelector('.mapmyvisitors-map');
        if (!surface) return;
        const colors = palette();
        // Recolor the provider's map image without reloading its tracking script.
        const url = `https://mapmyvisitors.com/generated_content/backs/bg-w_680-co_${colors.background}-cl_${colors.land}.png`;
        if (url === backgroundUrl) return;
        backgroundUrl = url;
        backgroundReady = false;
        const image = new Image();
        image.onload = () => {
            if (backgroundUrl !== url || map.hidden) return;
            surface.style.backgroundImage = `url("${url}")`;
            backgroundReady = true;
            showMap();
        };
        image.onerror = () => {
            if (backgroundUrl === url) failMap();
        };
        image.src = url;
    }

    map.classList.add('is-loading');
    map.hidden = false;
    mutations = new MutationObserver(() => {
        updateMapAppearance();
        showMap();
    });
    mutations.observe(map, {childList: true, subtree: true});
    timeout = setTimeout(failMap, 15000);
    const colors = palette();
    const script = document.createElement('script');
    script.id = 'mapmyvisitors';
    script.async = true;
    const url = new URL('https://mapmyvisitors.com/map.js');
    url.search = new URLSearchParams({d: mapId, cl: colors.land, co: colors.background,
        ct: colors.text, w: 'a'}).toString();
    script.src = url.href;
    script.onerror = failMap;
    map.appendChild(script);

    new MutationObserver(updateMapAppearance).observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    loadCount();
}());

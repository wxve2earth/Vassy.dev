(() => {
    const SIZE = 0.5;
    const MAX_TILT = 6.5;
    const RADIUS = 12;
    const RING = 3;

    const source = document.querySelector('.heropfp');
    const srcImg = source && source.querySelector('img');
    if (!srcImg) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v) => Math.min(Math.max(v, 0), 1);

    const backdrop = document.createElement('div');
    backdrop.className = 'pfp-backdrop';
    document.body.appendChild(backdrop);

    let state = 'closed';
    let zoom = null;
    let tilt = null;
    let observer = null;
    let finished = null;
    let start = null;

    const REST = { x: 73, y: 96 };
    let lx = REST.x, ly = REST.y, tx = REST.x, ty = REST.y, lightRaf = 0;

    function setLight(x, y) {
        tx = x; ty = y;
        if (!lightRaf) lightRaf = requestAnimationFrame(stepLight);
    }

    function stepLight() {
        lx += (tx - lx) * 0.12;
        ly += (ty - ly) * 0.12;
        if (tilt) {
            tilt.style.setProperty('--lx', lx.toFixed(2) + '%');
            tilt.style.setProperty('--ly', ly.toFixed(2) + '%');
        }
        lightRaf = (tilt && (Math.abs(tx - lx) > 0.05 || Math.abs(ty - ly) > 0.05))
            ? requestAnimationFrame(stepLight)
            : 0;
    }

    function resetTilt() {
        if (!tilt) return;
        tilt.classList.remove('tracking');
        tilt.style.setProperty('--rx', '0deg');
        tilt.style.setProperty('--ry', '0deg');
        tilt.style.setProperty('--mx', '50%');
        tilt.style.setProperty('--my', '50%');
        setLight(REST.x, REST.y);
    }

    function onMove(e) {
        if (state !== 'open') return;

        const r = zoom.getBoundingClientRect();
        const x = clamp((e.clientX - r.left) / r.width);
        const y = clamp((e.clientY - r.top) / r.height);

        tilt.classList.add('tracking');
        tilt.style.setProperty('--ry', ((x - 0.5) * MAX_TILT * 2).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', ((0.5 - y) * MAX_TILT * 2).toFixed(2) + 'deg');
        tilt.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        tilt.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        setLight(REST.x - (x - 0.5) * 60, REST.y - (y - 0.5) * 40);
    }

    function open() {
        if (state !== 'closed') return;
        state = 'opening';

        const r = srcImg.getBoundingClientRect();

        const S = Math.min(innerWidth, innerHeight) * SIZE;
        const s0 = r.width / S;
        const dx = r.left + r.width / 2 - innerWidth / 2;
        const dy = r.top + r.height / 2 - innerHeight / 2;

        start = {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${s0})`,
            radius: `${RADIUS / s0}px`,
            shadow: `0 0 0 ${RING / s0}px var(--pfp-border), 0 0 0 0 rgb(0 0 0 / 0)`
        };

        zoom = document.createElement('div');
        zoom.className = 'pfp-zoom';
        Object.assign(zoom.style, {
            left: (innerWidth - S) / 2 + 'px',
            top: (innerHeight - S) / 2 + 'px',
            width: S + 'px',
            height: S + 'px',
            transform: start.transform
        });
        zoom.innerHTML =
            '<div class="pfp-tilt"><img alt=""><div class="pfp-glare"></div></div>';
        tilt = zoom.firstElementChild;
        lx = tx = REST.x; ly = ty = REST.y;
        tilt.style.borderRadius = start.radius;
        tilt.style.boxShadow = start.shadow;
        tilt.querySelector('img').src = srcImg.currentSrc || srcImg.src;
        document.body.appendChild(zoom);

        srcImg.style.visibility = 'hidden';

        zoom.getBoundingClientRect();

        zoom.style.transform = 'translate3d(0, 0, 0) scale(1)';
        zoom.classList.add('lit');
        tilt.style.borderRadius = '0px';
        tilt.style.boxShadow =
            '0 0 0 0px var(--pfp-border), 0 0 0 0 rgb(0 0 0 / 0)';
        backdrop.classList.add('show');

        if (!reduceMotion) {
            zoom.addEventListener('mousemove', onMove);
            zoom.addEventListener('mouseleave', resetTilt);
        }
        zoom.addEventListener('click', () => close());

        const page = source.closest('.page');
        if (page) {
            observer = new MutationObserver(() => {
                if (!page.classList.contains('active')) close(true);
            });
            observer.observe(page, { attributes: true, attributeFilter: ['class'] });
        }

        setTimeout(() => { if (state === 'opening') state = 'open'; }, 450);
    }

    function close(fade = false) {
        if (state === 'closed' || state === 'closing') return;
        state = 'closing';

        resetTilt();
        zoom.classList.remove('lit');
        backdrop.classList.remove('show');

        if (fade) {
            zoom.classList.add('fading');
        } else {
            zoom.style.transform = start.transform;
            tilt.style.borderRadius = start.radius;
            tilt.style.boxShadow = start.shadow;
        }

        const el = zoom;
        let done = false;
        finished = () => {
            if (done) return;
            done = true;
            if (observer) { observer.disconnect(); observer = null; }
            el.remove();
            srcImg.style.visibility = '';
            zoom = tilt = null;
            state = 'closed';
        };
        el.addEventListener('transitionend', (e) => {
            if (e.target === el) finished();
        });
        setTimeout(() => finished && finished(), 700);
    }

    source.addEventListener('click', open);
    backdrop.addEventListener('click', () => close());
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => close(true));
})();
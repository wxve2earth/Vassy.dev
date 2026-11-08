const sections = [...document.querySelectorAll(".page")];
const dots = [...document.querySelectorAll(".page-dots .dot")];
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];

let currentSection = Math.max(
    0,
    sections.findIndex(section => section.classList.contains("active"))
);

let isScrolling = false;
let scrollTimeout;
const scrollCooldown = 800;

const LIST_EDGE_CHANGES_SECTION = false;
const LIST_EDGE_PAUSE = 700;
const LIST_SCROLL_DURATION = 260;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let lastListStep = 0;

function isEditing(event) {
    return event.target.closest(
        "input, textarea, select, [contenteditable], .contacteditor"
    );
}

function animateList(list, target) {
    cancelAnimationFrame(list._raf);
    list._targetY = target;

    if (LIST_SCROLL_DURATION <= 0 || prefersReducedMotion.matches) {
        list.scrollTop = target;
        list._animating = false;
        return;
    }

    const start = list.scrollTop;
    const distance = target - start;
    const startTime = performance.now();

    list._animating = true;

    const tick = now => {
        const progress = Math.min((now - startTime) / LIST_SCROLL_DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        list.scrollTop = start + distance * eased;

        if (progress < 1) {
            list._raf = requestAnimationFrame(tick);
        } else {
            list._animating = false;
        }
    };

    list._raf = requestAnimationFrame(tick);
}

function stepList(list, goingDown) {
    const items = [...list.querySelectorAll(".project")];
    if (items.length === 0) return false;

    const firstTop = items[0].offsetTop;
    const tops = items.map(item => item.offsetTop - firstTop);
    const max = list.scrollHeight - list.clientHeight;

    const y = list._animating ? list._targetY : list.scrollTop;

    let target;

    if (goingDown) {
        if (y >= max - 1) return false;
        const next = tops.find(top => top > y + 1);
        target = Math.min(next ?? max, max);
    } else {
        if (y <= 0) return false;
        const previous = [...tops].reverse().find(top => top < y - 1);
        target = previous ?? 0;
    }

    animateList(list, target);
    return true;
}

function isListScrollable(list) {
    return list.scrollHeight > list.clientHeight + 1;
}

function listEdges(list) {
    return {
        scrollable: isListScrollable(list),
        atTop: list.scrollTop <= 0,
        atBottom: list.scrollTop + list.clientHeight >= list.scrollHeight - 1
    };
}

let wheelAccum = 0;

function isWheelTick(event) {
    if (event.deltaMode !== 0 || Math.abs(event.deltaY) >= 40) {
        wheelAccum = 0;
        return true;
    }

    if (wheelAccum && Math.sign(wheelAccum) !== Math.sign(event.deltaY)) wheelAccum = 0;

    wheelAccum += event.deltaY;
    if (Math.abs(wheelAccum) < 100) return false;

    wheelAccum = 0;
    return true;
}

function showSection(index) {
    if (
        index < 0 ||
        index >= sections.length ||
        index === currentSection ||
        isScrolling
    ) return;

    isScrolling = true;

    const previousSection = sections[currentSection];
    const nextSection = sections[index];
    const direction = index > currentSection ? 1 : -1;

    if (previousSection.id === "home") {
        const scrollHint = document.querySelector(".scrolldownwrap");
        if (scrollHint) {
            scrollHint.classList.add("gone");
            setTimeout(() => scrollHint.remove(), 600);
        }
    }

    nextSection.style.transition = "none";
    previousSection.style.transition = "none";

    nextSection.classList.remove("active", "leaving");
    previousSection.classList.remove("active", "leaving");

    nextSection.style.visibility = "visible";
    nextSection.style.opacity = "1";
    nextSection.style.zIndex = "2";
    nextSection.style.transform = `translateY(${direction * 100}%)`;

    previousSection.style.visibility = "visible";
    previousSection.style.opacity = "1";
    previousSection.style.zIndex = "1";
    previousSection.style.transform = "translateY(0)";

    void nextSection.offsetHeight;

    nextSection.classList.add("active");
    previousSection.classList.add("leaving");

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${nextSection.id}`
        );
    });

    currentSection = index;

    nextSection.classList.remove("animate");
    void nextSection.offsetWidth;
    nextSection.classList.add("animate");

    if (nextSection.id === "home") startTypewriter();

    requestAnimationFrame(() => {
        nextSection.style.transition = "";
        previousSection.style.transition = "";

        nextSection.style.transform = "translateY(0)";
        previousSection.style.transform = `translateY(${-direction * 100}%)`;
    });

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        previousSection.style.transition = "none";

        previousSection.classList.remove("active", "leaving", "animate");

        previousSection.style.visibility = "";
        previousSection.style.opacity = "";
        previousSection.style.zIndex = "";
        previousSection.style.transform = "";

        nextSection.style.transform = "";
        nextSection.style.transition = "";

        if (previousSection.id === "home") stopTypewriter();

        void previousSection.offsetHeight;

        previousSection.style.transition = "";

        isScrolling = false;
    }, scrollCooldown);
}

let lastWheel = 0;

window.addEventListener("wheel", event => {
    if (!document.body.classList.contains("entered") || isEditing(event)) return;

    event.preventDefault();

    const now = performance.now();
    const newGesture = now - lastWheel > 150;
    lastWheel = now;

    if (event.deltaY === 0) return;

    const goingDown = event.deltaY > 0;
    const list = event.target.closest(".projectslist");

    if (list && isListScrollable(list)) {
        if (isScrolling) return;
        if (!isWheelTick(event)) return;

        if (stepList(list, goingDown)) {
            lastListStep = now;
            return;
        }

        if (!LIST_EDGE_CHANGES_SECTION || !newGesture) return;
        if (now - lastListStep < LIST_EDGE_PAUSE) return;

        showSection(currentSection + (goingDown ? 1 : -1));
        return;
    }

    if (isScrolling || !newGesture || Math.abs(event.deltaY) < 10) return;

    showSection(currentSection + (goingDown ? 1 : -1));
}, { passive: false });

navLinks.forEach((link, index) => {
    link.addEventListener("click", event => {
        event.preventDefault();
        showSection(index);
    });
});

window.addEventListener("keydown", event => {
    if (!document.body.classList.contains("entered")) return;

    if (isEditing(event)) return;

    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        showSection(currentSection + 1);
    }

    if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        showSection(currentSection - 1);
    }

    if (event.key === "Home") {
        event.preventDefault();
        showSection(0);
    }

    if (event.key === "End") {
        event.preventDefault();
        showSection(sections.length - 1);
    }
});

let touchStartY = 0;
let touchListEdges = null;

window.addEventListener("touchstart", event => {
    touchStartY = event.changedTouches[0].screenY;

    const list = event.target.closest(".projectslist");
    touchListEdges = list ? listEdges(list) : null;
}, { passive: true });

window.addEventListener("touchend", event => {
    if (!document.body.classList.contains("entered") || isScrolling || isEditing(event)) return;

    const difference = touchStartY - event.changedTouches[0].screenY;

    if (Math.abs(difference) < 50) return;

    if (touchListEdges && touchListEdges.scrollable) {
        const goingDown = difference > 0;
        if (goingDown && !touchListEdges.atBottom) return;
        if (!goingDown && !touchListEdges.atTop) return;
        if (!LIST_EDGE_CHANGES_SECTION) return;
    }

    showSection(currentSection + (difference > 0 ? 1 : -1));
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.closest(".nav")) return;

    link.addEventListener("click", event => {
        const targetId = link.getAttribute("href").slice(1);
        const index = sections.findIndex(section => section.id === targetId);

        if (index === -1) return;

        event.preventDefault();
        showSection(index);
    });
});
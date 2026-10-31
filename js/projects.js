const projects = [
    {
        name: "Portfolio",
        description: "Yep, this is the very website you're browsing right now. Hope you like it!",
        date: "October 31, 2026",
        important: true,
        pinned: true,
        url: "https://github.com/wxve2earth/Vassy.dev"
    },
    {
        name: "Livecord",
        description: "A Discord data API providing live user data through REST and WebSocket.",
        date: "July 18, 2026",
        important: true,
        pinned: true,
        url: "https://github.com/wxve2earth/Livecord"
    },
    {
        name: "Bitecoin",
        description: "A simple cryptocurrency built from scratch in Rust with a friend.",
        date: "October 15, 2026",
        important: false,
        pinned: false,
        url: "https://github.com/jarabum/bitecoin"
    },
];

const MAX_VISIBLE = 3;

(() => {
    const list = document.getElementById("projectsList");
    if (!list) return;

    const PIN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`;

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));

    const sorted = projects
        .map((project, index) => ({ project, index }))
        .sort((a, b) => (Boolean(b.project.pinned) - Boolean(a.project.pinned)) || (a.index - b.index))
        .map(({ project }) => project);

    if (sorted.length === 0) {
        list.innerHTML = `<p class="projectsempty" data-anim="up" style="--delay:0.18s">Nothing here yet, check back soon.</p>`;
        return;
    }

    list.innerHTML = sorted.map((p, i) => {
        const classes = `project${p.important ? " important" : ""}${p.pinned ? " pinned" : ""}`;
        const delay = (0.18 + i * 0.08).toFixed(2);
        const name = escapeHTML(p.name);

        const title = p.url
            ? `<a class="projectlink" href="${escapeHTML(p.url)}" target="_blank" rel="noopener noreferrer">${name}</a>`
            : name;

        return `
            <div class="${classes}" data-anim="up" style="--delay:${delay}s">
                <div class="projectmeta">
                    ${p.pinned ? `<span class="projectpin">${PIN_ICON}Pinned</span>` : ""}
                    ${p.date ? `<span class="projectdate">${escapeHTML(p.date)}</span>` : ""}
                </div>
                <div class="projectcontent">
                    <h3 class="projectname">${title}</h3>
                    <p class="projectdescription">${escapeHTML(p.description)}</p>
                </div>
            </div>`;
    }).join("");

    function fitList() {
        const items = list.querySelectorAll(".project");
        list.style.maxHeight = "";
        if (items.length <= MAX_VISIBLE) return;

        const style = getComputedStyle(list);
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const gap = parseFloat(style.rowGap) || 0;
        const height = items[MAX_VISIBLE].offsetTop - items[0].offsetTop - gap;

        list.style.maxHeight = `${height + padding}px`;
    }

    const hint = document.createElement("div");
    hint.className = "projectshint";
    hint.setAttribute("aria-hidden", "true");
    hint.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 18L12 22L16 18"/><path d="M12 2V22"/></svg><span>more</span>`;
    list.parentElement.appendChild(hint);

    function updateHint() {
        const scrollable = list.scrollHeight > list.clientHeight + 1;
        const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
        hint.classList.toggle("visible", scrollable && !atBottom);
    }

    function refresh() {
        fitList();
        updateHint();
    }

    refresh();
    list.addEventListener("scroll", updateHint, { passive: true });
    window.addEventListener("resize", refresh);
    if (document.fonts) document.fonts.ready.then(refresh);
})();
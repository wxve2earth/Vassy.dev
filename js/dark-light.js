const toggle = document.getElementById("themeToggle");
const pfp = document.getElementById("pfp");

const pfpSources = {
    light: "pictures/pfp.jpg",
    dark: "pictures/pfp2.png"
};

// load both pictures up front so the swap is instant
Object.values(pfpSources).forEach((src) => { new Image().src = src; });

const PFP_EFFECT = "flip";      // "flip", "blur" or "iris" (used when the page wipe isn't available)

const pfpEffects = {
    flip: {
        out: [{ transform: "perspective(700px) rotateY(0deg)" },
              { transform: "perspective(700px) rotateY(90deg)" }],
        in:  [{ transform: "perspective(700px) rotateY(-90deg)" },
              { transform: "perspective(700px) rotateY(0deg)" }]
    },
    blur: {
        out: [{ opacity: 1, filter: "blur(0px)", transform: "scale(1)" },
              { opacity: 0, filter: "blur(8px)", transform: "scale(0.92)" }],
        in:  [{ opacity: 0, filter: "blur(8px)", transform: "scale(0.92)" },
              { opacity: 1, filter: "blur(0px)", transform: "scale(1)" }]
    },
    iris: {
        out: [{ clipPath: "circle(75% at 50% 50%)" },
              { clipPath: "circle(0% at 50% 50%)" }],
        in:  [{ clipPath: "circle(0% at 50% 50%)" },
              { clipPath: "circle(75% at 50% 50%)" }]
    }
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

async function updatePfp(animate = true) {
    const src = document.body.classList.contains("light") ? pfpSources.light : pfpSources.dark;

    if (!animate || reduceMotion.matches || !pfp.animate) {
        pfp.src = src;
        return;
    }

    const next = new Image();
    next.src = src;
    try { await next.decode(); } catch {}

    const effect = pfpEffects[PFP_EFFECT];

    const out = pfp.animate(effect.out, {
        duration: 260,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards"
    });
    await out.finished;

    pfp.src = src;

    pfp.animate(effect.in, {
        duration: 380,
        easing: "cubic-bezier(0.17, 0.84, 0.44, 1)"
    });
    out.cancel();
}

let themeChanging = false;
const themeCooldown = 1500;

// the circular wipe needs the View Transitions API
const canWipe = typeof document.startViewTransition === "function";

toggle.addEventListener("click", async () => {
    if (themeChanging) return;

    themeChanging = true;
    toggle.disabled = true;

    const applyTheme = () => {
        document.body.classList.toggle("light");

        const isLight = document.body.classList.contains("light");

        toggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark mode" : "Switch to light mode"
        );

        switchMusic(isLight ? "light" : "dark");
    };

    if (canWipe && !reduceMotion.matches) {
        // the circle starts at the toggle and grows until it covers the farthest corner
        const rect = toggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        document.documentElement.classList.add("theme-switching");

        const transition = document.startViewTransition(async () => {
            applyTheme();
            updatePfp(false);                    // swaps instantly; the wipe is the animation
            try { await pfp.decode(); } catch {}
        });

        transition.ready
            .then(() => {
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${radius}px at ${x}px ${y}px)`
                        ]
                    },
                    {
                        duration: 750,
                        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                        pseudoElement: "::view-transition-new(root)"
                    }
                );
            })
            .catch(() => {});

        transition.finished
            .catch(() => {})
            .finally(() => document.documentElement.classList.remove("theme-switching"));
    } else {
        applyTheme();
        updatePfp();                             // the flip, for browsers without the wipe
    }

    await new Promise(resolve => setTimeout(resolve, themeCooldown));

    themeChanging = false;
    toggle.disabled = false;
});
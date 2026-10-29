const toggle = document.getElementById("themeToggle");

let themeChanging = false;
const themeCooldown = 1500;

toggle.addEventListener("click", async () => {
    if (themeChanging) return;

    themeChanging = true;
    toggle.disabled = true;

    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    const theme = isLight ? "light" : "dark";

    toggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
    );

    switchMusic(theme);

    await new Promise(resolve => setTimeout(resolve, themeCooldown));

    themeChanging = false;
    toggle.disabled = false;
});
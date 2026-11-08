const overlay = document.getElementById("overlay");
const overlayLayer = document.querySelector(".overlaylayer");

let entered = false;

overlay.addEventListener("click", () => {
    if (entered) return;
    entered = true;

    document.body.classList.add("entered");
    document.querySelector("#home").classList.add("animate");
    startTypewriter();

    overlay.classList.add("hidden");
    overlayLayer.classList.add("hidden");

    setMusicEnabled(true);
});
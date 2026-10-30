const sounds = {
    clickDown: new Audio("sounds/cd.mp3"),
    clickUp: new Audio("sounds/cu.mp3"),
    key1: new Audio("sounds/k1.wav"),
    key2: new Audio("sounds/k2.wav"),
    key3: new Audio("sounds/k3.wav"),
};

const volume = 0.25

Object.values(sounds).forEach(sound => {
    sound.preload = "auto";
    sound.volume = volume;
})

function playSound(sound) {
    const audio = sound.cloneNode();
    audio.volume = volume;
    audio.play().catch(() =>  {});
}

document.addEventListener("pointerdown", e => {
    if (e.button === 0 || e.button === 2) {
        playSound(sounds.clickDown)
    }
}) 

document.addEventListener("pointerup", e => {
    if (e.button === 0 || e.button === 2) {
        playSound(sounds.clickUp)
    }
}) 

let nextKeySound = true;
document.addEventListener("keydown", e => {
    if (e.repeat) return;

    const target = e.target;

    if (!(target instanceof Element)) return;

    const isInput = target.matches(
        'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="range"]):not([type="color"]), textarea'
    )

    const isEditable = isInput || target.isContentEditable;

    if (!isEditable) return;

    const specialKeys = [
        " ",
        "Backspace",
        "Enter",
        "Tab",
        "Delete",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
    ];

    if (specialKeys.includes(e.key)) {
        playSound(sounds.key3);
    } else if (e.key.length === 1) {
        playSound(nextKeySound ? sounds.key1 : sounds.key2);
        nextKeySound = !nextKeySound;
    }
})
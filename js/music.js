let musicEnabled = false;

const musicTracks = {
    dark: [
        "sounds/music/dark1.mp3",
        "sounds/music/dark2.mp3",
    ],
    light: [
        "sounds/music/light1.mp3",
        "sounds/music/light2.mp3",
    ]
};

let currentTheme = null;
let currentTrack = null;
let currentMusic = null;

const fadeOutDuration = 400;
const fadeInDuration = 400;
const silenceDuration = 500;
let musicVolume = 0.1;

let transitionId = 0;

let trackQueue = {
    dark: [],
    light: []
};

function getRandomTrack(theme) {
    if (trackQueue[theme].length === 0) {
        trackQueue[theme] = [...musicTracks[theme]];

        for (let i = trackQueue[theme].length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [trackQueue[theme][i], trackQueue[theme][j]] =
                [trackQueue[theme][j], trackQueue[theme][i]];
        }

        if (trackQueue[theme].length > 1 && trackQueue[theme][0] === currentTrack) {
            [trackQueue[theme][0], trackQueue[theme][1]] =
                [trackQueue[theme][1], trackQueue[theme][0]];
        }
    }

    return trackQueue[theme].shift();
}

function fadeMusic(audio, targetVolume, duration) {
    return new Promise(resolve => {
    const startVolume = audio.volume;
    const startTime = performance.now();

        function fade() {
            const progress = Math.min((performance.now() - startTime) / duration, 1);

            audio.volume = startVolume + (targetVolume - startVolume) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                resolve();
            }
        }

        fade();
    });
}

async function startMusic(theme) {
    if (!musicEnabled) return;

    const id = transitionId;
    const track = getRandomTrack(theme);
    const audio = new Audio(track);

    audio.volume = 0;
    audio.loop = false;

    audio.addEventListener("ended", () => {
        if (musicEnabled && currentMusic === audio) {
            currentMusic = null;
            startMusic(theme);
        }
    });

    try {
        await audio.play();

        if (!musicEnabled || id !== transitionId) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        currentMusic = audio;
        currentTrack = track;
        currentTheme = theme;

        await fadeMusic(audio, musicVolume, fadeInDuration);

        if (!musicEnabled || id !== transitionId) {
            audio.pause();
            audio.currentTime = 0;
        }
    } catch (error) {
        console.error("Could not play music:", error);
    }
}

async function switchMusic(theme) {
    if (!musicEnabled || theme === currentTheme) return;

    const id = ++transitionId;

    if (currentMusic) {
        const oldMusic = currentMusic;

        await fadeMusic(oldMusic, 0, fadeOutDuration);

        if (id !== transitionId) return;

        oldMusic.pause();
        oldMusic.currentTime = 0;
        currentMusic = null;

        await new Promise(resolve => setTimeout(resolve, silenceDuration));

        if (!musicEnabled || id !== transitionId) return;
    }

    if (!musicEnabled || id !== transitionId) return;

    await startMusic(theme);
}

async function setMusicEnabled(enabled) {
    musicEnabled = enabled;

    if (!musicEnabled) {
        transitionId++;

        if (currentMusic) {
            const audio = currentMusic;
            currentMusic = null;

            await fadeMusic(audio, 0, fadeOutDuration);
            audio.pause();
            audio.currentTime = 0;
        }

        currentTrack = null;
        currentTheme = null;
        return null;
    }

    const theme = document.body.classList.contains("light") ? "light" : "dark";

    await switchMusic(theme);
}
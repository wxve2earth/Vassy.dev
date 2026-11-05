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
let musicMuted = false;
let musicFadeLevel = 0;

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

function fadeMusic(audio, targetLevel, duration) {
    return new Promise(resolve => {
        const startLevel = musicFadeLevel;
        const startTime = performance.now();

        function fade() {
            const progress = Math.min(
                (performance.now() - startTime) / duration,
                1
            );

            musicFadeLevel = startLevel + (targetLevel - startLevel) * progress;

            audio.volume = musicMuted ? 0 : musicVolume * musicFadeLevel;

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

        musicFadeLevel = 0;
        await fadeMusic(audio, 1, fadeInDuration);

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

const volumeSlider = document.getElementById("musicVolume");
const muteButton = document.getElementById("musicMute");
const musicIcon = document.getElementById("musicIcon");

function updateMusicIcon() {
    const isMuted = musicMuted || musicVolume === 0;

    if (isMuted) {
        musicIcon.innerHTML = `
            <path d="M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298z"/>
            <path d="m16.5 14.5 5-5"/>
            <path d="m16.5 9.5 5 5"/>
        `;
    } else if (musicVolume <= 0.5) {
        musicIcon.innerHTML = `
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
            <path d="M16 9a5 5 0 0 1 0 6"/>
        `;
    } else {
        musicIcon.innerHTML = `
            <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
            <path d="M16 9a5 5 0 0 1 0 6"/>
            <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>
        `;
    }

    muteButton.setAttribute(
        "aria-label",
        isMuted ? "Unmute music" : "Mute music"
    );
}

let volumeUpdateId = 0;

function smoothlySetVolume(audio, targetVolume) {
    const id = ++volumeUpdateId;
    const startVolume = audio.volume;
    const startTime = performance.now();
    const duration = 500;

    function update() {
        if (id !== volumeUpdateId) return;

        const progress = Math.min(
            (performance.now() - startTime) / duration,
            1
        );

        audio.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function updateVolumeSlider() {
    volumeSlider.style.setProperty(
        "--volume-progress",
        `${volumeSlider.value}%`
    );
}

volumeSlider.value = musicVolume * 100;

updateVolumeSlider();
updateMusicIcon();

volumeSlider.addEventListener("input", () => {
    musicVolume = Number(volumeSlider.value) / 100;

    if (currentMusic) {
        smoothlySetVolume(
            currentMusic,
            musicMuted ? 0 : musicVolume * musicFadeLevel
        );
    }

    updateVolumeSlider();
    updateMusicIcon();
});

muteButton.addEventListener("click", () => {
    musicMuted = !musicMuted;

    if (currentMusic) {
        smoothlySetVolume(
            currentMusic,
            musicMuted ? 0 : musicVolume * musicFadeLevel
        );
    }   

    updateMusicIcon();
});
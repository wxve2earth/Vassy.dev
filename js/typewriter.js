const config = {
    texts: [
        "Developer & Designer",
        "full-stack dev",
        "#1 cat enthusiast",
        "discord.gg/0x274",
        "@m4nsion on discord"
    ],

    typingSpeed: 80,
    deletingSpeed: 50,
    pauseAfterTyping: 1400,
    pauseBetweenTexts: 350,
    startDelay: 200,
};

const typeWriter = document.getElementById("typewriter");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let runId = 0;

async function startTypewriter() {
    const myRun = ++runId;
    const cancelled = () => myRun !== runId;

    typeWriter.textContent = "";

    await sleep(config.startDelay);
    if (cancelled()) return;

    let index = 0;
    while (!cancelled()) {
        const text = config.texts[index];

        for (let i = 1; i <= text.length; i++) {
            typeWriter.textContent = text.slice(0, i);
            await sleep(config.typingSpeed);
            if (cancelled()) return;
        }

        await sleep(config.pauseAfterTyping);
        if (cancelled()) return;

        for (let i = text.length - 1; i >= 0; i--) {
            typeWriter.textContent = text.slice(0, i);
            await sleep(config.deletingSpeed);
            if (cancelled()) return;
        }

        index = (index + 1) % config.texts.length;

        await sleep(config.pauseBetweenTexts);
    }
}

function stopTypewriter() {
    runId++;
}
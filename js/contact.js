const contactForm = document.getElementById("contactForm");
const messageBox = document.getElementById("contactMessage");
const countEl = document.getElementById("contactCount");
const fileInput = document.getElementById("contactFiles");
const fileList = document.getElementById("contactFileList");
const noteEl = document.getElementById("contactNote");
const sendBtn = document.getElementById("contactSend");

const WORKER_URL = "https://portfolio-contact.vasikagggs.workers.dev";

const MAX_FILES = 3;
const MAX_TOTAL_MB = 10;
const MAX_TOTAL = MAX_TOTAL_MB * 1024 * 1024;

const X_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

function updateCount() {
    countEl.textContent = `${messageBox.value.length}/${messageBox.maxLength}`;
}
messageBox.addEventListener("input", updateCount);

function canInsert(selectedLength, insertLength) {
    return messageBox.value.length - selectedLength + insertLength <= messageBox.maxLength;
}

function wrapSelection(before, after, fallback) {
    const start = messageBox.selectionStart;
    const end = messageBox.selectionEnd;
    const selected = messageBox.value.slice(start, end);
    const text = selected || fallback;
    const insert = before + text + after;

    if (!canInsert(end - start, insert.length)) return;

    messageBox.setRangeText(insert, start, end, "end");

    if (!selected) {
        messageBox.setSelectionRange(start + before.length, start + before.length + text.length);
    }

    messageBox.focus();
    updateCount();
}

function insertLink() {
    const start = messageBox.selectionStart;
    const end = messageBox.selectionEnd;
    const selected = messageBox.value.slice(start, end);
    const text = selected || "link text";
    const insert = `[${text}](url)`;

    if (!canInsert(end - start, insert.length)) return;

    messageBox.setRangeText(insert, start, end, "end");

    if (selected) {
        const urlStart = start + text.length + 3;
        messageBox.setSelectionRange(urlStart, urlStart + 3);
    } else {
        messageBox.setSelectionRange(start + 1, start + 1 + text.length);
    }

    messageBox.focus();
    updateCount();
}

document.querySelectorAll(".contacttool").forEach(button => {
    button.addEventListener("click", () => {
        switch (button.dataset.format) {
            case "bold":   wrapSelection("**", "**", "text"); break;
            case "italic": wrapSelection("*", "*", "text");   break;
            case "link":   insertLink();                      break;
            case "image":  fileInput.click();                 break;
        }
    });
});

let files = [];

function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function totalSize() {
    return files.reduce((sum, f) => sum + f.size, 0);
}

function showNote(text) {
    noteEl.textContent = text;
}

function renderFiles() {
    fileList.innerHTML = "";

    files.forEach((file, index) => {
        const li = document.createElement("li");
        li.className = "contactfile";

        const name = document.createElement("span");
        name.className = "contactfilename";
        name.textContent = file.name;

        const size = document.createElement("span");
        size.className = "contactfilesize";
        size.textContent = formatSize(file.size);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "contactfileremove";
        remove.setAttribute("aria-label", `Remove ${file.name}`);
        remove.innerHTML = X_ICON;
        remove.addEventListener("click", () => {
            files.splice(index, 1);
            showNote("");
            renderFiles();
        });

        li.append(name, size, remove);
        fileList.appendChild(li);
    });
}

function addFiles(newFiles) {
    showNote("");

    for (const file of newFiles) {
        const duplicate = files.some(f =>
            f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
        );
        if (duplicate) continue;

        if (files.length >= MAX_FILES) {
            showNote(`You can attach up to ${MAX_FILES} files.`);
            break;
        }

        if (totalSize() + file.size > MAX_TOTAL) {
            showNote(`Files can't exceed ${MAX_TOTAL_MB} MB in total.`);
            continue;
        }

        files.push(file);
    }

    renderFiles();
}

fileInput.addEventListener("change", () => {
    addFiles([...fileInput.files]);
    fileInput.value = "";
});

function resetForm() {
    contactForm.reset();
    files = [];
    renderFiles();
    updateCount();
}

contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (sendBtn.disabled) return;

    if (!contactForm.checkValidity() || !messageBox.value.trim()) {
        contactForm.reportValidity();
        return;
    }

    const formData = new FormData(contactForm);
    files.forEach(file => formData.append("files", file, file.name));

    sendBtn.disabled = true;
    sendBtn.textContent = "sending...";
    showNote("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            body: formData,
            signal: controller.signal
        });

        if (!response.ok) {
            let reason = "Something went wrong. Please try again.";
            try {
                const data = await response.json();
                if (data.error) reason = data.error;
            } catch {}
            throw new Error(reason);
        }

        resetForm();
        sendBtn.textContent = "sent!";
        showNote("Thanks, your message was sent.");

        setTimeout(() => {
            sendBtn.textContent = "send message";
            sendBtn.disabled = false;
            showNote("");
        }, 4000);
    } catch (error) {
        showNote(
            error.name === "AbortError"
                ? "The request timed out. Please try again."
                : error.message || "Couldn't send. Please try again."
        );
        sendBtn.textContent = "send message";
        sendBtn.disabled = false;
    } finally {
        clearTimeout(timeout);
    }
});
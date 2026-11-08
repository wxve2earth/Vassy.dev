const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}

const SUPPORT_METHODS = [
    {
        type: "link",
        name: "PayPal",
        description: "Leave a tip",
        url: "https://paypal.com",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M239.9 359.9C236.4 379.1 222.5 468.6 218.4 493.9C218.1 495.7 217.4 496.4 215.4 496.4L140.8 496.4C133.2 496.4 127.7 489.8 128.7 482.5L187.3 110.6C188.8 101 197.4 93.7 207.3 93.7C359.6 93.7 372.4 90 411.3 105.1C471.4 128.4 476.9 184.6 455.3 245.4C433.8 308 382.8 334.9 315.2 335.7C271.8 336.4 245.7 328.7 239.9 359.9zM485.6 216C483.8 214.7 483.1 214.2 482.6 217.3C480.6 228.7 477.5 239.8 473.8 250.9C433.9 364.7 323.3 354.8 269.3 354.8C263.2 354.8 259.2 358.1 258.4 364.2C235.8 504.6 231.3 533.9 231.3 533.9C230.3 541 234.8 546.8 241.9 546.8L305.4 546.8C314 546.8 321.1 540.5 322.8 531.9C323.5 526.5 321.7 538 337.2 440.6C341.8 418.6 351.5 420.9 366.5 420.9C437.5 420.9 492.9 392.1 509.4 308.6C515.9 273.8 514 237.2 485.6 216z"/></svg>`
    },
    {
        type: "link",
        name: "Ko-fi",
        description: "Buy me a coffee",
        url: "https://ko-fi.com",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M313.8 139C403.6 139 426.8 140.1 460.1 143.4C538.2 151.2 583.7 199.4 583.7 268.6L583.7 277.5C583.7 341.8 536.6 394.4 472.9 399.9C467.9 416.5 460.1 433.1 449.6 449.8C425.2 487.5 376.5 535.1 286.7 535.1L269 535.1C195.9 535.1 139.3 503.5 105.5 445.9C75.6 395.5 71.7 339.5 71.7 264.7C71.7 191 116.1 151.1 168.1 144.5C207.4 139.5 256.2 139 313.8 139zM313.8 180.6C253.4 180.6 210.2 181.1 177.5 186.1C131.5 192.8 113.2 218.8 113.2 265.3L113.4 291C114.6 348.3 120.5 388.1 140.9 425.5C167.5 474.8 215.7 493.7 270.6 493.7L287.8 493.7C359.8 493.7 394.8 458.8 414.1 428.3C423.5 412.8 431.8 395.6 436.3 374L439.6 360.2L459.5 360.2C503.8 360.2 542.1 324.2 542.1 278.2L542.1 269.9C542.1 218.4 509.9 191.2 454 184.6C422.4 181.8 403.6 180.7 313.8 180.7zM331 233.2C369.2 233.2 395.8 264.8 395.8 300.2C395.8 332.9 377.5 361.2 353.7 383.3C338.7 398.8 314.4 413.8 297.8 423.8C293.4 426.6 287.8 428.2 281.1 428.2C275.6 428.2 270.6 426.5 265.6 423.8C249 413.8 224.6 398.3 209.1 383.3C187.3 362.5 169.9 336.4 167.8 306.3L167.6 300.2C167.6 264.7 193.1 233.2 231.9 233.2C254.6 233.2 270.7 244.8 281.2 260.9C292.8 244.8 308.4 233.2 331.1 233.2zM453.5 229.3C481.8 229.3 497.3 245.9 497.3 272.5C497.3 299.1 481.8 315.2 453.5 315.2C444.6 315.2 439.7 310.2 439.7 303.5L439.7 240.9C439.7 234.2 444.7 229.3 453.5 229.3z"/></svg>`
    },

    {
        type: "crypto",
        name: "Bitcoin",
        network: "BTC",
        address: "bc1pazgzlvpe2lxw2dgy9n9ehl0y7cnye5at5ukwjez4dkjmnfhqhrcq3dt3rq",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M438.4 306.6C466.1 292.4 483.8 267.2 479.7 225.3C474.3 167.9 427.2 148.7 364.9 143.4L364.9 64L316.4 64L316.4 141.2C303.8 141.2 290.9 141.5 278 141.8L278 64L229.5 64L229.5 143.4C211.7 143.9 190.9 143.7 132.1 143.4L132.1 195.1C170.4 194.4 190.5 192 195.1 216.5L195.1 433.9C192.2 453.4 176.6 450.6 141.8 450L132 507.7C220.5 507.7 229.4 508 229.4 508L229.4 576L277.9 576L277.9 508.9C291.1 509.2 304.1 509.2 316.3 509.2L316.3 575.9L364.8 575.9L364.8 507.9C446.1 503.5 500.4 483 507.7 406.4C513.4 345 484.4 317.5 438.4 306.5zM278.8 198.6C306.2 198.6 391.9 190.1 391.9 247.1C391.9 301.6 306.2 295.3 278.8 295.3L278.8 198.6zM278.8 450.4L278.8 343.9C311.6 343.9 411.9 334.8 411.9 397.2C411.9 457.4 311.5 450.5 278.8 450.5z"/></svg>`
    },
    {
        type: "crypto",
        name: "Ethereum",
        network: "ETH",
        address: "0xd3dc4c5a1fc9e6a93c5a444fc659f3e0b9bab77b",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M471.9 324.8L320 417.6L168 324.8L320 64L471.9 324.8zM320 447.4L168 354.6L320 576L472 354.6L320 447.4z"/></svg>`
    },
    {
        type: "crypto",
        name: "Solana",
        network: "SOL",
        address: "DiPegaiiftvuUGnbZVQNi7fYUx2xb28tX1CaPvTTvr6J",
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M574.5 449.2L489.6 537.9C487.8 539.8 485.5 541.4 483 542.4C480.5 543.4 477.8 544 475.1 544L72.9 544C71 544 69.1 543.5 67.5 542.4C65.9 541.3 64.6 539.9 63.9 538.2C63.2 536.5 62.9 534.6 63.2 532.7C63.5 530.8 64.4 529.1 65.7 527.8L150.6 439.1C152.4 437.2 154.7 435.6 157.1 434.6C159.5 433.6 162.2 433 164.9 433L567.3 433C569.2 433 571.1 433.5 572.7 434.6C574.3 435.7 575.6 437.1 576.3 438.8C577 440.5 577.3 442.4 577 444.3C576.7 446.2 575.8 447.9 574.5 449.2zM489.7 270.6C487.9 268.7 485.6 267.1 483.1 266.1C480.6 265.1 477.9 264.5 475.2 264.5L72.8 264.5C70.9 264.5 69 265 67.4 266.1C65.8 267.2 64.5 268.6 63.8 270.3C63.1 272 62.8 273.9 63.1 275.8C63.4 277.7 64.3 279.4 65.6 280.7L150.5 369.4C152.3 371.3 154.6 372.9 157 373.9C159.4 374.9 162.1 375.5 164.8 375.5L567.2 375.5C569.1 375.5 571 375 572.6 373.9C574.2 372.8 575.5 371.4 576.2 369.7C576.9 368 577.2 366.1 576.9 364.2C576.6 362.3 575.7 360.6 574.4 359.3L489.5 270.6zM72.9 206.9L475.3 206.9C478 206.9 480.7 206.4 483.2 205.3C485.7 204.2 487.9 202.7 489.8 200.8L574.7 112.1C576 110.7 576.9 109 577.2 107.2C577.5 105.4 577.3 103.5 576.5 101.7C575.7 99.9 574.5 98.5 572.9 97.5C571.3 96.5 569.4 95.9 567.5 95.9L165 96C162.3 96 159.6 96.5 157.2 97.6C154.8 98.7 152.5 100.2 150.7 102.1L65.7 190.8C64.4 192.2 63.5 193.9 63.2 195.7C62.9 197.5 63.1 199.4 63.9 201.2C64.7 203 65.9 204.4 67.5 205.4C69.1 206.4 71 207 72.9 207z"/></svg>`
    }
];

const SUPPORT_GROUPS = {
    link:   { label: "Donate", note: "PayPal and Ko-fi aren't available just yet, but I'll add them soon!" },
    crypto: { label: "Crypto", note: "Click on an address to copy it." }
};

(() => {
    const $ = (id) => document.getElementById(id);

    const ICON_ARROW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;
    const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
    const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

    const isSafeUrl = (value) => /^(https?:|mailto:)/i.test(value);

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {}

        const area = document.createElement("textarea");

        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.append(area);
        area.select();

        let ok = false;

        try { ok = document.execCommand("copy"); } catch {}

        area.remove();
        return ok;
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);

        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;

        return node;
    }

    function buildBadge(method) {
        const badge = el("span", "badge");

        if (method.iconSvg) {
            badge.innerHTML = method.iconSvg;
        } else if (method.icon) {
            const img = new Image();

            img.alt = "";
            img.src = method.icon;
            badge.append(img);
        } else {
            const fallback = method.symbol || method.name.slice(0, 2).toUpperCase();

            badge.textContent = fallback;
        }

        return badge;
    }

    function buildLink(method) {
        const card = el("a", "method");

        card.href = method.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";

        const top = el("span", "top");
        top.append(el("span", "name", method.name));

        const bottom = el("span", "bottom", method.description || "");

        const action = el("span", "action");
        action.innerHTML = ICON_ARROW;

        card.append(buildBadge(method), top, bottom, action);
        return card;
    }

    function buildCrypto(method) {
        const address = method.address.trim();
        const card = el("button", "method");

        card.type = "button";
        card.setAttribute("aria-label", `Copy ${method.name} address`);

        const top = el("span", "top");
        top.append(el("span", "name", method.name));
        if (method.network) top.append(el("span", "network", method.network));

        const bottom = el("span", "bottom mono", address);

        const action = el("span", "action");
        action.innerHTML = ICON_COPY;

        card.append(buildBadge(method), top, bottom, action);

        let timer = null;

        card.addEventListener("click", async () => {
            if (!(await copyText(address))) return;

            clearTimeout(timer);
            card.classList.add("copied");
            action.innerHTML = ICON_CHECK;
            card.setAttribute("aria-label", `${method.name} address copied`);

            timer = setTimeout(() => {
                card.classList.remove("copied");
                action.innerHTML = ICON_COPY;
                card.setAttribute("aria-label", `Copy ${method.name} address`);
            }, 1600);
        });

        return card;
    }

    const container = $("methods");
    let order = 0;

    Object.entries(SUPPORT_GROUPS).forEach(([type, group]) => {
        const methods = SUPPORT_METHODS.filter((method) => {
            if (method.type !== type) return false;
            if (type === "link") return method.url && isSafeUrl(method.url.trim());
            if (type === "crypto") return method.address && method.address.trim();

            return false;
        });

        if (!methods.length) return;

        const section = el("section", "group reveal");
        section.style.setProperty("--delay", `${(0.18 + order * 0.08).toFixed(2)}s`);
        order++;

        section.append(el("h2", "grouplabel", group.label));
        if (group.note) section.append(el("p", "groupnote", group.note));

        const list = el("ul", "methodlist");

        methods.forEach((method) => {
            const item = el("li");

            item.append(type === "link" ? buildLink(method) : buildCrypto(method));
            list.append(item);
        });

        section.append(list);
        container.append(section);
    });

    $("footnote").style.setProperty("--delay", `${(0.26 + order * 0.08).toFixed(2)}s`);
})();
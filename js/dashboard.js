const DASHBOARD = {
    discordUserId: "1263841243839070229",
    discordInvite: "2KBxTeQDTK",
    githubUser: "wxve2earth",
    weeks: 52,
    livecord: { host: "localhost:5000", secure: false }
};

(() => {
    const $ = (id) => document.getElementById(id);
    const fmt = (n) => Number(n).toLocaleString("en");

    async function getJSON(url, { cacheMinutes = 0 } = {}) {
        const key = `dash:${url}`;

        if (cacheMinutes) {
            try {
                const cached = JSON.parse(localStorage.getItem(key));
                if (cached && Date.now() - cached.time < cacheMinutes * 60000) return cached.data;
            } catch {}
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(response.status);
            const data = await response.json();

            if (cacheMinutes) {
                try { localStorage.setItem(key, JSON.stringify({ time: Date.now(), data })); } catch {}
            }

            return data;
        } finally {
            clearTimeout(timer);
        }
    }

    function setImage(container, url) {
        if (!container) return;
        if ((container.dataset.src || "") === (url || "")) return;

        container.dataset.src = url || "";
        container.querySelector("img")?.remove();

        if (!url) return;

        const img = new Image();
        img.alt = "";
        img.onload = () => {
            if (container.dataset.src === url) container.prepend(img);
        };
        img.src = url;
    }

    let spotifyTimes = null;
    let currentTrackId = null;

    function formatTime(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
    }

    function setBar(percent, instant = false) {
        const bar = $("spotifyBar");

        if (instant) bar.style.transition = "none";
        bar.style.width = `${percent}%`;

        if (instant) {
            void bar.offsetWidth;
            bar.style.transition = "";
        }
    }

    function tickProgress() {
        if (!spotifyTimes) return;

        const duration = spotifyTimes.end - spotifyTimes.start;
        const elapsed = Math.min(Math.max(Date.now() - spotifyTimes.start, 0), duration);

        $("spotifyElapsed").textContent = formatTime(elapsed);
        setBar(duration > 0 ? (elapsed / duration) * 100 : 0);
    }

    function renderSpotify(track) {
        $("spotifySection").hidden = !track;
        const title = $("spotifyTitle");

        if (track) {
            const artists = Array.isArray(track.artists) && track.artists.length
                ? track.artists.join(", ")
                : track.artist;

            title.textContent = track.song;
            $("spotifyArtist").textContent = artists;
            setImage($("spotifyCover"), track.album_art_url);

            const url = track.track_url || (track.track_id ? `https://open.spotify.com/track/${track.track_id}` : "");
            if (url) title.href = url;
            else title.removeAttribute("href");

            const { start, end } = track.timestamps || {};
            spotifyTimes = start && end ? { start, end } : null;

            if (track.track_id !== currentTrackId) {
                currentTrackId = track.track_id;
                setBar(0, true);
            }

            $("spotifyDuration").textContent = spotifyTimes ? formatTime(end - start) : "0:00";
            tickProgress();
        } else {
            title.textContent = "Nothing playing";
            $("spotifyArtist").textContent = "Spotify activity will appear here";
            setImage($("spotifyCover"), null);
            title.removeAttribute("href");

            spotifyTimes = null;
            currentTrackId = null;
            $("spotifyElapsed").textContent = "0:00";
            $("spotifyDuration").textContent = "0:00";
            setBar(0, true);
        }
    }

    setInterval(tickProgress, 1000);

    /* ---------- profile (name, handle, picture) ---------- */

    const PROFILE_KEY = "dash:profile";

    let presence = null;
    let gotLiveData = false;       // true while Livecord is sending data
    let livecordFailed = false;    // true once Livecord couldn't be reached
    let inviterProfile = null;     // your profile from Discord's official invite API

    function showProfile({ name, handle, avatar }) {
        $("discordName").textContent = name;
        $("discordHandle").textContent = handle;
        setImage($("discordAvatar"), avatar || null);
    }

    function cachedProfile() {
        try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; }
    }

    function saveProfile(profile) {
        try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
    }

    function renderPresence(data) {
        if (!data || !data.discord_user) return;

        presence = data;
        livecordFailed = false;

        const user = data.discord_user;
        const profile = {
            name: user.global_name || user.display_name || user.username,
            handle: `@${user.username}`,
            avatar: user.avatar_url || null
        };

        showProfile(profile);
        saveProfile(profile);

        $("discordStatus").hidden = false;
        $("discordStatus").dataset.status = data.discord_status || "offline";

        renderSpotify(data.listening_to_spotify ? data.spotify : null);
    }

    function clearPresence() {
        presence = null;
        $("discordStatus").dataset.status = "offline";
        renderSpotify(null);
    }

    /* Livecord can't be reached: hide Spotify and the status badge, and keep the profile
       filled in from Discord's official invite API (or the last profile we saved) */
    function livecordDown() {
        if (gotLiveData) return;

        livecordFailed = true;

        renderSpotify(null);
        $("discordStatus").hidden = false;
        $("discordStatus").dataset.status = "offline";

        const profile = inviterProfile || cachedProfile();
        if (profile) showProfile(profile);
    }

    function extractState(d) {
        if (!d) return null;
        if (d.discord_user) return d;
        if (d.data && d.data.discord_user) return d.data;
        if (d[DASHBOARD.discordUserId] && d[DASHBOARD.discordUserId].discord_user) return d[DASHBOARD.discordUserId];
        return null;
    }

    function handleState(d) {
        const full = extractState(d);

        if (full) renderPresence(full);
        else if (d && presence) renderPresence({ ...presence, ...d });
    }

    /* ---------- livecord connection ---------- */

    const LC = DASHBOARD.livecord;
    const LC_HTTP = `${LC.secure ? "https" : "http"}://${LC.host}`;
    const LC_WS = `${LC.secure ? "wss" : "ws"}://${LC.host}/socket`;

    let socket = null;
    let heartbeat = null;
    let retryTimer = null;
    let retryDelay = 1000;
    let restTried = false;         // the one-off request is only tried once while Livecord is down

    async function loadPresenceOnce() {
        try {
            const json = await getJSON(`${LC_HTTP}/v1/users/${DASHBOARD.discordUserId}`);

            if (gotLiveData) return;

            if (json.success) renderPresence(json.data);
            else livecordDown();
        } catch {
            livecordDown();
        }
    }

    function scheduleReconnect() {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(connectLivecord, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 60000);
    }

    function connectLivecord() {
        clearTimeout(retryTimer);

        let ws;

        try {
            ws = new WebSocket(LC_WS);
        } catch {
            livecordDown();
            scheduleReconnect();
            return;
        }

        socket = ws;

        ws.onmessage = (event) => {
            let msg;

            try { msg = JSON.parse(event.data); } catch { return; }

            if (msg.op === 1) {
                ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DASHBOARD.discordUserId } }));

                clearInterval(heartbeat);
                heartbeat = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
                }, msg.d.heartbeat_interval);

                retryDelay = 1000;
                return;
            }

            if (msg.op === 0) {
                gotLiveData = true;
                restTried = false;

                if (msg.t === "USER_REMOVED") clearPresence();
                else handleState(msg.d);
            }
        };

        ws.onclose = () => {
            clearInterval(heartbeat);

            if (socket !== ws) return;

            gotLiveData = false;

            if (!restTried) {
                restTried = true;
                loadPresenceOnce();
            } else {
                livecordDown();
            }

            scheduleReconnect();
        };

        ws.onerror = () => ws.close();
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && (!socket || socket.readyState > WebSocket.OPEN)) {
            retryDelay = 1000;
            connectLivecord();
        }
    });

    /* ---------- github ---------- */

    function toKey(date) {
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${date.getFullYear()}-${m}-${d}`;
    }

    let graphWeeks = DASHBOARD.weeks = 52;
    let githubContributions = [];

    function renderGraph(days = githubContributions) {
        const graph = $("dashGraph");
        const months = $("dashMonths");
        const weeks = graphWeeks;
        const byDate = new Map(days.map((day) => [day.date, day]));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() - (weeks - 1) * 7);

        graph.style.gridTemplateColumns = `repeat(${weeks}, 1fr)`;
        if (months) months.style.gridTemplateColumns = `repeat(${weeks}, 1fr)`;

        const cells = document.createDocumentFragment();
        const monthGroups = [];

        for (let week = 0; week < weeks; week++) {
            const weekStart = new Date(start);
            weekStart.setDate(start.getDate() + week * 7);

            const key = `${weekStart.getFullYear()}-${weekStart.getMonth()}`;
            const lastGroup = monthGroups[monthGroups.length - 1];

            if (lastGroup && lastGroup.key === key) {
                lastGroup.last = week;
            } else {
                monthGroups.push({ key, date: weekStart, first: week, last: week });
            }

            for (let day = 0; day < 7; day++) {
                const date = new Date(weekStart);
                date.setDate(weekStart.getDate() + day);

                const cell = document.createElement("span");
                cell.className = "dashcell";

                if (date > today) {
                    cell.classList.add("empty");
                } else {
                    const contribution = byDate.get(toKey(date));
                    const count = contribution ? contribution.count : 0;
                    const formattedDate = date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                    });

                    cell.dataset.level = contribution ? contribution.level : 0;
                    cell.dataset.tooltip = `${fmt(count)} contribution${count === 1 ? "" : "s"}\n${formattedDate}`;
                }

                cells.append(cell);
            }
        }

        graph.replaceChildren(cells);

        if (months) {
            const labels = document.createDocumentFragment();

            monthGroups.forEach((group) => {
                if (group.last - group.first < 1) return;

                const label = document.createElement("span");
                label.className = "dashmonth";
                label.textContent = group.date.toLocaleString("en", { month: "short" });
                label.style.gridColumn = `${group.first + 1} / ${group.last + 2}`;

                labels.append(label);
            });

            months.replaceChildren(labels);
        }
    }

    async function loadGithub() {
        const login = DASHBOARD.githubUser;

        try {
            const profile = await getJSON(`https://api.github.com/users/${login}`, { cacheMinutes: 15 });

            $("githubName").textContent = profile.name || profile.login;
            $("githubHandle").textContent = `@${profile.login}`;
            $("statRepos").textContent = fmt(profile.public_repos);
            $("statFollowers").textContent = fmt(profile.followers);
            $("statFollowing").textContent = fmt(profile.following);
            setImage($("githubAvatar"), `${profile.avatar_url}&s=128`);
        } catch {}

        try {
            const repos = await getJSON(`https://api.github.com/users/${login}/repos?per_page=100&type=owner`, { cacheMinutes: 15 });
            const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

            $("statStars").textContent = fmt(stars);
        } catch {}

        try {
            const data = await getJSON(`https://github-contributions-api.jogruber.de/v4/${login}?y=last`, { cacheMinutes: 60 });

            if (Array.isArray(data.contributions)) {
                githubContributions = data.contributions;
                renderGraph();
            }
        } catch {}
    }

    /* ---------- discord server (and your profile as a fallback) ---------- */

    async function loadServer() {
        try {
            const invite = await getJSON(
                `https://discord.com/api/v9/invites/${DASHBOARD.discordInvite}?with_counts=true`,
                { cacheMinutes: 10 }
            );

            const guild = invite.guild;

            $("serverName").textContent = guild.name;
            $("serverMembers").textContent =
                `${fmt(invite.approximate_member_count)} members`;

            $("serverOnline").querySelector("span:last-child").textContent =
                `${fmt(invite.approximate_presence_count)} online`;

            const initial = $("serverIcon").querySelector(".dashinitial");
            if (initial) {
                initial.textContent = guild.name.charAt(0).toUpperCase();
            }

            if (guild.icon) {
                setImage(
                    $("serverIcon"),
                    `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                );
            }

            // the invite also says who created it, which gives us your profile from the official API
            const inviter = invite.inviter;

            if (inviter && inviter.id === DASHBOARD.discordUserId) {
                inviterProfile = {
                    name: inviter.global_name || inviter.username,
                    handle: `@${inviter.username}`,
                    avatar: inviter.avatar
                        ? `https://cdn.discordapp.com/avatars/${inviter.id}/${inviter.avatar}.png?size=256`
                        : null
                };

                if (livecordFailed) {
                    showProfile(inviterProfile);
                    saveProfile(inviterProfile);
                }
            }
        } catch (error) {
            console.error("Failed to load Discord server:", error);
        }
    }

    document.querySelectorAll(".graph-range-option").forEach(option => {
        option.addEventListener("click", () => {
            graphWeeks = Number(option.dataset.value);

            document.querySelectorAll(".graph-range-option").forEach(item => {
                item.classList.toggle("active", item === option);
            });

            renderGraph();
        });
    });

    renderGraph();
    loadPresenceOnce();
    connectLivecord();
    loadGithub();
    loadServer();
})();
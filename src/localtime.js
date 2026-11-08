const clock = document.getElementById("timezonedata");

function updateTime() {
    const now = new Date();

    const time12 = new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Prague",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(now);

    const time24 = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Prague",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(now);

    clock.textContent = `${time12} / ${time24}`;
}

updateTime();
setInterval(updateTime, 1000);
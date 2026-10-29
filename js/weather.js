const weather = document.getElementById("weatherdata");

async function updateWeather() {
    try {
        const response = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=50.0755&longitude=14.4378&current=temperature_2m&timezone=Europe%2FPrague"
        );

        if (!response.ok) throw new Error("Weather request failed");

        const data = await response.json();
        const celsius = data.current.temperature_2m;
        const fahrenheit = (celsius * 9 / 5) + 32;

        weather.textContent =
            `${Math.round(celsius)}°C / ${Math.round(fahrenheit)}°F`;
    } catch (error) {
        weather.textContent = "Weather unavailable";
        console.error("Could not load weather:", error);
    }
}

updateWeather();
setInterval(updateWeather, 10 * 60 * 1000);
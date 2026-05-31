document.addEventListener("DOMContentLoaded", () => {
  const weatherCard = document.querySelector("[data-weather-card]");
  if (!weatherCard) {
    return;
  }

  const weatherTemp = document.getElementById("weather-temp");
  const weatherHumidity = document.getElementById("weather-humidity");
  const weatherDesc = document.getElementById("weather-desc");
  const weatherWind = document.getElementById("weather-wind");
  const weatherStatus = document.getElementById("weather-status");

  const weatherCodeMap = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail"
  };

  const endpoint =
    "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata";

  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Weather request failed.");
      }
      return response.json();
    })
    .then((data) => {
      const current = data.current;
      const description = weatherCodeMap[current.weather_code] || "Weather update ready";

      weatherTemp.textContent = `${Math.round(current.temperature_2m)} C`;
      weatherHumidity.textContent = `${current.relative_humidity_2m}%`;
      weatherDesc.textContent = description;
      weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      weatherStatus.textContent = "Fresh conditions for New Delhi.";
    })
    .catch(() => {
      weatherStatus.textContent = "Weather service is unavailable right now.";
      weatherTemp.textContent = "--";
      weatherHumidity.textContent = "--";
      weatherDesc.textContent = "Check back soon";
      weatherWind.textContent = "--";
    });
});

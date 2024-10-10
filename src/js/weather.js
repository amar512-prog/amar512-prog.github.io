document.addEventListener("DOMContentLoaded", function () {
// Make an HTTP GET request to the OpenWeatherMap API
fetch('https://api.openweathermap.org/data/2.5/weather?q=New%20Delhi&appid=565f792c8c70e572d7f3fa7d03ff7c57')
  .then(response => response.json())
  .then(data => {
    // Extract the weather information from the response
    const weather = data.weather[0];
    const temperature = data.main.temp;
    const humidity = data.main.humidity;

    // Print the weather information
    console.log(`Today's weather in New Delhi, India: ${weather.description}`);
    console.log(`Temperature: ${temperature} K`);
    console.log(`Humidity: ${humidity}%`);
    // Update the weather information on the webpage
    document.getElementById('temp-value').textContent = temperature;
    document.getElementById('humidity-value').textContent = humidity;
    document.getElementById('weather-desc-value').textContent = weather.description;

    // Set the appropriate weather icon based on the weather condition
    const weatherIcon = document.getElementById('weather-description').querySelector('i');
    switch (weather.main) {
      case 'Clear':
        weatherIcon.classList.add('fas', 'fa-sun');
        break;
      case 'Clouds':
        weatherIcon.classList.add('fas', 'fa-cloud');
        break;
      case 'Rain':
        weatherIcon.classList.add('fas', 'fa-cloud-rain');
        break;
      case 'Snow':
        weatherIcon.classList.add('fas', 'fa-snowflake');
        break;
      default:
        weatherIcon.classList.add('fas', 'fa-cloud');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
});

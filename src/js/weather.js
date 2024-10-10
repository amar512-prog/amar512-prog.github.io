// Make an HTTP GET request to the OpenWeatherMap API
fetch('https://api.openweathermap.org/data/2.5/weather?q=New%20Delhi&appid=6557810176c36fac5f0db536711a6c52')
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
  })
  .catch(error => {
    console.error('Error:', error);
  });

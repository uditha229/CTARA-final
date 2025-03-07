// Weather App with Crop Recommendations JavaScript
const cityInput = document.getElementById('city_input');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const temp = document.getElementById('temp');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const dateElement = document.getElementById('date');
const locationElement = document.getElementById('location');
const recommendationText = document.getElementById('recommendation-text');
const actionList = document.getElementById('action-list');
const forecastContainer = document.getElementById('forecast-container');

// Weather API key (you would need to get your own)
const API_KEY = "727e4a0e9968828520e75d32cd3c9d41";

// Current date
const currentDate = new Date();
dateElement.textContent = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
});

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                alert("Unable to get your location: " + error.message);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

// Get weather data by city name
function getWeatherData(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            getForecastData(city);
        })
        .catch(error => {
            alert(error.message);
        });
}

// Get weather data by coordinates
function getWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherData(data);
            getForecastData(null, lat, lon);
        })
        .catch(error => {
            alert("Error fetching weather data");
        });
}

// Get forecast data
function getForecastData(city, lat, lon) {
    let url;
    if (city) {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayForecastData(data);
        })
        .catch(error => {
            console.error("Error fetching forecast data", error);
        });
}

// Display current weather
function displayWeatherData(data) {
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    
    // Generate crop recommendations based on weather
    generateCropRecommendations(data);
}

// Display forecast data
function displayForecastData(data) {
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (noon)
    const dailyForecasts = data.list.filter((forecast, index) => index % 8 === 0);
    
    // Display up to 5 days
    dailyForecasts.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${day}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather icon">
            <p>${temp}°C</p>
            <p>${forecast.weather[0].description}</p>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Generate crop recommendations based on weather
function generateCropRecommendations(weatherData) {
    const temp = weatherData.main.temp;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const windSpeed = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    
    let recommendation = '';
    let actions = [];
    
    // Temperature-based recommendations
    if (temp < 5) {
        recommendation = "Cold temperatures detected. Your crops may be at risk of frost damage.";
        actions.push("Cover sensitive crops with frost blankets");
        actions.push("Delay any planned seeding until temperatures rise");
        actions.push("Check irrigation systems for freezing");
    } else if (temp >= 5 && temp < 15) {
        recommendation = "Cool temperatures are good for cool-season crops like lettuce, spinach, and peas.";
        actions.push("Continue normal irrigation for established crops");
        actions.push("Consider planting cool-weather crops");
        actions.push("Apply mulch to regulate soil temperature");
    } else if (temp >= 15 && temp < 25) {
        recommendation = "Ideal temperature range for many crops. Good growing conditions.";
        actions.push("Maintain regular watering schedule");
        actions.push("Good time for fertilizer application if needed");
        actions.push("Monitor for pests which become active in this temperature range");
    } else if (temp >= 25 && temp < 32) {
        recommendation = "Warm temperatures. Watch for signs of heat stress in sensitive crops.";
        actions.push("Increase watering frequency");
        actions.push("Consider shade cloth for sensitive crops");
        actions.push("Water in the early morning or evening to reduce evaporation");
    } else {
        recommendation = "Very hot temperatures. High risk of heat stress to most crops.";
        actions.push("Increase irrigation frequency significantly");
        actions.push("Apply mulch to retain soil moisture");
        actions.push("Provide shade for heat-sensitive crops");
        actions.push("Avoid fertilizer application until temperatures cool");
    }
    
    // Weather condition based recommendations
    if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
        recommendation += " Rainfall detected. Adjust irrigation accordingly.";
        actions.push("Reduce or pause irrigation systems");
        actions.push("Check fields for proper drainage");
        actions.push("Delay fertilizer application to prevent runoff");
        
        if (weatherCondition.includes('heavy') || weatherCondition.includes('thunderstorm')) {
            recommendation += " Heavy rain may cause soil erosion and nutrient leaching.";
            actions.push("Monitor fields for standing water");
            actions.push("Check for erosion damage once safe to do so");
        }
    } else if (weatherCondition.includes('clear') || weatherCondition.includes('sun')) {
        if (temp > 25) {
            actions.push("Consider additional irrigation in sunny conditions");
        }
    } else if (weatherCondition.includes('cloud')) {
        recommendation += " Cloudy conditions can reduce photosynthesis but help retain soil moisture.";
    } else if (weatherCondition.includes('snow')) {
        recommendation = "Snowfall detected. Crops should be dormant or protected.";
        actions.push("Check protection systems for winter crops");
        actions.push("Ensure greenhouse heating systems are functioning");
    }
    
    // Wind considerations
    if (windSpeed > 8) {
        recommendation += " High winds detected which may damage crops or increase water loss.";
        actions.push("Check support structures for tall crops");
        actions.push("Consider temporary windbreaks if possible");
        actions.push("Increase irrigation to compensate for increased evaporation");
    }
    
    // Humidity considerations
    if (humidity > 85) {
        recommendation += " High humidity may increase disease pressure.";
        actions.push("Monitor for fungal diseases");
        actions.push("Ensure adequate spacing between plants for air circulation");
        actions.push("Consider preventative fungicide application for susceptible crops");
    } else if (humidity < 30 && temp > 25) {
        recommendation += " Low humidity combined with high temperatures may cause rapid water loss.";
        actions.push("Increase irrigation frequency");
        actions.push("Consider misting for humidity-loving crops");
    }
    
    // Update the UI
    recommendationText.textContent = recommendation;
    
    // Clear previous actions
    actionList.innerHTML = '';
    
    // Add new actions
    actions.forEach(action => {
        const li = document.createElement('li');
        li.textContent = action;
        actionList.appendChild(li);
    });
}
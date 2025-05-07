// API key for OpenWeatherMap - You need to get your own API key from https://openweathermap.org/
const API_KEY = '2adc72b8e669d08296641c62d13db886';


// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentTemp = document.getElementById('current-temp');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const forecastContainer = document.getElementById('forecast-container');

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

locationBtn.addEventListener('click', getLocationWeather);

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// Initialize with default city
getWeatherData('London');

// Functions
async function getWeatherData(city) {
    try {
        // Get current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();
        
        // Get forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();
        
        displayWeather(currentData, forecastData);
    } catch (error) {
        alert(error.message);
        console.error('Error fetching weather data:', error);
    }
}

function displayWeather(currentData, forecastData) {
    // Display current weather
    cityName.textContent = `${currentData.name}, ${currentData.sys.country}`;
    currentTemp.textContent = Math.round(currentData.main.temp);
    weatherDescription.textContent = currentData.weather[0].description;
    humidity.textContent = currentData.main.humidity;
    wind.textContent = Math.round(currentData.wind.speed * 3.6); // Convert m/s to km/h
    
    // Set weather icon
    const iconCode = currentData.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = currentData.weather[0].description;
    
    // Display forecast
    displayForecast(forecastData);
}

function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';
    
    // We'll show one forecast per day (at 12:00 PM)
    const dailyForecasts = forecastData.list.filter(item => {
        return item.dt_txt.includes('12:00:00');
    });
    
    // Limit to 5 days
    const forecastsToShow = dailyForecasts.slice(0, 5);
    
    forecastsToShow.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <div class="forecast-temp">
                <span class="temp-max">${Math.round(forecast.main.temp_max)}°</span>
                <span class="temp-min">${Math.round(forecast.main.temp_min)}°</span>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Get current weather by coordinates
                    const currentResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                    );
                    
                    if (!currentResponse.ok) {
                        throw new Error('Location not found');
                    }
                    
                    const currentData = await currentResponse.json();
                    
                    // Get forecast by coordinates
                    const forecastResponse = await fetch(
                        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
                    );
                    const forecastData = await forecastResponse.json();
                    
                    displayWeather(currentData, forecastData);
                    cityInput.value = currentData.name;
                } catch (error) {
                    alert(error.message);
                    console.error('Error fetching weather data:', error);
                }
            },
            (error) => {
                alert('Geolocation error: ' + error.message);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}
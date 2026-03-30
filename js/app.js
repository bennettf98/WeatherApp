const locationSearch = document.getElementById('searchbar');
const forecastContainer = document.querySelector('.forecast-container');
const forecastTitle = document.querySelector('.forecast-title');
// Reads searchbar input and HTML elements of 5-day forecast header and forecast card container //

function showMessage(message) {
    forecastTitle.classList.remove('forecast-hidden');
    forecastContainer.classList.remove('forecast-hidden');
    forecastContainer.innerHTML = `<p class="forecast-message">${message}</p>`;
}
// Reveals 5-day forecast header and forecast container and displays message subsequent to user input in searchbar //

function resetApp() {
    locationSearch.value = '';
    forecastContainer.innerHTML = '';
    forecastTitle.classList.add('forecast-hidden');
    forecastContainer.classList.add('forecast-hidden');
    locationSearch.focus();
}
// Provides function to reset button, removes 5-day forecast header and forecast container to reset page to default //

function getLocationDetails(place) {
    if (place.admin1 && place.country) {
        return `${place.admin1}, ${place.country}`;
    }

    if (place.country) {
        return place.country;
    }

    if (place.admin1) {
        return place.admin1;
    }

    return 'Location found';
}
// Retrieves location information based on user search and Open-Meteo information //

function renderForecast(locationName, locationDetails, dailyData) {
    const dates = dailyData.time;
    const highTemps = dailyData.temperature_2m_max;
    const lowTemps = dailyData.temperature_2m_min;
    const rainChances = dailyData.precipitation_probability_max;
    const weatherCodes = dailyData.weather_code;
    let forecastHtml = `
        <div class="forecast-header">
            <h2>${locationName}</h2>
            <p>${locationDetails}</p>
        </div>
        <div class="forecast-grid">
    `;
// Retrieves the forecast information of searched location and places subsequent HTML elements into cards inside container //

    for (let i = 0; i < dates.length; i += 1) {
        const date = dates[i];
        const high = Math.round(highTemps[i]);
        const low = Math.round(lowTemps[i]);
        const rainChance = rainChances[i];
        const weatherCode = weatherCodes[i];
        const weatherLabel = getWeatherLabel(weatherCode);
        const weatherImage = getWeatherImage(weatherCode);
        const weatherTheme = getForecastCardTheme(weatherCode);
// Converts Open-Meteo weather data into readable information and retrieves weather type labels, images, and backgrounds for forecast cardsbased on that day's weather //

        forecastHtml += `
            <article class="forecast-card ${weatherTheme}">
                <div class="forecast-card-content">
                    <div class="forecast-card-text">
                        <h3>${formatDate(date)}</h3>
                        <p class="forecast-summary">${weatherLabel}</p>
                        <p>High: ${high}°F</p>
                        <p>Low: ${low}°F</p>
                        <p>Rain chance: ${rainChance}%</p>
                    </div>
                    <img class="forecast-icon" src="${weatherImage}" alt="${weatherLabel}">
                </div>
            </article>
        `;
    }
    forecastHtml += '</div>';
    forecastContainer.innerHTML = forecastHtml;
}
// HTML elements to showcase information inside forecast cards such as dates, precipitation, temperatures, and subsequent images and backgrounds dependent on weather //

async function getWeather() {
    const city = locationSearch.value.trim();

    if (!city) {
        showMessage('Please type a city, state, or country above to view the 5-day forecast.');
        return;
    }

    const searchParts = splitLocationSearch(city);

    if (!searchParts.cityName) {
        showMessage('Please type a city name before the state or country.');
        return;
    }

    if (city.includes(',') && !searchParts.regionName) {
        showMessage('No results, please remove comma or add a state or country after.');
        return;
    }
    showMessage('Loading forecast...');

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchParts.cityName)}&count=10&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error('Geocoding request failed.');
        }

        const geoData = await geoResponse.json();
        const results = geoData.results;

        if (!results || results.length === 0) {
            showMessage('No locations found. Please search for any city, state, or country above.');
            return;
        }

        const place = findBestPlace(results, city);

        if (!place) {
            showMessage('Your location did not match any city, state, or country. Please try again.');
            return;
        }

        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=5`;
        const forecastResponse = await fetch(forecastUrl);

        if (!forecastResponse.ok) {
            throw new Error('Forecast request failed.');
        }

        const forecastData = await forecastResponse.json();
        const locationDetails = getLocationDetails(place);

        renderForecast(place.name, locationDetails, forecastData.daily);
    } catch (error) {
        showMessage('Something went wrong while loading the forecast.');
        console.error(error);
    }
}
// Returned responses inside forecast container if location search provides no results for different reasons //

locationSearch.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') {
        return;
    }

    getWeather();
});
// Reveals forecast card even when pressing enter button with empty search, will prompt user to search a location //
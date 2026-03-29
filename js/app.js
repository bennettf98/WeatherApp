const locationSearch = document.getElementById('searchbar');
const forecastContainer = document.querySelector('.forecast-container');
const forecastTitle = document.querySelector('.forecast-title');

function showMessage(message) {
    forecastTitle.classList.remove('forecast-hidden');
    forecastContainer.classList.remove('forecast-hidden');
    forecastContainer.innerHTML = `<p class="forecast-message">${message}</p>`;
}

function resetApp() {
    locationSearch.value = '';
    forecastContainer.innerHTML = '';
    forecastTitle.classList.add('forecast-hidden');
    forecastContainer.classList.add('forecast-hidden');
    locationSearch.focus();
}

function renderForecast(locationName, locationDetails, dailyData) {
    let forecastHtml = `
        <div class="forecast-header">
            <h2>${locationName}</h2>
            <p>${locationDetails}</p>
        </div>
        <div class="forecast-grid">
    `;

    for (let i = 0; i < dailyData.time.length; i += 1) {
        const date = dailyData.time[i];
        const high = Math.round(dailyData.temperature_2m_max[i]);
        const low = Math.round(dailyData.temperature_2m_min[i]);
        const rainChance = dailyData.precipitation_probability_max[i];
        const weatherCode = dailyData.weather_code[i];
        const weatherLabel = getWeatherLabel(weatherCode);
        const weatherImage = getWeatherImage(weatherCode);
        const weatherTheme = getForecastCardTheme(weatherCode);

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

async function getWeather() {
    const city = locationSearch.value.trim();
    const searchParts = splitLocationSearch(city);

    if (!city) {
        showMessage('Please type a city, state, or country above to view the 5-day forecast.');
        return;
    }

    if (!searchParts.cityName) {
        showMessage('Please type a city name before the state or country.');
        return;
    }

    if (city.indexOf(',') !== -1 && !searchParts.regionName) {
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

        if (!geoData.results || geoData.results.length === 0) {
            showMessage('No locations found. Please search for any city, state, or country above.');
            return;
        }

        const place = findBestPlace(geoData.results, city);

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
        let locationDetails = '';

        if (place.admin1 && place.country) {
            locationDetails = `${place.admin1}, ${place.country}`;
        } else if (place.country) {
            locationDetails = place.country;
        } else if (place.admin1) {
            locationDetails = place.admin1;
        } else {
            locationDetails = 'Location found';
        }

        renderForecast(place.name, locationDetails, forecastData.daily);
    } catch (error) {
        showMessage('Something went wrong while loading the forecast.');
        console.error(error);
    }
}

locationSearch.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});
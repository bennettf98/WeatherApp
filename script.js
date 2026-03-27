const locationSearch = document.getElementById('searchbar');
const forecastContainer = document.querySelector('.forecast-container');
const forecastTitle = document.querySelector('.forecast-title');
const stateAbbreviations = {
    al: 'alabama',
    ak: 'alaska',
    az: 'arizona',
    ar: 'arkansas',
    ca: 'california',
    co: 'colorado',
    ct: 'connecticut',
    de: 'delaware',
    fl: 'florida',
    ga: 'georgia',
    hi: 'hawaii',
    id: 'idaho',
    il: 'illinois',
    in: 'indiana',
    ia: 'iowa',
    ks: 'kansas',
    ky: 'kentucky',
    la: 'louisiana',
    me: 'maine',
    md: 'maryland',
    ma: 'massachusetts',
    mi: 'michigan',
    mn: 'minnesota',
    ms: 'mississippi',
    mo: 'missouri',
    mt: 'montana',
    ne: 'nebraska',
    nv: 'nevada',
    nh: 'new hampshire',
    nj: 'new jersey',
    nm: 'new mexico',
    ny: 'new york',
    nc: 'north carolina',
    nd: 'north dakota',
    oh: 'ohio',
    ok: 'oklahoma',
    or: 'oregon',
    pa: 'pennsylvania',
    ri: 'rhode island',
    sc: 'south carolina',
    sd: 'south dakota',
    tn: 'tennessee',
    tx: 'texas',
    ut: 'utah',
    vt: 'vermont',
    va: 'virginia',
    wa: 'washington',
    wv: 'west virginia',
    wi: 'wisconsin',
    wy: 'wyoming'
};

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

function formatDate(dateText) {
    const date = new Date(`${dateText}T12:00:00`);

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function getWeatherLabel(weatherCode) {
    switch (weatherCode) {
        case 0:
            return 'Clear sky';
        case 1:
            return 'Mostly clear';
        case 2:
            return 'Partly cloudy';
        case 3:
            return 'Overcast';
        case 45:
        case 48:
            return 'Foggy';
        case 51:
            return 'Light drizzle';
        case 53:
            return 'Drizzle';
        case 55:
            return 'Heavy drizzle';
        case 61:
            return 'Light rain';
        case 63:
            return 'Rain';
        case 65:
            return 'Heavy rain';
        case 71:
            return 'Light snow';
        case 73:
            return 'Snow';
        case 75:
            return 'Heavy snow';
        case 80:
            return 'Rain showers';
        case 81:
            return 'Heavy showers';
        case 82:
            return 'Strong showers';
        case 95:
            return 'Thunderstorm';
        default:
            return 'Weather unavailable';
    }
}

function getWeatherImage(weatherCode) {
    switch (weatherCode) {
        case 0:
        case 1:
            return 'images/sun.png';
        case 2:
        case 3:
        case 45:
        case 48:
            return 'images/cloud.png';
        case 51:
        case 53:
        case 55:
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return 'images/raincloud.png';
        case 71:
        case 73:
        case 75:
            return 'images/snowcloud.png';
        case 95:
            return 'images/thundercloud.png';
        default:
            return 'images/frown.png';
    }
}

function cleanText(text) {
    return text.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
}

function findStateRegion(searchText) {
    const cleanedSearch = cleanText(searchText);
    const words = cleanedSearch.split(' ');
    const stateNames = Object.values(stateAbbreviations);

    if (words.length < 2) {
        return null;
    }

    for (let length = 3; length >= 1; length -= 1) {
        if (words.length <= length) {
            continue;
        }

        const regionCandidate = words.slice(words.length - length).join(' ');
        const cityCandidate = words.slice(0, words.length - length).join(' ');

        if (stateAbbreviations[regionCandidate] || stateNames.indexOf(regionCandidate) !== -1) {
            return {
                cityName: cityCandidate,
                regionName: regionCandidate
            };
        }
    }

    return null;
}

function splitLocationSearch(searchText) {
    const parts = searchText.split(',');
    const cityName = parts[0].trim();
    let regionName = '';

    if (parts.length > 1) {
        regionName = parts.slice(1).join(',').trim();
    } else {
        const stateRegion = findStateRegion(searchText);

        if (stateRegion) {
            return stateRegion;
        }
    }

    return {
        cityName: cityName,
        regionName: regionName
    };
}

function getRegionNames(regionText) {
    const rawRegion = cleanText(regionText);
    const fullStateName = stateAbbreviations[rawRegion] || '';

    return {
        rawRegion: rawRegion,
        fullStateName: fullStateName
    };
}

function regionMatches(place, regionText) {
    const regionInfo = getRegionNames(regionText);
    const admin1 = cleanText(place.admin1 || '');
    const country = cleanText(place.country || '');
    const countryCode = cleanText(place.country_code || '');

    if (!regionInfo.rawRegion) {
        return true;
    }

    if (admin1 === regionInfo.rawRegion || country === regionInfo.rawRegion || countryCode === regionInfo.rawRegion) {
        return true;
    }

    if (regionInfo.fullStateName && admin1 === regionInfo.fullStateName) {
        return true;
    }

    return false;
}

function findBestPlace(results, searchText) {
    const searchParts = splitLocationSearch(searchText);
    const citySearch = cleanText(searchParts.cityName);
    const regionSearch = searchParts.regionName;
    let bestPlace = null;
    let bestScore = 0;
    let bestPopulation = -1;

    for (let i = 0; i < results.length; i += 1) {
        const place = results[i];
        const name = cleanText(place.name || '');
        const admin1 = cleanText(place.admin1 || '');
        const admin2 = cleanText(place.admin2 || '');
        const country = cleanText(place.country || '');
        let score = 0;

        if (regionSearch && !regionMatches(place, regionSearch)) {
            continue;
        }

        if (name === citySearch) {
            score += 6;
        }

        if (name.startsWith(citySearch) && name !== citySearch) {
            score += 3;
        }

        if (admin1 === citySearch || country === citySearch) {
            score += 3;
        }

        if (name.indexOf(citySearch) !== -1 && !name.startsWith(citySearch)) {
            score += 1;
        }

        if (admin1.indexOf(citySearch) !== -1 || admin2.indexOf(citySearch) !== -1 || country.indexOf(citySearch) !== -1) {
            score += 1;
        }

        if (regionSearch) {
            score += 4;
        }

        if (score > bestScore) {
            bestPlace = place;
            bestScore = score;
            bestPopulation = place.population || 0;
        } else if (score === bestScore && score > 0) {
            if ((place.population || 0) > bestPopulation) {
                bestPlace = place;
                bestPopulation = place.population || 0;
            }
        }
    }

    return bestPlace;
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

        forecastHtml += `
            <article class="forecast-card">
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


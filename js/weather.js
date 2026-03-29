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

function getForecastCardTheme(weatherCode) {
    switch (weatherCode) {
        case 0:
        case 1:
            return 'forecast-sunny';
        case 2:
        case 3:
            return 'forecast-cloudy';
        case 45:
        case 48:
            return 'forecast-foggy';
        case 51:
        case 53:
        case 55:
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return 'forecast-rainy';
        case 71:
        case 73:
        case 75:
            return 'forecast-snowy';
        case 95:
            return 'forecast-stormy';
        default:
            return 'forecast-default';
    }
}
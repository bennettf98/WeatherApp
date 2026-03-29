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
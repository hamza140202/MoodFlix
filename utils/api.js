// utils/api.js

// Maps remain here, to be exposed for script.js
const GENRE_MAP = {
    'action': 28, 'comedy': 35, 'drama': 18, 'horror': 27, 'scifi': 878,
    'thriller': 53, 'family': 10751, 'adventure': 12, 'animation': 16,
    'mystery': 9648, 'romance': 10749, 'music': 10402
    // Add more as needed
};

const MOOD_GENRE_MAP = {
    'happy': [GENRE_MAP.comedy, GENRE_MAP.family, GENRE_MAP.animation],
    'thrilling': [GENRE_MAP.action, GENRE_MAP.thriller, GENRE_MAP.horror, GENRE_MAP.mystery],
    'dramatic': [GENRE_MAP.drama],
    'calm': [GENRE_MAP.family, GENRE_MAP.romance] // Example, can be refined
};

// API_KEY and BASE_URL are removed.

// New function to call the local backend proxy
async function fetchSuggestionsFromProxy(mediaType, queryParams) {
    // Add mediaType to the queryParams that will be sent to the proxy
    const paramsForProxy = { ...queryParams, mediaType: mediaType };

    const queryString = new URLSearchParams(paramsForProxy).toString();
    const proxyUrl = `/api/tmdb-proxy?${queryString}`;

    console.log("Requesting Proxy URL:", proxyUrl);

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            // Try to parse error from proxy, or use status text
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If response is not JSON, use statusText
                errorData = { error: response.statusText, details: `Status: ${response.status}` };
            }
            console.error(`Proxy error! Status: ${response.status}`, errorData);
            return { results: [], error: errorData.error || `Proxy error: ${response.status}`, details: errorData.details };
        }
        const data = await response.json(); // Proxy is expected to return TMDb-like structure or an error object

        // The proxy should ideally return data already filtered for poster_path and overview.
        // If not, client-side filtering can be re-added here if necessary.
        // For now, assume proxy returns good data or an error structure.
        if (data.error) { // Check if the proxy itself returned an error object
            console.error("Error from proxy logic:", data.error, data.details);
            return { results: [], error: data.error, details: data.details };
        }
        // Assume data directly contains 'results' array from TMDb if successful
        return data;
    } catch (error) {
        console.error('Network error or other issue fetching from proxy:', error);
        return { results: [], error: 'Network error or issue fetching from proxy.' };
    }
}

// getImageUrl remains the same as it's a utility for TMDb image paths
function getImageUrl(posterPath, size = 'w500') {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

// Expose functions and maps for script.js
window.fetchSuggestionsFromProxy = fetchSuggestionsFromProxy;
window.getImageUrl = getImageUrl;
window.GENRE_MAP = GENRE_MAP;
window.MOOD_GENRE_MAP = MOOD_GENRE_MAP;

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
    const paramsForProxy = { ...queryParams, mediaType: mediaType };
    const queryString = new URLSearchParams(paramsForProxy).toString();
    const proxyUrl = `/api/tmdb-proxy?${queryString}`;

    console.log("Requesting Client-Side Proxy URL:", proxyUrl); // Log the exact URL called by client

    try {
        const response = await fetch(proxyUrl);

        // Log basic response info
        console.log(`Proxy Response Status: ${response.status} (${response.statusText})`);
        // It's helpful to see headers too, e.g., content-type
        // response.headers.forEach((value, name) => console.log(`Proxy Response Header: ${name} = ${value}`));


        if (!response.ok) { // Handles HTTP errors 4xx, 5xx from the proxy itself or passed from TMDb
            let errorPayload = {
                error: `Proxy request failed with status: ${response.status} ${response.statusText}`,
                details: `No further details available from proxy response. Check proxy logs on Vercel. URL called: ${proxyUrl}`
            };
            try {
                const errorJson = await response.json();
                console.error("Proxy error response JSON:", errorJson);
                errorPayload.error = errorJson.error || errorJson.status_message || errorPayload.error; // Use error message from proxy/TMDb if available
                errorPayload.details = errorJson.details || errorJson.errors || (typeof errorJson === 'string' ? errorJson : errorPayload.details);
            } catch (e) {
                // Failed to parse JSON, response might be text or empty
                const textResponse = await response.text().catch(() => '');
                console.error("Proxy error response (not JSON):", textResponse);
                if(textResponse) errorPayload.details = textResponse;
            }
            return { results: [], error: errorPayload.error, details: errorPayload.details, status: response.status };
        }

        // Attempt to parse successful response as JSON
        const data = await response.json();
        console.log("Data received from proxy:", data);

        // Check if the successfully parsed JSON still indicates an application-level error (e.g. from proxy logic)
        if (data.error) {
            console.error("Application error from proxy logic:", data.error, data.details);
            return { results: [], error: data.error, details: data.details, status: data.status || 200 }; // if proxy sends its own status in body
        }

        // Check for TMDb's own error structure within a 200 OK response from proxy, if proxy just forwards everything
        if (typeof data.success === 'boolean' && !data.success && data.status_message) {
             console.error("TMDb API error forwarded by proxy:", data.status_message);
             return { results: [], error: `TMDb API Error: ${data.status_message}`, details: data.errors || '', status: data.status_code || response.status };
        }

        // Assuming successful response contains 'results'
        // If 'results' is not present, it's an unexpected success response format
        if (!data.hasOwnProperty('results')) {
            console.warn("Proxy response successful but 'results' field is missing. Data:", data);
            // Consider this an error or handle as empty results depending on strictness
            // For now, treat as if no results found but not a hard error.
            // Or, more strictly:
            // return { results: [], error: "Unexpected response format from proxy: 'results' field missing.", details: JSON.stringify(data) };
        }

        return data; // Expected: { results: [...], page: ..., total_pages: ..., total_results: ... } or similar

    } catch (error) { // Catches network errors (proxy unreachable) or issues during fetch/json parsing
        console.error('Network error or critical issue fetching from proxy:', error.message, error.stack);
        return {
            results: [],
            error: 'Failed to connect to the suggestion service.',
            details: `Network error or problem in client-side fetch: ${error.message}. URL called: ${proxyUrl}`
        };
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

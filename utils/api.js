// utils/api.js

const API_KEY = '82ad91cc5edeb91b5df7f92d9c738c3e'; // User-provided API key
const BASE_URL = 'https://api.themoviedb.org/3';

const GENRE_MAP = {
    'action': 28,
    'comedy': 35,
    'drama': 18,
    'horror': 27,
    'scifi': 878,
    // Add more genres as needed from TMDb
    'thriller': 53,
    'family': 10751,
    'adventure': 12,
    'animation': 16,
    'mystery': 9648,
    'romance': 10749,
    'music': 10402
};

// Basic mapping of moods to genres or keywords. This can be expanded.
// For keywords, we'd need another mapping or a different API call strategy.
// For now, let's try mapping moods to a combination of genres.
const MOOD_GENRE_MAP = {
    'happy': [GENRE_MAP.comedy, GENRE_MAP.family, GENRE_MAP.animation],
    'thrilling': [GENRE_MAP.action, GENRE_MAP.thriller, GENRE_MAP.horror, GENRE_MAP.mystery],
    'dramatic': [GENRE_MAP.drama],
    'calm': [GENRE_MAP.family, GENRE_MAP.romance] // Example, can be refined
};

// utils/api.js
// (Keep API_KEY, BASE_URL, GENRE_MAP, MOOD_GENRE_MAP, getImageUrl, and window assignments as they are)

async function discoverMedia(mediaType = 'movie', filters = {}) {
    // filters object will contain: mood, genre, time, language, year, minRating
    const { mood, genre, time, language, year, minRating, page } = filters; // Add page here

    let params = new URLSearchParams({
        api_key: API_KEY,
        sort_by: 'popularity.desc',
        include_adult: 'false',
        page: page || 1 // Use provided page or default to 1
    });

    // Media Type determines the endpoint
    const endpoint = (mediaType === 'tv') ? `${BASE_URL}/discover/tv` : `${BASE_URL}/discover/movie`;

    // Language
    if (language) { // language is an ISO 639-1 code e.g., "en", "es"
        params.append('with_original_language', language);
        // Also set the main 'language' param for metadata to match,
        // this can sometimes help with stricter filtering or result consistency.
        params.append('language', language); 
    } else {
        // Default metadata language to English if no specific original language is chosen.
        // This also influences which movies/shows are returned if they have translations.
        params.append('language', 'en-US');
    }

    // Genre and Mood to Genre Logic
    let genreQueryParam = '';
    if (genre && GENRE_MAP[genre]) {
        genreQueryParam = GENRE_MAP[genre];
    } else if (mood && MOOD_GENRE_MAP[mood] && MOOD_GENRE_MAP[mood].length > 0) {
        // Fallback to mood genres if no specific genre is selected
        genreQueryParam = MOOD_GENRE_MAP[mood].join('|');
    }
    if (genreQueryParam) {
        params.append('with_genres', genreQueryParam);
    }

    // Time (runtime)
    if (time) {
        if (time === 'short') params.append('with_runtime.lte', 90);
        else if (time === 'medium') {
            params.append('with_runtime.gte', 90);
            params.append('with_runtime.lte', 150);
        } else if (time === 'long') params.append('with_runtime.gte', 150);
    }

    // Release Year
    if (year) { // year is a string like "2023"
        if (mediaType === 'movie') {
            params.append('primary_release_year', year);
        } else if (mediaType === 'tv') {
            params.append('first_air_date_year', year);
        }
    }
    
    // Minimum Rating
    if (minRating) { // minRating is a string like "7.5"
        params.append('vote_average.gte', parseFloat(minRating));
    }
    
    // Add 'watch_region' and 'with_watch_providers' for better "availability" if needed later.
    // For now, focusing on core discovery filters.
    // params.append('watch_region', 'US'); // Example: Filter by US availability

    const url = `${endpoint}?${params.toString()}`;
    console.log("Requesting TMDb URL:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to get error message
            console.error(`API error! Status: ${response.status}`, errorData);
            let errorMsg = `API error: ${response.status}`;
            if (errorData.status_message) errorMsg += ` - ${errorData.status_message}`;
            return { results: [], error: errorMsg };
        }
        const data = await response.json();
        // Filter out results without a poster path or overview for better quality suggestions
        if (data.results) {
             data.results = data.results.filter(item => item.poster_path && item.overview && item.overview.trim() !== "");
        } else {
            data.results = [];
        }
        return data;
    } catch (error) {
        console.error('Network error or other issue fetching data:', error);
        return { results: [], error: 'Network error or issue fetching data.' };
    }
}
// Ensure window.discoverMedia = discoverMedia; and window.getImageUrl = getImageUrl; are still at the end of the file.

// Function to get image URL
function getImageUrl(posterPath, size = 'w500') {
    if (!posterPath) return null; // Or a placeholder image
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

// Export functions to be used by script.js
// For now, discoverMedia is the main one. We can add getDetails(id) later if needed.
// window.tmdbApi = { discoverMedia, getImageUrl }; 
// Using window is one way if not using modules.
// For now, let's assume script.js will include this file or this code will be bundled.
// For the subtask, just create the file with these functions.
// script.js will need to be updated to `<script src="utils/api.js"></script>` before script.js
// or these functions need to be explicitly available.

// For the purpose of this subtask, the functions are defined.
// How they are made available to script.js will be handled in the next step.
window.discoverMedia = discoverMedia;
window.getImageUrl = getImageUrl;

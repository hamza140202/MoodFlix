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

async function discoverMedia(type = 'movie', mood, genre, time) {
    let params = new URLSearchParams({
        api_key: API_KEY,
        sort_by: 'popularity.desc', // Get popular items
        page: 1 // Start with the first page of results
    });

    // Genre
    if (genre && GENRE_MAP[genre]) {
        params.append('with_genres', GENRE_MAP[genre]);
    }

    // Mood to Genre Combination (if primary genre isn't specific enough or to broaden search)
    // This logic might need refinement. If a specific genre is selected,
    // mood might act as a secondary filter or keyword.
    // For now, if a mood is selected, we'll try to use its associated genres.
    // This could lead to a broad search if not combined carefully with the specific genre.
    // A better approach might be to use mood for keywords if the API supports it well for discovery.
    // Let's prioritize the selected genre first, and use mood genres as a fallback or supplement.

    let moodGenreIds = [];
    if (mood && MOOD_GENRE_MAP[mood]) {
        moodGenreIds = MOOD_GENRE_MAP[mood];
    }

    // If a specific genre is selected, use it.
    // If not, and mood genres are available, use them.
    // If both, the specific genre takes precedence.
    // Genre and Mood to Genre Logic
    let genreQueryParam = '';
    if (genre && GENRE_MAP[genre]) {
        genreQueryParam = GENRE_MAP[genre];
    } else if (mood && MOOD_GENRE_MAP[mood] && MOOD_GENRE_MAP[mood].length > 0) {
        // Fallback to mood genres if no specific genre is selected
        // Join with '|' for OR logic if mood maps to multiple genres
        genreQueryParam = MOOD_GENRE_MAP[mood].join('|');
    }

    if (genreQueryParam) {
        params.append('with_genres', genreQueryParam);
    }

    // Time (runtime)
    // TMDb runtime is in minutes.
    if (time) {
        if (time === 'short') params.append('with_runtime.lte', 90); // Max 1.5 hours
        else if (time === 'medium') {
            params.append('with_runtime.gte', 90);
            params.append('with_runtime.lte', 150); // 1.5 to 2.5 hours
        }
        else if (time === 'long') params.append('with_runtime.gte', 150); // Min 2.5 hours
    }

    // Add language filter to prioritize English results and improve relevance
    params.append('language', 'en-US');
    params.append('include_adult', 'false'); // Exclude adult content

    const url = `${BASE_URL}/discover/${type}?${params.toString()}`;
    console.log("Requesting URL:", url); // For debugging

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API error! Status: ${response.status}`, await response.json());
            return { results: [], error: `API error: ${response.status}` };
        }
        const data = await response.json();
        // Filter out results without a poster path or overview for better quality suggestions
        data.results = data.results.filter(item => item.poster_path && item.overview);
        return data; // Contains 'results', 'page', 'total_pages', 'total_results'
    } catch (error) {
        console.error('Network error or other issue fetching data:', error);
        return { results: [], error: 'Network error or issue fetching data.' };
    }
}

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

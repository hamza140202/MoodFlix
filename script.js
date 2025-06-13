document.addEventListener('DOMContentLoaded', () => {
    const moodSelect = document.getElementById('mood-select');
    const genreSelect = document.getElementById('genre-select');
    const timeSelect = document.getElementById('time-select');
    const spinButton = document.getElementById('spin-button');
    const suggestionArea = document.getElementById('suggestion-area');
    const suggestionTitle = document.getElementById('suggestion-title');
    const suggestionDescription = document.getElementById('suggestion-description');
    const suggestionDetails = document.getElementById('suggestion-details');
    // New selectors
    const typeSelect = document.getElementById('type-select');
    const languageSelect = document.getElementById('language-select');
    const yearInput = document.getElementById('year-input');
    const ratingSelect = document.getElementById('rating-select');
    const surpriseButton = document.getElementById('surprise-button'); // New selector

    const moodOptions = ["Happy", "Thrilling", "Dramatic", "Calm"];
    // Values for mood select: happy, thrilling, dramatic, calm
    const genreOptions = ["Comedy", "Action", "Sci-Fi", "Drama", "Horror"];
    // Values for genre select: comedy, action, scifi, drama, horror
    const timeOptions = [
        { text: "Short (<1hr)", value: "short" },
        { text: "Medium (1-2hr)", value: "medium" },
        { text: "Long (>2hr)", value: "long" }
    ];
    // Values for time select: short, medium, long

    function populateSelect(selectElement, options, isTime = false) {
        if (isTime) {
            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                if (selectElement.options.length === 1 && option.value === "") { // Default "Select" option
                    // Skip adding if it's the placeholder from HTML, or handle as needed
                } else {
                    selectElement.appendChild(opt);
                }
            });
        } else {
            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.toLowerCase().replace(/[^a-z0-9]+/gi, '');
                opt.textContent = option;
                 if (selectElement.options.length === 1 && option.value === "") {
                    // Skip
                } else {
                    selectElement.appendChild(opt);
                }
            });
        }
    }

    populateSelect(moodSelect, moodOptions);
    populateSelect(genreSelect, genreOptions);
    populateSelect(timeSelect, timeOptions, true);

    spinButton.addEventListener('click', () => {
        // Inside spinButton event listener
        const mediaType = typeSelect.value; // 'movie' or 'tv'

        // Build queryParams for the proxy
        const queryParams = {};

        // Genre and Mood to Genre ID Logic
        const selectedGenreName = genreSelect.value;
        const selectedMoodName = moodSelect.value;
        let genreIdQuery = '';

        if (selectedGenreName && window.GENRE_MAP && window.GENRE_MAP[selectedGenreName]) {
            genreIdQuery = window.GENRE_MAP[selectedGenreName].toString();
        } else if (selectedMoodName && window.MOOD_GENRE_MAP && window.MOOD_GENRE_MAP[selectedMoodName] && window.MOOD_GENRE_MAP[selectedMoodName].length > 0) {
            genreIdQuery = window.MOOD_GENRE_MAP[selectedMoodName].join('|');
        }
        if (genreIdQuery) {
            queryParams.with_genres = genreIdQuery;
        }

        // Language
        const selectedLanguage = languageSelect.value;
        if (selectedLanguage) {
            queryParams.with_original_language = selectedLanguage;
        }

        // Release Year
        const selectedYear = yearInput.value.trim();
        if (selectedYear) {
            if (mediaType === 'movie') {
                queryParams.primary_release_year = selectedYear;
            } else if (mediaType === 'tv') {
                queryParams.first_air_date_year = selectedYear;
            }
        }

        // Minimum Rating
        const selectedRating = ratingSelect.value;
        if (selectedRating) {
            queryParams.vote_average_gte = selectedRating;
        }

        // Time (Runtime)
        const selectedTime = timeSelect.value;
        if (selectedTime) {
            if (selectedTime === 'short') queryParams['with_runtime.lte'] = '90';
            else if (selectedTime === 'medium') {
                queryParams['with_runtime.gte'] = '90';
                queryParams['with_runtime.lte'] = '150';
            } else if (selectedTime === 'long') queryParams['with_runtime.gte'] = '150';
        }

        // Page (for "Surprise Me" - this part is for the spin button, so page is not typically set here)
        // queryParams.page = '1'; // Or handle pagination if implemented

        console.log('Spin button clicked. Media Type:', mediaType, 'Query Params for Proxy:', queryParams);

        // Existing UI updates for loading message
        suggestionArea.style.display = 'block';
        suggestionTitle.textContent = 'Spinning...';
        suggestionDescription.textContent = 'Consulting the TMDb spirits...';
        suggestionDetails.textContent = '';
        const suggestionPoster = document.getElementById('suggestion-poster');
        if(suggestionPoster) suggestionPoster.style.display = 'none';

        fetchAndDisplaySuggestion(mediaType, queryParams); // Pass mediaType and the resolved queryParams
    });

    // Inside DOMContentLoaded
    surpriseButton.addEventListener('click', () => {
        console.log('Surprise Me button clicked!');

        const randomPage = Math.floor(Math.random() * 20) + 1;
        const surpriseMediaType = Math.random() < 0.7 ? 'movie' : 'tv'; // Bias towards movies slightly

        const surpriseQueryParams = {
            vote_average_gte: '7.0', // Only fairly good ratings
            page: randomPage.toString() // Ensure page is a string if all params are strings
            // No genre, language, year, time for surprise
        };

        console.log('Surprise Me button clicked. Media Type:', surpriseMediaType, 'Query Params for Proxy:', surpriseQueryParams);

        // Existing UI updates for loading message
        suggestionArea.style.display = 'block';
        suggestionTitle.textContent = 'Conjuring a surprise...';
        suggestionDescription.textContent = 'Searching the cosmos for something amazing!';
        suggestionDetails.textContent = '';
        const suggestionPoster = document.getElementById('suggestion-poster');
        if(suggestionPoster) suggestionPoster.style.display = 'none';

        fetchAndDisplaySuggestion(surpriseMediaType, surpriseQueryParams);
    });

    // (Keep existing DOMContentLoaded, selectors, options, populateSelect, and spinButton event listener)

// and the API-based fetchAndDisplaySuggestion and its displayError.

// NEW function for local fallback
async function fetchDisplayLocalSuggestion(mediaType, originalSelections) { // New signature
    // console.warn(`API call failed... using queryParams:`, queryParams); // Old log
    console.warn(`API call failed or no results. Attempting fallback to local data. MediaType: ${mediaType}, Selections:`, originalSelections); // New log

    // Display a message indicating fallback attempt
    suggestionTitle.textContent = 'Trying local backup...';
    suggestionDescription.textContent = `TMDb is unavailable or had no matches. Searching our local list...`;
    suggestionDetails.textContent = '';
    const suggestionPoster = document.getElementById('suggestion-poster');
    if (suggestionPoster) suggestionPoster.style.display = 'none';


    try {
        // const moodFilePath = `data/moods/${queryParams.mood}.json`; // This wouldn't work if queryParams.mood isn't there
        const moodFilePath = `data/moods/${originalSelections.mood}.json`;
        const response = await fetch(moodFilePath);

        if (!response.ok) {
            // If specific mood file not found, could try a generic local file or just show general error
            console.error(`Local data file not found: ${moodFilePath}`);
            displayError(`TMDb API failed, and local data for '${originalSelections.mood}' mood is not available.`);
            return;
        }

        const moodData = await response.json();
        const filteredSuggestions = moodData.filter(item => {
            // const genreMatch = item.genres && item.genres.includes(queryParams.genre); // This wouldn't work
            // const timeMatch = item.time_category && item.time_category === queryParams.time; // This wouldn't work
            const genreMatch = item.genres && item.genres.includes(originalSelections.genre);
            const timeMatch = item.time_category && item.time_category === originalSelections.time;
            return genreMatch && timeMatch;
        });

        if (filteredSuggestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
            const suggestion = filteredSuggestions[randomIndex];

            suggestionTitle.textContent = `[LOCAL] ${suggestion.title}`; // Indicate it's a local fallback
            suggestionDescription.textContent = suggestion.description;

            let detailsStr = `Genre(s): ${suggestion.genres.join(', ')}. `;
            detailsStr += `Time Category: ${suggestion.time_category}. (This is a local fallback suggestion)`;
            suggestionDetails.textContent = detailsStr;

            // Hide poster as local data doesn't have it in this structure
            // const posterImg = document.getElementById('suggestion-poster'); // Already got suggestionPoster above
            if (suggestionPoster) suggestionPoster.style.display = 'none'; // Ensure it's hidden

            console.log('Local fallback suggestion displayed:', suggestion.title);
        } else {
            displayError(`TMDb API failed, and no local suggestions found for your criteria.`);
        }

    } catch (error) {
        console.error('Error fetching or processing local fallback suggestions:', error);
        displayError('TMDb API failed, and our local backup also encountered an issue.');
    }
}

// Modify the existing API fetchAndDisplaySuggestion
async function fetchAndDisplaySuggestion(mediaType, queryParams) { // New signature
    // mood, genre, time are now inside filters.mood, filters.genre, filters.time
    console.log(`Fetching API suggestion for MediaType: ${mediaType}, QueryParams:`, queryParams);
    suggestionArea.style.display = 'block';
    suggestionTitle.textContent = 'Spinning...';
    suggestionDescription.textContent = 'Consulting the TMDb spirits...';
    suggestionDetails.textContent = '';
    const suggestionPoster = document.getElementById('suggestion-poster'); // Ensure poster is managed
    if(suggestionPoster) suggestionPoster.style.display = 'none'; // Hide initially


    // Assuming fetchSuggestionsFromProxy and getImageUrl are globally available
    // const mediaType = 'movie'; // Now passed as a parameter
    const apiResponse = await fetchSuggestionsFromProxy(mediaType, queryParams); // Call the new proxy function

    if (apiResponse.error || !apiResponse.results || apiResponse.results.length === 0) {
        console.warn("API error or no results from API. Error:", apiResponse.error);
        // New way: pass original selections for local fallback
        const originalSelectionsForFallback = {
            mood: moodSelect.value,     // Original mood name
            genre: genreSelect.value,   // Original genre name
            time: timeSelect.value      // Original time selection
        };
        await fetchDisplayLocalSuggestion(mediaType, originalSelectionsForFallback);
        return;
    }

    // This part remains largely the same if API call is successful
    const randomIndex = Math.floor(Math.random() * apiResponse.results.length);
    const suggestion = apiResponse.results[randomIndex];
    console.log("API Suggestion:", suggestion);

    // const suggestionPoster = document.getElementById('suggestion-poster'); // Already declared above
    const suggestionReleaseDate = document.getElementById('suggestion-release-date');
    const suggestionRating = document.getElementById('suggestion-rating');
    const suggestionPopularity = document.getElementById('suggestion-popularity');

    suggestionTitle.textContent = suggestion.title || suggestion.name;
    suggestionDescription.textContent = suggestion.overview
        ? (suggestion.overview.substring(0, 280) + (suggestion.overview.length > 280 ? '...' : ''))
        : "No description available.";

    if (suggestion.poster_path && suggestionPoster) { // Check if poster element exists
        suggestionPoster.src = getImageUrl(suggestion.poster_path);
        suggestionPoster.style.display = 'block';
    } else if (suggestionPoster) {
        suggestionPoster.style.display = 'none';
    }

    if(suggestionReleaseDate) suggestionReleaseDate.textContent = suggestion.release_date || suggestion.first_air_date || "N/A";
    if(suggestionRating) suggestionRating.textContent = suggestion.vote_average ? suggestion.vote_average.toFixed(1) : "N/A";

    const popularitySpan = document.getElementById('suggestion-popularity');
    if (popularitySpan) {
         popularitySpan.textContent = suggestion.popularity ? suggestion.popularity.toFixed(0) : "N/A";
    }
    console.log('Updated display with API poster and details for:', suggestion.title || suggestion.name);
}

// displayError function remains as is from the previous step
 function displayError(message) {
        const suggestionPoster = document.getElementById('suggestion-poster');
        suggestionTitle.textContent = 'Oops!';
        suggestionDescription.textContent = message;
        suggestionDetails.textContent = 'Please try different selections or check back later.';
        if (suggestionPoster) {
            suggestionPoster.style.display = 'none'; // Hide poster on error
        }
    }
});

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
        const filters = {
            mood: moodSelect.value,
            genre: genreSelect.value,
            time: timeSelect.value,
            language: languageSelect.value,
            year: yearInput.value.trim(), // .trim() for year input
            minRating: ratingSelect.value
        };
        const mediaType = typeSelect.value; // 'movie' or 'tv'

        console.log('Spin button clicked with filters:', filters, 'and mediaType:', mediaType);

        // New validation: At least one filter should ideally be chosen, or it's a very broad search.
        // For now, we allow spinning with no specific filters (besides mediaType).
        // The API handler defaults to popular items.
        // A more user-friendly approach might be to encourage at least one selection if all are "Any".
        // This can be a UI refinement later.

        suggestionArea.style.display = 'block';
        suggestionTitle.textContent = 'Spinning...';
        suggestionDescription.textContent = 'Consulting the TMDb spirits...';
        suggestionDetails.textContent = '';
        const suggestionPoster = document.getElementById('suggestion-poster');
        if(suggestionPoster) suggestionPoster.style.display = 'none';

        fetchAndDisplaySuggestion(mediaType, filters); // Pass mediaType and filters object
    });

    // Inside DOMContentLoaded
    surpriseButton.addEventListener('click', () => {
        console.log('Surprise Me button clicked!');

        // For "Surprise Me", we want broadly popular, well-rated items.
        // Pick a random page from the first, say, 20 pages of popular results.
        // TMDb often has many pages for popular items.
        const randomPage = Math.floor(Math.random() * 20) + 1;

        const surpriseFilters = {
            minRating: '7.0', // Only fairly good ratings
            page: randomPage,  // Fetch from a random page for variety
            // Other filters (mood, genre, time, language, year) are intentionally omitted
            // to get a wide variety of popular content.
            // `api.js` defaults to 'en-US' if language is not specified.
        };

        // Randomly pick 'movie' or 'tv' for more surprise
        const mediaType = Math.random() < 0.7 ? 'movie' : 'tv'; // Bias towards movies slightly

        suggestionArea.style.display = 'block';
        suggestionTitle.textContent = 'Conjuring a surprise...';
        suggestionDescription.textContent = 'Searching the cosmos for something amazing!';
        suggestionDetails.textContent = '';
        const suggestionPoster = document.getElementById('suggestion-poster');
        if(suggestionPoster) suggestionPoster.style.display = 'none';

        // Call the existing fetch function, but with surprise parameters
        fetchAndDisplaySuggestion(mediaType, surpriseFilters);
    });

    // (Keep existing DOMContentLoaded, selectors, options, populateSelect, and spinButton event listener)

// and the API-based fetchAndDisplaySuggestion and its displayError.

// NEW function for local fallback
async function fetchDisplayLocalSuggestion(mediaType, filters) { // mediaType might be useful for local fallback later
    // mood, genre, time are now inside filters.mood, filters.genre, filters.time
    console.warn(`API call failed or no results. Attempting fallback to local data for MediaType: ${mediaType}, Filters:`, filters);

    // Display a message indicating fallback attempt
    suggestionTitle.textContent = 'Trying local backup...';
    suggestionDescription.textContent = `TMDb is unavailable or had no matches. Searching our local list...`;
    suggestionDetails.textContent = '';
    const suggestionPoster = document.getElementById('suggestion-poster');
    if (suggestionPoster) suggestionPoster.style.display = 'none';


    try {
        const moodFilePath = `data/moods/${filters.mood}.json`; // New
        const response = await fetch(moodFilePath);

        if (!response.ok) {
            // If specific mood file not found, could try a generic local file or just show general error
            console.error(`Local data file not found: ${moodFilePath}`);
            displayError(`TMDb API failed, and local data for '${filters.mood}' mood is not available.`);
            return;
        }

        const moodData = await response.json();
        const filteredSuggestions = moodData.filter(item => {
            const genreMatch = item.genres && item.genres.includes(filters.genre);
            const timeMatch = item.time_category && item.time_category === filters.time;
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
async function fetchAndDisplaySuggestion(mediaType, filters) { // This is the main function called by spinButton
    // mood, genre, time are now inside filters.mood, filters.genre, filters.time
    console.log(`Fetching API suggestion for MediaType: ${mediaType}, Filters:`, filters);
    suggestionArea.style.display = 'block';
    suggestionTitle.textContent = 'Spinning...';
    suggestionDescription.textContent = 'Consulting the TMDb spirits...';
    suggestionDetails.textContent = '';
    const suggestionPoster = document.getElementById('suggestion-poster'); // Ensure poster is managed
    if(suggestionPoster) suggestionPoster.style.display = 'none'; // Hide initially


    // Assuming discoverMedia and getImageUrl are globally available
    // const mediaType = 'movie'; // Now passed as a parameter
    const apiResponse = await discoverMedia(mediaType, filters); // New call

    if (apiResponse.error || !apiResponse.results || apiResponse.results.length === 0) {
        console.warn("API error or no results from API. Error:", apiResponse.error);
        await fetchDisplayLocalSuggestion(mediaType, filters); // New: Call fallback with mediaType and filters
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

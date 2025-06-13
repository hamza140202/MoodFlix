document.addEventListener('DOMContentLoaded', () => {
    const moodSelect = document.getElementById('mood-select');
    const genreSelect = document.getElementById('genre-select');
    const timeSelect = document.getElementById('time-select');
    const spinButton = document.getElementById('spin-button');
    const suggestionArea = document.getElementById('suggestion-area');
    const suggestionTitle = document.getElementById('suggestion-title');
    const suggestionDescription = document.getElementById('suggestion-description');
    const suggestionDetails = document.getElementById('suggestion-details');

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
        const selectedMood = moodSelect.value;
        const selectedGenre = genreSelect.value;
        const selectedTime = timeSelect.value;

        console.log('Spin button clicked!');
        console.log('Selected Mood:', selectedMood);
        console.log('Selected Genre:', selectedGenre);
        console.log('Selected Time:', selectedTime);

        if (!selectedMood || !selectedGenre || !selectedTime) {
            alert('Please select a mood, genre, and time before spinning!');
            return;
        }

        suggestionArea.style.display = 'block';
        suggestionTitle.textContent = 'Spinning...';
        suggestionDescription.textContent = 'Finding the perfect suggestion for you!';
        suggestionDetails.textContent = '';

        fetchAndDisplaySuggestion(selectedMood, selectedGenre, selectedTime);
    });

    // (Keep existing DOMContentLoaded, selectors, options, populateSelect, and spinButton event listener)

// and the API-based fetchAndDisplaySuggestion and its displayError.

// NEW function for local fallback
async function fetchDisplayLocalSuggestion(mood, genre, time) {
    console.warn(`API call failed or no results. Attempting fallback to local data for Mood: ${mood}, Genre: ${genre}, Time: ${time}`);

    // Display a message indicating fallback attempt
    suggestionTitle.textContent = 'Trying local backup...';
    suggestionDescription.textContent = `TMDb is unavailable or had no matches. Searching our local list...`;
    suggestionDetails.textContent = '';
    const suggestionPoster = document.getElementById('suggestion-poster');
    if (suggestionPoster) suggestionPoster.style.display = 'none';


    try {
        const moodFilePath = `data/moods/${mood}.json`; // Ensure these paths are still correct
        const response = await fetch(moodFilePath);

        if (!response.ok) {
            // If specific mood file not found, could try a generic local file or just show general error
            console.error(`Local data file not found: ${moodFilePath}`);
            displayError(`TMDb API failed, and local data for '${mood}' mood is not available.`);
            return;
        }

        const moodData = await response.json();
        const filteredSuggestions = moodData.filter(item => {
            const genreMatch = item.genres && item.genres.includes(genre);
            const timeMatch = item.time_category && item.time_category === time;
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
async function fetchAndDisplaySuggestion(mood, genre, time) { // This is the main function called by spinButton
    console.log(`Fetching API suggestion for Mood: ${mood}, Genre: ${genre}, Time: ${time}`);
    suggestionArea.style.display = 'block';
    suggestionTitle.textContent = 'Spinning...';
    suggestionDescription.textContent = 'Consulting the TMDb spirits...';
    suggestionDetails.textContent = '';
    const suggestionPoster = document.getElementById('suggestion-poster'); // Ensure poster is managed
    if(suggestionPoster) suggestionPoster.style.display = 'none'; // Hide initially


    // Assuming discoverMedia and getImageUrl are globally available
    const mediaType = 'movie';
    const apiResponse = await discoverMedia(mediaType, mood, genre, time);

    if (apiResponse.error || !apiResponse.results || apiResponse.results.length === 0) {
        console.warn("API error or no results from API. Error:", apiResponse.error);
        await fetchDisplayLocalSuggestion(mood, genre, time); // Call fallback
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

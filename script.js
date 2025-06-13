document.addEventListener('DOMContentLoaded', () => {
    // Old selectors - moodSelect and genreSelect will be removed
    // const moodSelect = document.getElementById('mood-select');
    // const genreSelect = document.getElementById('genre-select');
    const timeSelect = document.getElementById('time-select');
    const spinButton = document.getElementById('spin-button');
    const suggestionArea = document.getElementById('suggestion-area');
    const suggestionTitle = document.getElementById('suggestion-title');
    const suggestionDescription = document.getElementById('suggestion-description');
    const suggestionDetails = document.getElementById('suggestion-details');
    const typeSelect = document.getElementById('type-select');
    const languageSelect = document.getElementById('language-select');
    const yearInput = document.getElementById('year-input');
    const ratingSelect = document.getElementById('rating-select');
    const surpriseButton = document.getElementById('surprise-button');

    // New Talisman Card Containers
    const emotionMoodFilterContainer = document.getElementById('emotion-mood-filter');
    const magicTypeFilterContainer = document.getElementById('magic-type-filter');
    const worldSettingFilterContainer = document.getElementById('world-setting-filter');
    const companionTypeFilterContainer = document.getElementById('companion-type-filter');

    // Data for old selects - moodOptions and genreOptions will be removed
    // const moodOptions = ["Happy", "Thrilling", "Dramatic", "Calm"];
    // const genreOptions = ["Comedy", "Action", "Sci-Fi", "Drama", "Horror"];
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

    // populateSelect(moodSelect, moodOptions); // Old
    // populateSelect(genreSelect, genreOptions); // Old
    populateSelect(timeSelect, timeOptions, true); // Keep for time select

    async function populateTalismanCards(containerElement, dataUrl, filterTypeKey) {
        if (!containerElement) {
            console.error(`Container element for ${filterTypeKey} not found.`);
            return;
        }
        try {
            const response = await fetch(dataUrl);
            if (!response.ok) {
                console.error(`Failed to fetch ${dataUrl}: ${response.statusText}`);
                containerElement.textContent = `Error loading ${filterTypeKey} options.`;
                return;
            }
            const items = await response.json();
            items.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('talisman-card');
                card.textContent = item.displayName;
                card.dataset.filterValue = item.key;
                card.dataset.filterType = filterTypeKey;
                card.dataset.genres = JSON.stringify(item.tmdb_genres || []); // Store as JSON string
                card.dataset.keywords = JSON.stringify(item.tmdb_keywords || []); // Store as JSON string

                card.addEventListener('click', () => {
                    // Deselect other active cards in the same container
                    const currentlyActive = containerElement.querySelector('.talisman-card.active');
                    if (currentlyActive && currentlyActive !== card) {
                        currentlyActive.classList.remove('active');
                    }
                    // Toggle current card's active state
                    card.classList.toggle('active');

                    // If the card is now active, trigger pulse animation
                    if (card.classList.contains('active')) {
                        card.classList.add('pulsing');
                        card.addEventListener('animationend', () => {
                            card.classList.remove('pulsing');
                        }, { once: true }); // Important: { once: true } removes the listener after it fires
                    }
                });
                containerElement.appendChild(card);
            });
        } catch (error) {
            console.error(`Error populating ${filterTypeKey} cards:`, error);
            containerElement.textContent = `Error loading ${filterTypeKey} options.`;
        }
    }

    // Populate new talisman filters
    populateTalismanCards(emotionMoodFilterContainer, 'data/emotion_moods.json', 'emotionMood');
    populateTalismanCards(magicTypeFilterContainer, 'data/magic_types.json', 'magicType');
    populateTalismanCards(worldSettingFilterContainer, 'data/world_settings.json', 'worldSetting');
    populateTalismanCards(companionTypeFilterContainer, 'data/companion_types.json', 'companionType');

    spinButton.addEventListener('click', () => {
        // Reset suggestion area for new spin
        suggestionArea.classList.remove('suggestion-area-visible');
        // suggestionArea.style.display = 'none'; // Hide it completely first, then let fetch functions make it block

        let selectedGenres = [];
        let selectedKeywords = [];
        const activeCards = document.querySelectorAll('.talisman-card.active');

        activeCards.forEach(card => {
            const genres = JSON.parse(card.dataset.genres || '[]');
            const keywords = JSON.parse(card.dataset.keywords || '[]');
            genres.forEach(genreId => selectedGenres.push(genreId));
            keywords.forEach(keywordId => selectedKeywords.push(keywordId));
        });

        const filters = {
            time: timeSelect.value,
            language: languageSelect.value,
            year: yearInput.value.trim(),
            minRating: ratingSelect.value,
            selectedGenres: [...new Set(selectedGenres)], // Add unique genre IDs
            selectedKeywords: [...new Set(selectedKeywords)] // Add unique keyword IDs
        };
        const mediaType = typeSelect.value;

        // The old filter keys like emotionMood, magicType are no longer directly added to 'filters'.
        // Their effect is now through selectedGenres and selectedKeywords.
        console.log('Spin button clicked with filters:', filters, 'and mediaType:', mediaType);

        // New validation: At least one filter should ideally be chosen, or it's a very broad search.
        // For now, we allow spinning with no specific filters (besides mediaType).
        // The API handler defaults to popular items.
        // A more user-friendly approach might be to encourage at least one selection if all are "Any".
        // This can be a UI refinement later.

        // Initial display setup for "Spinning..." message
        suggestionArea.style.display = 'block';
        // No -visible class yet, so it's opacity 0 but takes space
        // Or, set to none then block in fetch functions.
        // For now, let's ensure it's block so the text content is part of the layout,
        // then fly-in will occur when content is ready.
        // The text will be visible briefly before fly-in if not handled carefully.
        // A better approach: set text, then add -visible.

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

        // Trigger flip animation
        if (surpriseButton) { // Ensure button exists
            surpriseButton.classList.add('flipping');
            surpriseButton.addEventListener('animationend', () => {
                surpriseButton.classList.remove('flipping');
            }, { once: true });
        }

        // Reset suggestion area for new spin/surprise
        suggestionArea.classList.remove('suggestion-area-visible');

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

        // Initial display setup for "Conjuring..." message
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
async function fetchDisplayLocalSuggestion(mediaType, filters) {
    // The 'filters' object now contains emotionMood, magicType, worldSetting, companionType.
    // The old local fallback relied on filters.mood and filters.genre, and specific data files.
    // This needs to be updated if local fallback is to work with the new thematic filters.
    // For now, this function will show a generic message as the old logic is incompatible.
    console.warn(`API call failed or no results. Attempting fallback to local data for MediaType: ${mediaType}, Filters:`, filters);

    suggestionArea.style.display = 'block'; // Ensure area is visible for the message
    suggestionArea.classList.add('suggestion-area-visible'); // Fly in the fallback message

    suggestionTitle.textContent = 'Trying local backup...';
    suggestionDescription.textContent = `TMDb is unavailable or had no matches. Our local fallback for new filters is not yet fully implemented.`;
    suggestionDetails.textContent = 'Please try a broader search for now.';
    const suggestionPoster = document.getElementById('suggestion-poster');
    if (suggestionPoster) suggestionPoster.style.display = 'none';

    // Original local fallback logic (now largely incompatible):
    /*
    try {
        const moodFilePath = `data/moods/${filters.mood}.json`; // This would now be filters.emotionMood or similar
        const response = await fetch(moodFilePath);

        if (!response.ok) {
            console.error(`Local data file not found: ${moodFilePath}`);
            displayError(`TMDb API failed, and local data for the selected mood is not available.`);
            return;
        }

        const moodData = await response.json();
        const filteredSuggestions = moodData.filter(item => {
            const genreMatch = item.genres && item.genres.includes(filters.genre); // This would be filters.magicType etc.
            const timeMatch = item.time_category && item.time_category === filters.time;
            return genreMatch && timeMatch;
        });

        if (filteredSuggestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
            const suggestion = filteredSuggestions[randomIndex];

            suggestionTitle.textContent = `[LOCAL] ${suggestion.title}`;
            suggestionDescription.textContent = suggestion.description;
            let detailsStr = `Genre(s): ${suggestion.genres.join(', ')}. `;
            detailsStr += `Time Category: ${suggestion.time_category}. (This is a local fallback suggestion)`;
            suggestionDetails.textContent = detailsStr;
            if (suggestionPoster) suggestionPoster.style.display = 'none';
            console.log('Local fallback suggestion displayed:', suggestion.title);
        } else {
            displayError(`TMDb API failed, and no local suggestions found for your criteria.`);
        }
    } catch (error) {
        console.error('Error fetching or processing local fallback suggestions:', error);
        displayError('TMDb API failed, and our local backup also encountered an issue.');
    }
    */
}

// Modify the existing API fetchAndDisplaySuggestion
async function fetchAndDisplaySuggestion(mediaType, filters) {
    // Filters object now contains: emotionMood, magicType, worldSetting, companionType, time, language, year, minRating
    console.log(`Fetching API suggestion for MediaType: ${mediaType}, Filters:`, filters);

    // Setup "Spinning..." state - area is made block by caller (spinButton listener)
    // suggestionArea.classList.remove('suggestion-area-visible'); // Already done by caller
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

    suggestionArea.style.display = 'block'; // Ensure it's visible before adding class for animation
    suggestionArea.classList.add('suggestion-area-visible'); // Add class to trigger fly-in

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
        suggestionArea.classList.remove('suggestion-area-visible'); // Remove for direct display
        suggestionArea.style.display = 'block'; // Ensure area is visible

        const suggestionPoster = document.getElementById('suggestion-poster');
        suggestionTitle.textContent = 'Oops!';
        suggestionDescription.textContent = message;
        suggestionDetails.textContent = 'Please try different selections or check back later.';
        if (suggestionPoster) {
            suggestionPoster.style.display = 'none'; // Hide poster on error
        }
    }

    // Letter-by-letter animation for h1
    const h1 = document.querySelector('.container h1');
    if (h1) {
        const spans = h1.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.animation = `fadeInLetter 0.5s ease forwards ${index * 0.1}s`;
        });
    }
});

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

    async function fetchAndDisplaySuggestion(mood, genre, time) {
        console.log(`Fetching suggestion for Mood: ${mood}, Genre: ${genre}, Time: ${time}`);

        try {
            // Strategy: Fetch data based on the selected mood first.
            // Then filter this data by the selected genre and time.
            // This assumes mood files exist and are the primary filter.
            // Fallback/alternative strategies can be added later.

            const moodFilePath = `data/moods/${mood}.json`;
            const response = await fetch(moodFilePath);

            if (!response.ok) {
                if (response.status === 404) {
                    console.error(`Data file not found: ${moodFilePath}`);
                    displayError(`Sorry, we don't have suggestions for the mood '${mood}' yet.`);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status} while fetching ${moodFilePath}`);
            }

            const moodData = await response.json();
            console.log("Fetched mood data:", moodData);

            const filteredSuggestions = moodData.filter(item => {
                // Check genre: item.genres should be an array, check if selectedGenre is in it.
                const genreMatch = item.genres && item.genres.includes(genre);
                // Check time category
                const timeMatch = item.time_category && item.time_category === time;

                return genreMatch && timeMatch;
            });

            console.log("Filtered suggestions:", filteredSuggestions);

            if (filteredSuggestions.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
                const suggestion = filteredSuggestions[randomIndex];

                suggestionTitle.textContent = suggestion.title;
                suggestionDescription.textContent = suggestion.description;
                // Construct details string
                let detailsStr = `Genre(s): ${suggestion.genres.join(', ')}. `;
                detailsStr += `Time Category: ${suggestion.time_category.charAt(0).toUpperCase() + suggestion.time_category.slice(1)}.`;
                // If actual duration exists in data, could add it here too.
                // e.g. if (suggestion.duration_actual_minutes) detailsStr += ` Duration: ${suggestion.duration_actual_minutes} min.`
                suggestionDetails.textContent = detailsStr;

                console.log('Suggestion displayed:', suggestion.title);
            } else {
                displayError(`No suggestions found for Mood: ${mood}, Genre: ${genre}, Time: ${time}. Try other combinations!`);
            }

        } catch (error) {
            console.error('Error fetching or processing suggestions:', error);
            displayError('Oops! Something went wrong while fetching suggestions. Please try again.');
        }
    }

    function displayError(message) {
        suggestionTitle.textContent = 'Error';
        suggestionDescription.textContent = message;
        suggestionDetails.textContent = '';
    }
});

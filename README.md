# What Should I Watch? - Spinner Tool

This project is a web-based tool to help you decide what movie or series to watch based on your current mood, preferred genre, and available time. It fetches real-time data from The Movie Database (TMDb) and includes a local fallback for offline use or API issues.

## How to Use

1.  **API Key Setup**:
    *   This tool requires an API key from The Movie Database (TMDb).
    *   The key is currently pre-configured in `utils/api.js` (`const API_KEY = 'YOUR_API_KEY_HERE';`).
    *   If you are cloning or modifying this project, replace `'YOUR_API_KEY_HERE'` with your own TMDb API key. You can obtain one for free at [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api).

2.  **Running the Tool**:
    *   Clone or download this repository.
    *   Open the `index.html` file in your web browser.
    *   Select your desired mood, genre, and available time from the dropdown menus.
    *   Click the "🎲 Spin to Suggest" button.
    *   A movie or series suggestion, complete with poster and details from TMDb, will be displayed.

## Features

*   **Dynamic Suggestions**: Fetches up-to-date movie and series information from TMDb.
*   **Rich Content**: Displays posters, descriptions, ratings, and release dates.
*   **Mood-based filtering**: Get suggestions tailored to how you're feeling.
*   **Genre filter**: Narrow down by common genres.
*   **Time filter**: Choose based on how much time you have (Short, Medium, Long).
*   **Local Fallback**: If the TMDb API is unavailable or returns no results for a specific query, the tool will attempt to provide a suggestion from a limited local dataset. (Fallback suggestions are marked with `[LOCAL]`).

## Data Source

*   **Primary**: [The Movie Database (TMDb) API](https://www.themoviedb.org/documentation/api) for real-time movie and TV show data.
*   **Fallback**: A local, modular set of JSON files located in the `/data` directory provides a limited backup.

## Technologies Used

*   HTML
*   CSS (plain)
*   JavaScript (vanilla)
*   TMDb API

## Future Enhancements (Potential)

*   User selection for Movie vs. TV Show.
*   More sophisticated mood-to-keyword/genre mapping for TMDb queries.
*   Advanced spinner animation.
*   User history/saved suggestions.
*   Expanded local dataset for fallback.

---

Enjoy finding your next watch!

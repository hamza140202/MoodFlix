# What Should I Watch? - Spinner Tool

This project is a simple web-based tool to help you decide what movie or series to watch based on your current mood, preferred genre, and available time.

## How to Use

1.  Clone or download this repository.
2.  Open the `index.html` file in your web browser.
3.  Select your desired mood, genre, and available time from the dropdown menus.
4.  Click the "🎲 Spin to Suggest" button.
5.  A movie or series suggestion will be displayed below the button.

## Features (MVP)

*   **Mood-based filtering**: Get suggestions tailored to how you're feeling (e.g., Happy, Thrilling).
*   **Genre filter**: Narrow down by common genres (e.g., Comedy, Sci-Fi, Action).
*   **Time filter**: Choose based on how much time you have (Short, Medium, Long).
*   **Randomized Suggestions**: Uses a "spinner" like approach to pick from available options.

## Data Source

Currently, this tool uses a local, modular set of JSON files located in the `/data` directory to provide suggestions.
*   `/data/moods/`
*   `/data/genres/` (Note: Genre-specific files like `comedy.json` are present but current logic primarily fetches from mood files then filters. This structure allows for future flexibility).
*   `/data/time/` (Note: Time-specific files like `short.json` are present but current logic primarily fetches from mood files then filters. This structure allows for future flexibility).

## Technologies Used

*   HTML
*   CSS (plain)
*   JavaScript (vanilla)

## Future Enhancements (Potential)

*   Integration with TMDb API for real-time data, posters, and more details.
*   More sophisticated spinner animation.
*   User history/saved suggestions.
*   Expanded dataset.

---

This is an initial version. Enjoy!

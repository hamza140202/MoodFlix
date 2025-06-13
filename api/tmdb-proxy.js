// api/tmdb-proxy.js

export default async function handler(req, res) {
  const { mediaType = 'movie', query = '' } = req.query;
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    res.status(500).json({ error: 'TMDB API key not configured' });
    return;
  }

  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  // Basic example: search movies or tv shows by query
  // You can expand this logic to handle genres, moods, etc.
  const tmdbUrl = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(tmdbUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'TMDb API error' });
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch TMDb data' });
  }
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');
  const [searchResults, setSearchResults] = useState(location.state?.searchResults || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('release_date');
  
  // Your TMDB API credentials
  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';

  const searchContent = async () => {
    if (!searchQuery.trim()) {
      const errorMessage = 'Please enter a search query';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!API_KEY) {
      const errorMessage = 'TMDB API key is missing. Please check your environment variables.';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      // Use multi-search to find movies, TV shows, and people with maximum results
      const url = `${BASE_URL}/search/multi?query=${encodeURIComponent(searchQuery)}&include_adult=false&language=en-US&page=1`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setSearchResults(data);
      if (data.results && data.results.length > 0) {
        toast.success(`Found ${data.total_results} results for "${searchQuery}"`);
      } else {
        toast.warning('No results found for your search');
      }
    } catch (err) {
      const errorMessage = `Error fetching data: ${err.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchContent();
  };

  const handleContentClick = (item) => {
    // Navigate to detail page with search query in URL state
    navigate(`/detail/${item.media_type}/${item.id}`, {
      state: { 
        searchQuery: searchQuery,
        searchResults: searchResults
      }
    });
  };

  const sortContent = (items) => {
    if (!items) return [];
    
    return [...items].sort((a, b) => {
      if (sortBy === 'release_date') {
        // Sort by release date (newest first)
        const dateA = a.release_date || a.first_air_date ? new Date(a.release_date || a.first_air_date) : new Date(0);
        const dateB = b.release_date || b.first_air_date ? new Date(b.release_date || b.first_air_date) : new Date(0);
        return dateB - dateA;
      } else {
        // Sort by popularity (highest first)
        return (b.popularity || 0) - (a.popularity || 0);
      }
    });
  };

  const renderContentListItem = (item) => {
    const isPerson = item.media_type === 'person';
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;
    const posterPath = item.poster_path || item.profile_path;
    
    return (
      <div key={`${item.media_type}-${item.id}`} className="movie-list-item" onClick={() => handleContentClick(item)}>
        <div className="movie-list-poster">
          {posterPath ? (
            <img 
              src={`https://image.tmdb.org/t/p/w200${posterPath}`} 
              alt={title}
              className="list-poster-image"
            />
          ) : (
            <div className="no-list-poster">No {isPerson ? 'Photo' : 'Poster'}</div>
          )}
        </div>
        
        <div className="movie-list-info">
          <div className="content-type-badge">
            {item.media_type === 'movie' ? '🎬 Movie' : 
             item.media_type === 'tv' ? '📺 TV Show' : 
             item.media_type === 'person' ? '👤 Person' : '📄 Other'}
          </div>
          <h3 className="movie-list-title">{title}</h3>
          <div className="movie-list-year">
            {date ? new Date(date).getFullYear() : 'Unknown Year'}
          </div>
          <div className="movie-list-rating">
            {item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : 'No Rating'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Filmnet Content Fetch</h1>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-controls">
            <div className="search-input">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter movie, TV show, or person name..."
                className="search-field"
              />
              <button type="submit" disabled={loading} className="search-button">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="error">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <p>Loading...</p>
          </div>
        )}

        {searchResults && (
          <div className="results">
            <div className="results-header">
              <h2>Results</h2>
              <div className="results-controls">
                {searchResults.results && (
                  <div className="sort-controls">
                    <label>
                      Sort by:
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                      >
                        <option value="release_date">Release Date (Newest First)</option>
                        <option value="popularity">Popularity</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="formatted-results">
              {searchResults.results ? (
                <div className="movie-list">
                  <p className="results-info">
                    Found {searchResults.total_results} results across {searchResults.total_pages} pages
                  </p>
                  <div className="movie-grid">
                    {sortContent(searchResults.results).map(renderContentListItem)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default SearchPage;

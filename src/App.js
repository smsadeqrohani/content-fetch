import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [searchType, setSearchType] = useState('name'); // Only 'name' search
  const [searchQuery, setSearchQuery] = useState('');
  const [movieData, setMovieData] = useState(null);
  const [searchResults, setSearchResults] = useState(null); // Keep search results separate
  const [castData, setCastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortBy, setSortBy] = useState('release_date'); // 'release_date' or 'popularity'
  const [showModal, setShowModal] = useState(false);
  const [contentType, setContentType] = useState('all'); // 'all', 'movie', 'tv', 'person'
  const [translatedData, setTranslatedData] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showPersianSection, setShowPersianSection] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customPromptInstructions, setCustomPromptInstructions] = useState('');

  // Your TMDB API credentials
  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  
  // OpenAI API credentials
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  // Persian section labels
  const persianLabels = {
    title: 'عنوان',
    summary: 'خلاصه',
    originalTitle: 'عنوان اصلی',
    status: 'وضعیت',
    placeOfBirth: 'محل تولد',
    cast: 'بازیگران',
    crew: 'عوامل',
    character: 'نقش',
    job: 'سمت',
    year: 'سال',
    rating: 'امتیاز',
    runtime: 'مدت زمان',
    genres: 'ژانرها',
    productionCompanies: 'شرکت‌های تولید',
    spokenLanguages: 'زبان‌های گفتاری',
    birthday: 'تاریخ تولد',
    language: 'زبان',
    popularity: 'محبوبیت',
    votes: 'رای',
    minutes: 'دقیقه',
    unknown: 'نامشخص',
    noOverview: 'خلاصه‌ای موجود نیست',
    noRating: 'بدون امتیاز',
    unknownYear: 'سال نامشخص'
  };

  // AI Translation loading messages
  const aiLoadingMessages = [
    "🤖 هوش مصنوعی در حال پردازش...",
    "🧠 AI is analyzing content...",
    "🔍 جستجو در پایگاه داده فارسی...",
    "📚 مراجعه به فرهنگ لغت تخصصی...",
    "🎬 ترجمه اصطلاحات سینمایی...",
    "✨ بهبود کیفیت ترجمه...",
    "🚀 آماده‌سازی محتوای فارسی...",
    "🎯 تطبیق با فرهنگ ایرانی...",
    "💫 نهایی‌سازی ترجمه...",
    "✅ تکمیل فرآیند ترجمه..."
  ];

  const translateText = async (text) => {
    try {
      // Convert text to string and handle non-string inputs
      let textToTranslate = text;
      if (typeof text !== 'string') {
        if (text === null || text === undefined) {
          return null;
        }
        if (typeof text === 'object') {
          // If it's an object, try to convert to string or return null
          if (Array.isArray(text)) {
            textToTranslate = text.join(', ');
          } else {
            textToTranslate = JSON.stringify(text);
          }
        } else {
          textToTranslate = String(text);
        }
      }

      // Skip translation if text is empty or just whitespace
      if (!textToTranslate || textToTranslate.trim() === '') {
        return null;
      }

      // Build the system prompt with custom instructions if provided
      let systemPrompt = `You are a professional translator specializing in Persian (Farsi) translations for a VOD (Video on Demand) platform. Your translations should be:

1. Natural and fluent Persian that sounds native
2. Suitable for entertainment and media content
3. Use modern, engaging language that appeals to Persian audiences
4. Maintain the original meaning while being culturally appropriate
5. Use proper Persian terminology for film/TV industry terms
6. Keep the tone friendly and accessible for a streaming platform audience

IMPORTANT TRANSLATION RULES:
- If the input is a number (including dates, ratings, IDs, etc.), return the number exactly as is
- If the input is a name (person names, company names, etc.), return the name exactly as is
- If the input is a URL, email, or technical identifier, return it exactly as is
- If the input is not translatable or should remain in English, return the original text
- If the input is an object, array, or complex data structure, return the original input as-is
- Only translate descriptive text, summaries, titles, and content that benefits from translation
- If you receive any non-text data (objects, arrays, numbers, etc.), return them exactly as received
- Always return a string - if you can't translate something, return the original string version`;

      // Add custom prompt instructions if provided
      if (customPromptInstructions.trim()) {
        systemPrompt += `\n\nAdditional Instructions:\n${customPromptInstructions}`;
      }

      systemPrompt += `\n\nTranslate the given text to Persian (Farsi). Only return the translated text, nothing else.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: textToTranslate
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(`Translation failed: ${error.message}`);
      return null;
    }
  };

  const translateContent = async () => {
    if (!movieData) {
      toast.error('No content available to translate');
      return;
    }

    if (!OPENAI_API_KEY) {
      const errorMessage = 'OpenAI API key is missing. Please check your environment variables.';
      toast.error(errorMessage);
      return;
    }
    
    setTranslating(true);
    setTranslationProgress(0);
    setShowPersianSection(true);
    setTranslatedData(null); // Clear previous translations
    
    try {
      const contentToTranslate = {
        title: movieData.title || movieData.name,
        overview: movieData.overview || movieData.biography,
        originalTitle: movieData.original_title || movieData.original_name,
        status: movieData.status,
        placeOfBirth: movieData.place_of_birth,
        tagline: movieData.tagline,
        homepage: movieData.homepage,
        imdbId: movieData.imdb_id,
        budget: movieData.budget,
        revenue: movieData.revenue,
        runtime: movieData.runtime,
        episodeRunTime: movieData.episode_run_time,
        numberOfSeasons: movieData.number_of_seasons,
        numberOfEpisodes: movieData.number_of_episodes,
        lastAirDate: movieData.last_air_date,
        firstAirDate: movieData.first_air_date,
        inProduction: movieData.in_production,
        type: movieData.type,
        createdBy: movieData.created_by,
        networks: movieData.networks,
        productionCountries: movieData.production_countries,
        spokenLanguages: movieData.spoken_languages,
        seasons: movieData.seasons,
        episodeGroups: movieData.episode_groups,
        externalIds: movieData.external_ids,
        images: movieData.images,
        videos: movieData.videos,
        recommendations: movieData.recommendations,
        similar: movieData.similar,
        reviews: movieData.reviews,
        keywords: movieData.keywords,
        changes: movieData.changes,
        credits: movieData.credits,
        alternativeTitles: movieData.alternative_titles,
        contentRatings: movieData.content_ratings,
        watchProviders: movieData.watch_providers,
        translations: movieData.translations,
        releaseDates: movieData.release_dates,
        movieCredits: movieData.movie_credits,
        tvCredits: movieData.tv_credits,
        combinedCredits: movieData.combined_credits,
        images: movieData.images,
        taggedImages: movieData.tagged_images,
        changes: movieData.changes
      };

      // Add genres, production companies, and languages to translation
      const genresToTranslate = movieData.genres ? movieData.genres.map(genre => genre.name) : [];
      const companiesToTranslate = movieData.production_companies ? movieData.production_companies.map(company => company.name) : [];
      const languagesToTranslate = movieData.spoken_languages ? movieData.spoken_languages.map(lang => lang.name) : [];

      const translated = {};
      
      // Translate each field
      let progress = 0;
      const totalFields = Object.keys(contentToTranslate).length + genresToTranslate.length + companiesToTranslate.length + languagesToTranslate.length + (castData?.cast?.length || 0) + (castData?.crew?.length || 0);
      
      for (const [key, value] of Object.entries(contentToTranslate)) {
        // Skip complex objects, arrays, and non-translatable data
        if (value && 
            value !== 'Unknown' && 
            typeof value === 'string' && 
            value.trim() !== '' &&
            !Array.isArray(value) &&
            typeof value !== 'object') {
          const translation = await translateText(value);
          if (translation) {
            translated[key] = translation;
          }
        }
        progress++;
        setTranslationProgress((progress / totalFields) * 100);
      }

      // Translate cast and crew - NO LIMITATIONS for maximum data
      if (castData) {
        const castTranslations = [];
        const crewTranslations = [];
        
        if (castData.cast && castData.cast.length > 0) {
          for (const person of castData.cast) { // No limit - get all cast
            const nameTranslation = await translateText(person.name);
            const characterTranslation = person.character ? await translateText(person.character) : null;
            
            // Always add the person, even if translation fails (use original as fallback)
            castTranslations.push({
              ...person,
              translatedName: nameTranslation || person.name,
              translatedCharacter: characterTranslation || person.character
            });
            progress++;
            setTranslationProgress((progress / totalFields) * 100);
          }
        }

        if (castData.crew && castData.crew.length > 0) {
          for (const person of castData.crew) { // No limit - get all crew
            const nameTranslation = await translateText(person.name);
            const jobTranslation = await translateText(person.job);
            
            // Always add the person, even if translation fails (use original as fallback)
            crewTranslations.push({
              ...person,
              translatedName: nameTranslation || person.name,
              translatedJob: jobTranslation || person.job
            });
            progress++;
            setTranslationProgress((progress / totalFields) * 100);
          }
        }

        translated.cast = castTranslations;
        translated.crew = crewTranslations;
      }

      // Translate genres
      if (genresToTranslate.length > 0) {
        const translatedGenres = [];
        for (const genreName of genresToTranslate) {
          const translation = await translateText(genreName);
          // Always add the genre, even if translation fails (use original as fallback)
          translatedGenres.push(translation || genreName);
          progress++;
          setTranslationProgress((progress / totalFields) * 100);
        }
        translated.genres = translatedGenres;
      }

      // Translate production companies
      if (companiesToTranslate.length > 0) {
        const translatedCompanies = [];
        for (const companyName of companiesToTranslate) {
          const translation = await translateText(companyName);
          // Always add the company, even if translation fails (use original as fallback)
          translatedCompanies.push(translation || companyName);
          progress++;
          setTranslationProgress((progress / totalFields) * 100);
        }
        translated.companies = translatedCompanies;
      }

      // Translate languages
      if (languagesToTranslate.length > 0) {
        const translatedLanguages = [];
        for (const languageName of languagesToTranslate) {
          const translation = await translateText(languageName);
          // Always add the language, even if translation fails (use original as fallback)
          translatedLanguages.push(translation || languageName);
          progress++;
          setTranslationProgress((progress / totalFields) * 100);
        }
        translated.languages = translatedLanguages;
      }

      setTranslatedData(translated);
      setTranslationProgress(100);
      toast.success('Translation completed successfully!');
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error(`Translation failed: ${error.message}`);
      setError('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

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
    setMovieData(null);
    setSearchResults(null);
    setCastData(null);
    setSelectedMovie(null);
    setShowModal(false);
    setTranslatedData(null);

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
      
      setSearchResults(data); // Keep search results
      setMovieData(data); // Also set for compatibility
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

  const handleContentClick = async (item) => {
    setLoading(true);
    setSelectedMovie(item);

    try {
      let movieResponse, castResponse;
      
      if (item.media_type === 'movie') {
        // Fetch comprehensive movie data with all append_to_response parameters
        movieResponse = await fetch(`${BASE_URL}/movie/${item.id}?append_to_response=credits,images,videos,reviews,recommendations,similar,keywords,external_ids,release_dates,translations,watch/providers,alternative_titles,content_ratings`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        castResponse = await fetch(`${BASE_URL}/movie/${item.id}/credits`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (item.media_type === 'tv') {
        // Fetch comprehensive TV data with all append_to_response parameters
        movieResponse = await fetch(`${BASE_URL}/tv/${item.id}?append_to_response=credits,images,videos,reviews,recommendations,similar,keywords,external_ids,content_ratings,watch/providers,alternative_titles,translations,season/1,season/2,season/3,season/4,season/5`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        castResponse = await fetch(`${BASE_URL}/tv/${item.id}/credits`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (item.media_type === 'person') {
        // Fetch comprehensive person data with all append_to_response parameters
        movieResponse = await fetch(`${BASE_URL}/person/${item.id}?append_to_response=images,tagged_images,changes,movie_credits,tv_credits,combined_credits,external_ids`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        // For people, we'll get their combined credits
        castResponse = await fetch(`${BASE_URL}/person/${item.id}/combined_credits`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (movieResponse && movieResponse.ok) {
        const detailedData = await movieResponse.json();
        setMovieData(detailedData);
        
        if (castResponse && castResponse.ok) {
          const castData = await castResponse.json();
          setCastData(castData);
        }
        
        setShowModal(true);
      }
    } catch (err) {
      const errorMessage = `Error fetching content details: ${err.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMovie(null);
    setCastData(null);
    setTranslatedData(null);
    setShowPersianSection(false);
    setTranslationProgress(0);
    setShowCustomPrompt(false);
    setCustomPromptInstructions('');
    // Keep the search results visible
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenreNames = (genreIds) => {
    const genres = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
      10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    return genreIds.map(id => genres[id] || 'Unknown').join(', ');
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

  const renderDetailedContent = (content) => {
    const isPerson = content.media_type === 'person';
    const isTV = content.media_type === 'tv' || content.first_air_date;
    const isMovie = content.media_type === 'movie' || content.release_date;
    const title = content.title || content.name;
    const date = content.release_date || content.first_air_date;
    const posterPath = content.poster_path || content.profile_path;
    
    return (
      <div className="movie-card detailed">
        <div className="movie-header">
          <h3 className="movie-title">{title}</h3>
                     <span className="movie-year">({date ? new Date(date).getFullYear() : 'Unknown'})</span>
                    <div className="content-type-badge-large">
            {isPerson ? '👤 Person' : isTV ? '📺 TV Show' : isMovie ? '🎬 Movie' : '📄 Other'}
          </div>
        </div>
        
        <div className="movie-content">
          <div className="movie-poster">
            {posterPath ? (
              <img 
                src={`https://image.tmdb.org/t/p/w300${posterPath}`} 
                alt={title}
                className="poster-image"
              />
                        ) : (
              <div className="no-poster">No {isPerson ? 'Photo' : 'Poster'} Available</div>
            )}
          </div>
          
          <div className="movie-details">
            <div className="detail-section">
                             <h4>{isPerson ? 'Biography' : 'Summary'}</h4>
                              <p className="movie-overview">
                  {content.overview || content.biography || `No ${isPerson ? 'biography' : 'overview'} available.`}
                </p>
              
            </div>
            
            <div className="detail-section">
                             <h4>Basic Information</h4>
              <div className="info-grid">
                <div className="info-item">
                                     <strong>Original Title:</strong> {content.original_title || content.original_name || title}
                  
                </div>
                <div className="info-item">
                                     <strong>Release Date:</strong> {formatDate(date)}
                </div>
                <div className="info-item">
                                     <strong>Language:</strong> {content.original_language?.toUpperCase() || 'Unknown'}
                </div>
                {!isPerson && (
                  <>
                    <div className="info-item">
                      <strong>Runtime:</strong> {content.runtime || content.episode_run_time?.[0] ? `${content.runtime || content.episode_run_time[0]} minutes` : 'Unknown'}
                    </div>
                    <div className="info-item">
                                             <strong>Status:</strong> {content.status || 'Unknown'}
                      
                    </div>
                  </>
                )}
                {isPerson && (
                  <>
                    <div className="info-item">
                      <strong>Birthday:</strong> {formatDate(content.birthday)}
                    </div>
                    <div className="info-item">
                                             <strong>Place of Birth:</strong> {content.place_of_birth || 'Unknown'}
                      
                    </div>
                  </>
                )}
                <div className="info-item">
                                     <strong>Rating:</strong> {content.vote_average ? `${content.vote_average}/10 (${content.vote_count} votes)` : 'No ratings'}
                </div>
                <div className="info-item">
                                     <strong>Popularity:</strong> {content.popularity?.toFixed(2) || 'Unknown'}
                </div>
              </div>
            </div>

            {content.genres && (
              <div className="detail-section">
                <h4>Genres</h4>
                <div className="genre-tags">
                  {content.genres.map(genre => (
                    <span key={genre.id} className="genre-tag">{genre.name}</span>
                  ))}
                </div>
              </div>
            )}

            {content.production_companies && content.production_companies.length > 0 && (
              <div className="detail-section">
                <h4>Production Companies</h4>
                <div className="company-list">
                  {content.production_companies.map(company => (
                    <div key={company.id} className="company-item">
                      <span className="company-name">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content.spoken_languages && (
              <div className="detail-section">
                <h4>Spoken Languages</h4>
                <div className="language-list">
                  {content.spoken_languages.map(lang => (
                    <span key={lang.iso_639_1} className="language-tag">
                      {lang.name} ({lang.iso_639_1})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCastSection = () => {
    if (!castData) return null;

    const isPerson = movieData?.media_type === 'person';
    const credits = isPerson ? castData.cast || [] : castData.cast || [];

    return (
      <div className="cast-section">
                 <h3>{isPerson ? 'Filmography' : 'Cast & Crew'}</h3>
        
        {credits && credits.length > 0 && (
          <div className="cast-list">
                         <h4>{isPerson ? 'Known For' : 'Cast'}</h4>
            <div className="cast-grid">
              {credits.map(item => (
                <div key={`${item.media_type}-${item.id}`} className="cast-item">
                  <div className="cast-info">
                    <div className="cast-name">{item.title || item.name}</div>
                    <div className="cast-character">
                      {isPerson ? item.character || item.job : item.character}
                    </div>
                    <div className="cast-year">
                      {item.release_date || item.first_air_date ? 
                        new Date(item.release_date || item.first_air_date).getFullYear() : 
                                                 'Unknown Year'}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPerson && castData.crew && castData.crew.length > 0 && (
          <div className="crew-list">
                         <h4>Crew</h4>
            <div className="crew-grid">
              {castData.crew
                .map(person => (
                  <div key={`${person.id}-${person.job}`} className="crew-item">
                    <div className="crew-info">
                      <div className="crew-name">{person.name}</div>
                      <div className="crew-job">{person.job}</div>
                      
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
                {searchResults.results && !showModal && (
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
              ) : (
                <>
                  {renderDetailedContent(searchResults)}
                  {renderCastSection()}
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal for detailed content view */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
              <div className="modal-header">
                <button 
                  onClick={translateContent}
                  disabled={translating}
                  className="translate-button"
                >
                                     {translating ? 'Translating...' : '🌐 Translate to Persian'}
                </button>
              </div>
              <div className="modal-body">
                {renderDetailedContent(movieData)}
                {renderCastSection()}
                
                {/* Persian Section */}
                {showPersianSection && (
                  <div className="persian-section" dir="rtl">
                    <div className="persian-header">
                      <h2>بخش فارسی</h2>
                      <div className="persian-subtitle">Persian Section</div>
                                          <div className="persian-header-actions">
                      <button 
                        onClick={() => {
                          if (customPromptInstructions.trim()) {
                            // If custom prompt exists, use it and translate
                            translateContent();
                          } else {
                            // If no custom prompt, show the custom prompt modal
                            setShowCustomPrompt(true);
                          }
                        }}
                        disabled={translating}
                        className="translate-with-prompt-button"
                      >
                        {customPromptInstructions.trim() ? '🔄 Translate with Custom Prompt' : '⚙️ Add Custom Prompt & Translate'}
                      </button>
                    </div>
                    </div>
                    

                      <div className="ai-translation-loading">
                        <div className="ai-loading-header">
                          <div className="ai-loading-icon">🤖</div>
                          <h3>هوش مصنوعی در حال ترجمه</h3>
                          <p>AI is translating your content...</p>
                        </div>
                        
                        <div className="ai-progress-container">
                          <div className="ai-progress-bar">
                            <div 
                              className="ai-progress-fill" 
                              style={{ width: `${translationProgress}%` }}
                            ></div>
                          </div>
                          <div className="ai-progress-text">
                            {Math.round(translationProgress)}% تکمیل شده
                          </div>
                        </div>
                        
                        <div className="ai-loading-message">
                          {aiLoadingMessages[Math.floor((translationProgress / 100) * aiLoadingMessages.length)] || aiLoadingMessages[aiLoadingMessages.length - 1]}
                        </div>
                        
                        <div className="ai-loading-stats">
                          <div className="ai-stat">
                            <span className="ai-stat-label">محتوا:</span>
                            <span className="ai-stat-value">Content Analysis</span>
                          </div>
                          <div className="ai-stat">
                            <span className="ai-stat-label">ترجمه:</span>
                            <span className="ai-stat-value">Persian Translation</span>
                          </div>
                          <div className="ai-stat">
                            <span className="ai-stat-label">کیفیت:</span>
                            <span className="ai-stat-value">Quality Check</span>
                          </div>
                        </div>
                      </div>
                    )}
                    

                    
                    <div className="persian-content">
                      {/* Persian Summary */}
                      {(translatedData?.overview || movieData.overview || movieData.biography) && (
                        <div className="persian-detail-section">
                          <h3>{persianLabels.summary}</h3>
                          <p className="persian-text">
                            {translatedData?.overview || movieData.overview || movieData.biography}
                          </p>
                        </div>
                      )}
                      
                      {/* Persian Basic Info */}
                      <div className="persian-detail-section">
                        <h3>اطلاعات پایه</h3>
                        <div className="persian-info-grid">
                          {translatedData?.originalTitle && (
                            <div className="persian-info-item">
                              <strong>{persianLabels.originalTitle}:</strong> {translatedData.originalTitle}
                            </div>
                          )}
                          <div className="persian-info-item">
                            <strong>تاریخ انتشار:</strong> {formatDate(movieData?.release_date || movieData?.first_air_date)}
                          </div>
                          <div className="persian-info-item">
                            <strong>{persianLabels.language}:</strong> {movieData.original_language?.toUpperCase() || persianLabels.unknown}
                          </div>
                          {!(movieData?.media_type === 'person') && (
                            <>
                              <div className="persian-info-item">
                                <strong>{persianLabels.runtime}:</strong> {movieData.runtime || movieData.episode_run_time?.[0] ? `${movieData.runtime || movieData.episode_run_time[0]} ${persianLabels.minutes}` : persianLabels.unknown}
                              </div>
                                                        {translatedData?.status && (
                            <div className="persian-info-item">
                              <strong>{persianLabels.status}:</strong> {translatedData.status}
                            </div>
                          )}
                            </>
                          )}
                          {(movieData?.media_type === 'person') && (
                            <>
                              <div className="persian-info-item">
                                <strong>{persianLabels.birthday}:</strong> {formatDate(movieData.birthday)}
                              </div>
                                                        {translatedData?.placeOfBirth && (
                            <div className="persian-info-item">
                              <strong>{persianLabels.placeOfBirth}:</strong> {translatedData.placeOfBirth}
                            </div>
                          )}
                            </>
                          )}
                          <div className="persian-info-item">
                            <strong>{persianLabels.rating}:</strong> {movieData.vote_average ? `${movieData.vote_average}/10 (${movieData.vote_count} ${persianLabels.votes})` : persianLabels.noRating}
                          </div>
                          <div className="persian-info-item">
                            <strong>{persianLabels.popularity}:</strong> {movieData.popularity?.toFixed(2) || persianLabels.unknown}
                          </div>
                        </div>
                      </div>
                      
                      {/* Persian Genres */}
                      {movieData.genres && (
                        <div className="persian-detail-section">
                          <h3>{persianLabels.genres}</h3>
                          <div className="persian-genre-tags">
                            {translatedData?.genres ? (
                              translatedData.genres.map((translatedGenre, index) => (
                                <span key={`translated-genre-${index}`} className="persian-genre-tag">{translatedGenre}</span>
                              ))
                            ) : (
                              movieData.genres.map(genre => (
                                <span key={genre.id} className="persian-genre-tag">{genre.name}</span>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Persian Production Companies */}
                      {movieData.production_companies && movieData.production_companies.length > 0 && (
                        <div className="persian-detail-section">
                          <h3>{persianLabels.productionCompanies}</h3>
                          <div className="persian-company-list">
                            {translatedData?.companies ? (
                              translatedData.companies.map((translatedCompany, index) => (
                                <div key={`translated-company-${index}`} className="persian-company-item">
                                  <span className="persian-company-name">{translatedCompany}</span>
                                </div>
                              ))
                            ) : (
                              movieData.production_companies.map(company => (
                                <div key={company.id} className="persian-company-item">
                                  <span className="persian-company-name">{company.name}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Persian Spoken Languages */}
                      {movieData.spoken_languages && (
                        <div className="persian-detail-section">
                          <h3>{persianLabels.spokenLanguages}</h3>
                          <div className="persian-language-list">
                            {translatedData?.languages ? (
                              translatedData.languages.map((translatedLanguage, index) => (
                                <span key={`translated-language-${index}`} className="persian-language-tag">
                                  {translatedLanguage} ({movieData.spoken_languages[index].iso_639_1})
                                </span>
                              ))
                            ) : (
                              movieData.spoken_languages.map(lang => (
                                <span key={lang.iso_639_1} className="persian-language-tag">
                                  {lang.name} ({lang.iso_639_1})
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Persian Cast */}
                      {(translatedData?.cast || castData?.cast) && (translatedData?.cast?.length > 0 || castData?.cast?.length > 0) && (
                        <div className="persian-detail-section">
                          <h3>{persianLabels.cast}</h3>
                          <div className="persian-cast-grid">
                            {(translatedData?.cast || castData?.cast || []).map(person => (
                              <div key={`persian-cast-${person.id}`} className="persian-cast-item">
                                <div className="persian-cast-name">
                                  {translatedData?.cast?.find(t => t.id === person.id)?.translatedName || person.name}
                                </div>
                                {(translatedData?.cast?.find(t => t.id === person.id)?.translatedCharacter || person.character) && (
                                  <div className="persian-cast-character">
                                    {translatedData?.cast?.find(t => t.id === person.id)?.translatedCharacter || person.character}
                                  </div>
                                )}
                                <div className="persian-cast-year">
                                  {person.release_date || person.first_air_date ? 
                                    new Date(person.release_date || person.first_air_date).getFullYear() : 
                                    persianLabels.unknownYear}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Persian Crew */}
                      {(translatedData?.crew || castData?.crew) && (translatedData?.crew?.length > 0 || castData?.crew?.length > 0) && (
                        <div className="persian-detail-section">
                          <h3>{persianLabels.crew}</h3>
                          <div className="persian-crew-grid">
                            {(translatedData?.crew || castData?.crew || []).map(person => (
                              <div key={`persian-crew-${person.id}`} className="persian-crew-item">
                                <div className="persian-crew-name">
                                  {translatedData?.crew?.find(t => t.id === person.id)?.translatedName || person.name}
                                </div>
                                <div className="persian-crew-job">
                                  {translatedData?.crew?.find(t => t.id === person.id)?.translatedJob || person.job}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Prompt Modal */}
        {showCustomPrompt && (
          <div className="custom-prompt-modal-overlay" onClick={() => setShowCustomPrompt(false)}>
            <div className="custom-prompt-modal" onClick={(e) => e.stopPropagation()}>
              <div className="custom-prompt-header">
                <h3>⚙️ Custom Translation Instructions</h3>
                <button 
                  className="custom-prompt-close"
                  onClick={() => setShowCustomPrompt(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="custom-prompt-content">
                <div className="prompt-section">
                  <label htmlFor="customPromptInstructions">
                    <strong>Additional Instructions for AI Translator:</strong>
                  </label>
                  <p className="prompt-description">
                    Add specific instructions to customize how the AI translates your content. 
                    For example: "Use formal Persian", "Translate names phonetically", "Keep original English terms for technical words", etc.
                  </p>
                  <textarea
                    id="customPromptInstructions"
                    value={customPromptInstructions}
                    onChange={(e) => setCustomPromptInstructions(e.target.value)}
                    placeholder="Enter custom translation instructions here..."
                    className="custom-prompt-textarea"
                    rows="6"
                  />
                </div>
                
                <div className="prompt-examples">
                  <h4>Example Instructions:</h4>
                  <div className="example-list">
                    <div className="example-item">
                      <strong>Formal Style:</strong> "Use formal Persian language suitable for academic or professional content"
                    </div>
                    <div className="example-item">
                      <strong>Casual Style:</strong> "Use casual, everyday Persian that young people would use"
                    </div>
                    <div className="example-item">
                      <strong>Keep Names:</strong> "Keep character names in English, only translate descriptions"
                    </div>
                    <div className="example-item">
                      <strong>Technical Terms:</strong> "Keep technical film terms in English, translate only descriptions"
                    </div>
                    <div className="example-item">
                      <strong>Cultural Adaptation:</strong> "Adapt cultural references to be more relevant to Iranian audiences"
                    </div>
                  </div>
                </div>
                
                <div className="prompt-actions">
                  <button 
                    onClick={() => {
                      setCustomPromptInstructions('');
                      setShowCustomPrompt(false);
                    }}
                    className="clear-prompt-button"
                  >
                    Clear Instructions
                  </button>
                  <button 
                    onClick={() => {
                      setShowCustomPrompt(false);
                      // Automatically start translation after saving custom prompt
                      if (customPromptInstructions.trim()) {
                        setTimeout(() => translateContent(), 100);
                      }
                    }}
                    className="save-prompt-button"
                  >
                    Save & Translate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Version Footer */}
      <footer className="version-footer">
        <div className="version-info">
          <span className="version-tag">v0.1.0</span>
          <span className="commit-hash">#content-fetch</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

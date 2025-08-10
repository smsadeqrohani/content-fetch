import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

function DetailPage() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [movieData, setMovieData] = useState(null);
  const [castData, setCastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translatedData, setTranslatedData] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showPersianSection, setShowPersianSection] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPromptInstructions, setCustomPromptInstructions] = useState('');
  const [expandedCast, setExpandedCast] = useState(false);
  const [expandedCrew, setExpandedCrew] = useState(false);
  const [showTranslationConfirmation, setShowTranslationConfirmation] = useState(false);
  const [showNavigationConfirmation, setShowNavigationConfirmation] = useState(false);

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
    rating: 'امتیاز TMDB',
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
    noRating: 'بدون امتیاز TMDB',
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

  // Get search query and results from navigation state
  const searchQuery = location.state?.searchQuery || '';
  const searchResults = location.state?.searchResults || null;

  // Your TMDB API credentials
  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';
  
  // OpenAI API credentials
  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  useEffect(() => {
    fetchContentDetails();
  }, [mediaType, id]);

  // Prevent accidental page closure during translation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (translating) {
        e.preventDefault();
        e.returnValue = 'Translation is in progress. Are you sure you want to leave? This will cancel the translation and you may be charged for the API call.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [translating]);

  const fetchContentDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      let movieResponse, castResponse;
      
      if (mediaType === 'movie') {
        movieResponse = await fetch(`${BASE_URL}/movie/${id}?append_to_response=credits,images,videos,reviews,recommendations,similar,keywords,external_ids,release_dates,translations,watch/providers,alternative_titles,content_ratings`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        castResponse = await fetch(`${BASE_URL}/movie/${id}/credits`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (mediaType === 'tv') {
        movieResponse = await fetch(`${BASE_URL}/tv/${id}?append_to_response=credits,images,videos,reviews,recommendations,similar,keywords,external_ids,content_ratings,watch/providers,alternative_titles,translations,season/1,season/2,season/3,season/4,season/5`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        castResponse = await fetch(`${BASE_URL}/tv/${id}/credits`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (mediaType === 'person') {
        movieResponse = await fetch(`${BASE_URL}/person/${id}?append_to_response=images,tagged_images,changes,movie_credits,tv_credits,combined_credits,external_ids`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        castResponse = await fetch(`${BASE_URL}/person/${id}/combined_credits`, {
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
      } else {
        throw new Error('Failed to fetch content details');
      }
    } catch (err) {
      const errorMessage = `Error fetching content details: ${err.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

SPECIAL INSTRUCTIONS FOR SUMMARIES AND DESCRIPTIONS:
- When translating movie/TV show summaries and overviews, adopt a storyteller approach
- Make the descriptions engaging and compelling for VOD platform users
- Use narrative techniques that draw viewers in and create interest
- Focus on the emotional and dramatic elements that would appeal to Persian audiences
- Structure the summary to be useful for VOD platform descriptions
- Include hooks and engaging language that encourages viewers to watch
- Balance between being informative and entertaining
- Use Persian storytelling conventions and cultural references when appropriate

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
          temperature: 0.9
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

    // Show confirmation dialog if translation is already in progress
    if (translating) {
      setShowTranslationConfirmation(true);
      return;
    }
    
    setTranslating(true);
    setTranslationProgress(0);
    setShowPersianSection(true);
    setTranslatedData(null); // Clear previous translations
    
    // Immediately scroll to Persian section for better UX
    setTimeout(() => {
      const persianSection = document.getElementById('persian-section');
      if (persianSection) {
        persianSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 50);
    
    try {
      // Clean and prepare content for translation, handling any corrupted data
      const contentToTranslate = {
        title: movieData.title || movieData.name || '',
        overview: movieData.overview || movieData.biography || '',
        originalTitle: movieData.original_title || movieData.original_name || '',
        status: movieData.status || '',
        placeOfBirth: movieData.place_of_birth || '',
        tagline: movieData.tagline || '',
        homepage: movieData.homepage || '',
        imdbId: movieData.imdb_id || '',
        budget: movieData.budget || '',
        revenue: movieData.revenue || '',
        runtime: movieData.runtime || '',
        episodeRunTime: movieData.episode_run_time || '',
        numberOfSeasons: movieData.number_of_seasons || '',
        numberOfEpisodes: movieData.number_of_episodes || '',
        lastAirDate: movieData.last_air_date || '',
        firstAirDate: movieData.first_air_date || '',
        inProduction: movieData.in_production || '',
        type: movieData.type || '',
        createdBy: movieData.created_by || '',
        networks: movieData.networks || '',
        productionCountries: movieData.production_countries || '',
        spokenLanguages: movieData.spoken_languages || '',
        seasons: movieData.seasons || '',
        episodeGroups: movieData.episode_groups || '',
        externalIds: movieData.external_ids || '',
        videos: movieData.videos || '',
        recommendations: movieData.recommendations || '',
        similar: movieData.similar || '',
        reviews: movieData.reviews || '',
        keywords: movieData.keywords || '',
        credits: movieData.credits || '',
        alternativeTitles: movieData.alternative_titles || '',
        contentRatings: movieData.content_ratings || '',
        watchProviders: movieData.watch_providers || '',
        translations: movieData.translations || '',
        releaseDates: movieData.release_dates || '',
        movieCredits: movieData.movie_credits || '',
        tvCredits: movieData.tv_credits || '',
        combinedCredits: movieData.combined_credits || '',
        taggedImages: movieData.tagged_images || ''
      };

      // Add genres to translation
      const genresToTranslate = movieData.genres ? movieData.genres.map(genre => genre.name) : [];

      const translated = {};
      
      // Translate each field with error handling
      let progress = 0;
      const totalFields = Object.keys(contentToTranslate).length + 
                         (Array.isArray(genresToTranslate) ? genresToTranslate.length : 0);
      
      for (const [key, value] of Object.entries(contentToTranslate)) {
        // Skip complex objects, arrays, and non-translatable data
        if (value && 
            value !== 'Unknown' && 
            typeof value === 'string' && 
            value.trim() !== '' &&
            !Array.isArray(value) &&
            typeof value !== 'object') {
          try {
            const translation = await translateText(value);
            if (translation) {
              translated[key] = translation;
            }
          } catch (error) {
            console.warn(`Failed to translate field ${key}:`, value, error);
            // Keep original value if translation fails
            translated[key] = value;
          }
        }
        progress++;
        setTranslationProgress((progress / totalFields) * 100);
      }

      // Translate genres with error handling
      if (Array.isArray(genresToTranslate) && genresToTranslate.length > 0) {
        const translatedGenres = [];
        for (const genreName of genresToTranslate) {
          if (genreName && typeof genreName === 'string') {
            try {
              const translation = await translateText(genreName);
              translatedGenres.push(translation || genreName);
            } catch (error) {
              console.warn('Failed to translate genre:', genreName, error);
              translatedGenres.push(genreName);
            }
            progress++;
            setTranslationProgress((progress / totalFields) * 100);
          }
        }
        translated.genres = translatedGenres;
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

  const handleBackClick = () => {
    if (translating) {
      setShowNavigationConfirmation(true);
      return;
    }
    
    // Navigate back to search page with search query
    navigate('/', { 
      state: { 
        searchQuery: searchQuery,
        searchResults: searchResults
      }
    });
  };

  const handleBackConfirmation = (confirmed) => {
    setShowNavigationConfirmation(false);
    if (confirmed) {
      navigate('/', { 
        state: { 
          searchQuery: searchQuery,
          searchResults: searchResults
        }
      });
    }
  };

  const handleTranslateConfirmation = (confirmed) => {
    setShowTranslationConfirmation(false);
    if (confirmed) {
      // Restart translation
      setTranslating(false);
      setTranslationProgress(0);
      setTimeout(() => translateContent(), 100);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                  <strong>TMDB Rating:</strong> {content.vote_average ? `${content.vote_average}/10 (${content.vote_count} votes)` : 'No ratings'}
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
    const displayCast = expandedCast ? credits : credits.slice(0, 6);
    const displayCrew = expandedCrew ? castData.crew || [] : (castData.crew || []).slice(0, 6);

    return (
      <div className="cast-section">
        <h3>{isPerson ? 'Filmography' : 'Cast & Crew'}</h3>
        
        {credits && credits.length > 0 && (
          <div className="cast-list">
            <h4>{isPerson ? 'Known For' : 'Cast'}</h4>
            <div className="cast-grid">
              {displayCast.map(item => (
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
            {credits.length > 6 && (
              <button 
                className="expand-button"
                onClick={() => setExpandedCast(!expandedCast)}
              >
                {expandedCast ? 'Show Less' : `Show All (${credits.length})`}
              </button>
            )}
          </div>
        )}

        {!isPerson && castData.crew && castData.crew.length > 0 && (
          <div className="crew-list">
            <h4>Crew</h4>
            <div className="crew-grid">
              {displayCrew.map(person => (
                <div key={`${person.id}-${person.job}`} className="crew-item">
                  <div className="crew-info">
                    <div className="crew-name">{person.name}</div>
                    <div className="crew-job">{person.job}</div>
                  </div>
                </div>
              ))}
            </div>
            {castData.crew.length > 6 && (
              <button 
                className="expand-button"
                onClick={() => setExpandedCrew(!expandedCrew)}
              >
                {expandedCrew ? 'Show Less' : `Show All (${castData.crew.length})`}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-button">
            ← Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="detailed-page">
        <div className="detailed-page-header">
          <button className="back-button" onClick={handleBackClick}>
            ← Back to Search
            {searchQuery && ` (${searchQuery})`}
          </button>
          <div className="detailed-page-actions">
            <button 
              onClick={translateContent}
              disabled={translating}
              className="translate-button"
            >
              {translating ? 'Translating...' : '🌐 Translate to Persian'}
            </button>
          </div>
        </div>
        <div className="detailed-page-content">
          {movieData && renderDetailedContent(movieData)}
          {renderCastSection()}
          
          {/* Persian Section */}
          {showPersianSection && (
            <div className="persian-section" dir="rtl" id="persian-section">
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
              
              {translating && (
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
                

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Translation Confirmation Dialog */}
      {showTranslationConfirmation && (
        <div className="confirmation-modal-overlay" onClick={() => setShowTranslationConfirmation(false)}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-header">
              <h3>⚠️ Translation in Progress</h3>
              <button 
                className="confirmation-close"
                onClick={() => setShowTranslationConfirmation(false)}
              >
                ×
              </button>
            </div>
            
            <div className="confirmation-content">
              <div className="confirmation-message">
                <p>A translation is currently in progress. What would you like to do?</p>
              </div>
              
              <div className="confirmation-actions">
                <button 
                  onClick={() => handleBackConfirmation(true)}
                  className="confirmation-button cancel"
                >
                  Cancel Translation & Go Back
                </button>
                <button 
                  onClick={() => handleTranslateConfirmation(true)}
                  className="confirmation-button confirm"
                >
                  Restart Translation
                </button>
                <button 
                  onClick={() => setShowTranslationConfirmation(false)}
                  className="confirmation-button continue"
                >
                  Continue Current Translation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Confirmation Dialog */}
      {showNavigationConfirmation && (
        <div className="confirmation-modal-overlay" onClick={() => setShowNavigationConfirmation(false)}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-header">
              <h3>⚠️ Translation in Progress</h3>
              <button 
                className="confirmation-close"
                onClick={() => setShowNavigationConfirmation(false)}
              >
                ×
              </button>
            </div>
            
            <div className="confirmation-content">
              <div className="confirmation-message">
                <p><strong>Warning:</strong> A translation is currently in progress. If you leave now, the translation will be cancelled and you may still be charged for the API call.</p>
                <p>Are you sure you want to leave?</p>
              </div>
              
              <div className="confirmation-actions">
                <button 
                  onClick={() => handleBackConfirmation(true)}
                  className="confirmation-button cancel"
                >
                  Yes, Leave Page
                </button>
                <button 
                  onClick={() => setShowNavigationConfirmation(false)}
                  className="confirmation-button continue"
                >
                  Stay & Continue Translation
                </button>
              </div>
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
    </div>
  );
}

export default DetailPage;

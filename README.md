# Filmnet Content Fetch

A comprehensive React web application that allows you to search for movies and TV shows using The Movie Database (TMDB) API with beautiful formatting and detailed information.

## ✨ Features

### Search Options
- **Search by Movie Name**: Find movies by entering their title
- **Search by Movie ID**: Get detailed information about a specific movie using its TMDB ID

### Display Modes
- **Formatted View**: Beautiful, organized display of movie information
- **Raw JSON View**: Complete API response for developers
- **Copy to Clipboard**: One-click copying of JSON data

### Movie Information Displayed
- **Summary**: Movie overview and description
- **Basic Information**: Title, release date, language, runtime, status
- **Financial Data**: Budget and revenue information
- **Ratings**: Vote average and vote count
- **Genres**: Movie categories with colorful tags
- **Production Companies**: Studio logos and names
- **Languages**: Available spoken languages
- **Cast & Crew**: Actor photos, names, characters, and crew roles

## 🎬 How to Use

### Search by Name
1. Select "Search by Name" option
2. Enter a movie title (e.g., "The Matrix", "Inception", "Sandman")
3. Click "Search" to get a list of matching movies
4. View formatted cards with basic information

### Search by ID
1. Select "Search by ID" option
2. Enter a TMDB movie ID (e.g., "550" for Fight Club, "13" for Forrest Gump)
3. Click "Search" to get comprehensive movie details
4. View detailed information including cast & crew

### View Modes
- **Formatted View**: Default beautiful display
- **Raw JSON**: Click "Show Raw JSON" to see the complete API response
- **Copy Data**: Click "Copy JSON to Clipboard" to copy the data

## 🔧 API Endpoints Used

- **Search Movies**: `/search/movie` - Returns a list of movies matching the search query
- **Movie Details**: `/movie/{id}` - Returns detailed information about a specific movie
- **Movie Credits**: `/movie/{id}/credits` - Returns cast and crew information

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🔖 Versioning

The app automatically displays the current git commit hash in the bottom-right corner instead of a hardcoded version number. This ensures the version tag is always up-to-date with the latest commit.

- **Development**: Shows the short git commit hash (e.g., `e845761`)
- **Fallback**: Shows `dev` if git is not available
- **Build Process**: The commit hash is automatically set before each build and start

## 🔑 API Credentials

The app is configured with your TMDB API credentials:
- **API Key**: Your Bearer token is already included in the code
- **Base URL**: `https://api.themoviedb.org/3`

## 🎯 Example Movie IDs

Here are some popular movie IDs you can test with:
- **550**: Fight Club
- **13**: Forrest Gump
- **238**: The Godfather
- **278**: The Shawshank Redemption
- **680**: Pulp Fiction
- **299536**: Avengers: Infinity War
- **299534**: Avengers: Endgame

## 📱 Features Breakdown

### Formatted View
- **Movie Cards**: Clean, modern design with hover effects
- **Poster Images**: High-quality movie posters from TMDB
- **Information Grid**: Organized display of movie details
- **Genre Tags**: Colorful, categorized genre display
- **Company Logos**: Production company logos when available

### Cast & Crew Section (ID Search Only)
- **Cast Photos**: Circular profile pictures of actors
- **Character Names**: Actor names and their character roles
- **Crew Information**: Directors, producers, writers, and more
- **Responsive Grid**: Adapts to different screen sizes

### Raw Data View
- **Complete JSON**: Full API response data
- **Copy Functionality**: One-click copying to clipboard
- **Formatted Display**: Properly indented JSON for readability
- **Selectable Text**: Easy text selection for copying

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradients
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Hover Effects**: Interactive elements with smooth animations
- **Color Coding**: Different colors for different types of information
- **Typography**: Clear, readable fonts with proper hierarchy

## 🔄 State Management

The app uses React hooks for state management:
- `useState` for local component state
- Async/await for API calls
- Error handling for failed requests
- Loading states for better UX

## 📋 Data Structure

### Search Results (by name)
```json
{
  "page": 1,
  "results": [...],
  "total_pages": 4,
  "total_results": 73
}
```

### Movie Details (by ID)
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "...",
  "release_date": "1999-10-15",
  "genres": [...],
  "cast": [...],
  "crew": [...]
}
```

## 🛠️ Technologies Used

- **React 18**: Modern React with hooks
- **TMDB API v3**: Comprehensive movie database
- **CSS3**: Modern styling with gradients and animations
- **Fetch API**: Native JavaScript for HTTP requests
- **Responsive Design**: Mobile-first approach

## 🔮 Future Enhancements

Potential features for future development:
- **Pagination**: Navigate through multiple pages of results
- **Advanced Filtering**: Filter by year, genre, rating, etc.
- **Favorites**: Save favorite movies
- **Similar Movies**: Get recommendations
- **Trailers**: Embed movie trailers
- **Reviews**: User and critic reviews
- **Watchlist**: Create personal watchlists
- **Dark Mode**: Toggle between light and dark themes

## 📄 License

This project is open source and available under the MIT License.

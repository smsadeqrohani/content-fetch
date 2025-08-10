# 🎬 Filmnet Content Fetch

**AI-Powered Movie & TV Show Search & Translation Platform**

A comprehensive React web application that allows you to discover movies, TV shows, and celebrities using The Movie Database (TMDB) API with AI-powered Persian translation capabilities. Get detailed information, cast & crew details, and instant translations powered by OpenAI.

## ✨ Key Features

### 🔍 Advanced Search Capabilities
- **Multi-Content Search**: Search for movies, TV shows, and celebrities
- **Smart Filtering**: Sort by release date, popularity, and more
- **Real-time Results**: Instant search with live updates
- **Comprehensive Database**: Access to TMDB's vast entertainment database

### 🤖 AI-Powered Translation
- **Persian Translation**: Instant translation of content to Persian
- **OpenAI Integration**: Powered by advanced language models
- **Custom Instructions**: Add specific translation preferences
- **Quality Assurance**: Professional-grade translation output

### 📱 Modern User Experience
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Page Navigation**: Smooth transitions between search and detail views
- **Glass Morphism UI**: Beautiful modern design with backdrop blur effects
- **Dark Theme**: Eye-friendly dark interface

### 🎯 Detailed Content Information
- **Comprehensive Details**: Plot summaries, cast, crew, ratings
- **Production Information**: Companies, languages, release dates
- **Visual Content**: High-quality posters and images
- **Interactive Elements**: Expandable sections and hover effects

## 🚀 How to Use

### 🔍 Search Content
1. **Enter Search Query**: Type the name of a movie, TV show, or celebrity
2. **Select Content Type**: Choose from Movies, TV Shows, or People
3. **View Results**: Browse through search results with sorting options
4. **Click for Details**: Select any item to view comprehensive information

### 📄 Content Details
1. **Detailed Information**: View complete content details, cast, and crew
2. **AI Translation**: Click "🌐 Translate to Persian" for instant translation
3. **Custom Instructions**: Add specific translation preferences if needed
4. **Navigation**: Use back button to return to search results

### 🎯 Translation Features
- **Instant Translation**: Get Persian translations powered by OpenAI
- **Progress Tracking**: Real-time translation progress indicator
- **Custom Prompts**: Add specific translation instructions
- **Quality Output**: Professional-grade Persian translations

## 🔧 API Integration

### TMDB API Endpoints
- **Search**: `/search/movie`, `/search/tv`, `/search/person`
- **Details**: `/movie/{id}`, `/tv/{id}`, `/person/{id}`
- **Credits**: `/movie/{id}/credits`, `/tv/{id}/credits`

### OpenAI API
- **Translation Service**: GPT-powered Persian translation
- **Custom Instructions**: Support for specific translation preferences
- **Quality Assurance**: Professional translation output

## 🛠️ Technologies Used

- **React 19**: Modern React with hooks and functional components
- **React Router DOM**: Client-side routing and navigation
- **TMDB API v3**: Comprehensive movie, TV, and celebrity database
- **OpenAI API**: Advanced AI-powered translation services
- **React Toastify**: Beautiful notification system
- **CSS3**: Modern styling with glassmorphism and animations
- **Responsive Design**: Mobile-first approach

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### Getting API Keys
- **TMDB API**: Sign up at [themoviedb.org](https://www.themoviedb.org/settings/api)
- **OpenAI API**: Get your key from [platform.openai.com](https://platform.openai.com/api-keys)

## 🔧 API Endpoints Used

### TMDB API
- **Search Movies**: `/search/movie` - Returns a list of movies matching the search query
- **Search TV Shows**: `/search/tv` - Returns a list of TV shows matching the search query
- **Search People**: `/search/person` - Returns a list of celebrities matching the search query
- **Movie Details**: `/movie/{id}` - Returns detailed information about a specific movie
- **TV Details**: `/tv/{id}` - Returns detailed information about a specific TV show
- **Person Details**: `/person/{id}` - Returns detailed information about a specific person
- **Movie Credits**: `/movie/{id}/credits` - Returns cast and crew information
- **TV Credits**: `/tv/{id}/credits` - Returns cast and crew information

### OpenAI API
- **Translation**: `/v1/chat/completions` - AI-powered Persian translation service

## 📱 Features Breakdown

### 🔍 Search Interface
- **Multi-Content Search**: Search across movies, TV shows, and celebrities
- **Smart Sorting**: Sort by release date, popularity, and ratings
- **Real-time Results**: Instant search with live updates
- **Responsive Grid**: Beautiful card layout for search results

### 📄 Detail Pages
- **Comprehensive Information**: Complete content details and metadata
- **Cast & Crew**: Detailed actor and crew information with photos
- **Production Details**: Companies, languages, release information
- **Interactive Elements**: Expandable sections and hover effects

### 🤖 AI Translation
- **Persian Translation**: Professional-grade Persian translations
- **Progress Tracking**: Real-time translation progress
- **Custom Instructions**: Add specific translation preferences
- **Quality Assurance**: OpenAI-powered translation quality

### 🎨 User Interface
- **Glass Morphism**: Modern backdrop blur effects
- **Dark Theme**: Eye-friendly dark interface
- **Responsive Design**: Perfect on all devices
- **Smooth Animations**: Professional transitions and effects

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/filmnet-content-fetch.git
   cd filmnet-content-fetch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to view it in the browser.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── SearchPage.js      # Main search interface
│   └── DetailPage.js      # Content detail pages
├── App.js                 # Main app component with routing
├── App.css               # Global styles and components
└── index.js              # App entry point
```

## 🎯 Example Content IDs

Here are some popular content IDs you can test with:

### Movies
- **550**: Fight Club
- **13**: Forrest Gump
- **238**: The Godfather
- **278**: The Shawshank Redemption
- **680**: Pulp Fiction
- **299536**: Avengers: Infinity War
- **299534**: Avengers: Endgame

### TV Shows
- **1399**: Game of Thrones
- **1396**: Breaking Bad
- **1398**: Stranger Things
- **1395**: The Walking Dead

### People
- **976**: Jason Statham
- **976**: Tom Hanks
- **976**: Leonardo DiCaprio

## 📋 Data Structure

### Search Results
```json
{
  "page": 1,
  "results": [...],
  "total_pages": 4,
  "total_results": 73
}
```

### Content Details
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

### Translation Response
```json
{
  "overview": "Persian translation of overview",
  "originalTitle": "Persian translation of title",
  "genres": ["Persian genre names"],
  "cast": [...],
  "crew": [...]
}
```

## 🔄 State Management

The app uses React hooks for state management:
- `useState` for local component state
- `useEffect` for side effects and API calls
- `useNavigate` and `useLocation` for routing
- `useParams` for URL parameters
- Async/await for API calls with proper error handling

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

- **React 19**: Modern React with hooks and functional components
- **React Router DOM**: Client-side routing and navigation
- **TMDB API v3**: Comprehensive movie, TV, and celebrity database
- **OpenAI API**: Advanced AI-powered translation services
- **React Toastify**: Beautiful notification system
- **CSS3**: Modern styling with glassmorphism and animations
- **Responsive Design**: Mobile-first approach

## 🔮 Future Enhancements

Potential features for future development:
- **Pagination**: Navigate through multiple pages of results
- **Advanced Filtering**: Filter by year, genre, rating, etc.
- **Favorites**: Save favorite content
- **Similar Content**: Get recommendations
- **Trailers**: Embed movie and TV show trailers
- **Reviews**: User and critic reviews
- **Watchlist**: Create personal watchlists
- **Multi-language Support**: Support for more languages beyond Persian
- **Offline Mode**: Cache content for offline viewing
- **User Accounts**: Personalized experience with saved preferences
- **Social Features**: Share content and reviews
- **Advanced Analytics**: Content popularity and trends

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TMDB**: For providing comprehensive movie and TV show data
- **OpenAI**: For AI-powered translation capabilities
- **React Community**: For the amazing React ecosystem
- **Vercel**: For seamless deployment and hosting

## 📞 Support

If you have any questions or need support, please open an issue on GitHub or contact us at contact@filmnet-content-fetch.com.

---

**Made with ❤️ by Filmnet Content Fetch Team**



import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import SearchPage from './components/SearchPage';
import DetailPage from './components/DetailPage';

function App() {
  return (
    <Router>
    <div className="App">
      <ToastContainer 
        position="bottom-right"
        theme="dark"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px'
        }}
      />
        
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/detail/:mediaType/:id" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      
      {/* Version Footer */}
      <footer className="version-footer">
        <div className="version-info">
          <span className="version-tag">v0.1.0</span>
          <span className="commit-hash">#content-fetch</span>
        </div>
      </footer>
    </div>
    </Router>
  );
}

export default App;

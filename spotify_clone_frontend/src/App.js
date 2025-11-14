import React, { useState, useEffect } from 'react';
import './App.css';
import SpotifyClone from './pages/SpotifyClone';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('dark'); // default to dark to match design

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App" style={{ background: 'transparent' }}>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <SpotifyClone />
    </div>
  );
}

export default App;

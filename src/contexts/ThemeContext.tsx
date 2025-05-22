import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  themeMode: 'light' | 'dark' | 'auto';
  toggleDarkMode: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  themeMode: 'light',
  toggleDarkMode: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>(() => {
    // Check local storage for theme mode preference
    const stored = localStorage.getItem('themeMode');
    if (stored === 'light' || stored === 'dark' || stored === 'auto') {
      return stored as 'light' | 'dark' | 'auto';
    }
    return 'auto'; // Default to auto
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (themeMode === 'light') return false;
    if (themeMode === 'dark') return true;
    // If auto, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode !== 'auto') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  useEffect(() => {
    // Update isDarkMode when themeMode changes
    if (themeMode === 'light') {
      setIsDarkMode(false);
    } else if (themeMode === 'dark') {
      setIsDarkMode(true);
    } else if (themeMode === 'auto') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    
    // Save theme mode preference
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    // Update document class when dark mode changes
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, themeMode, toggleDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
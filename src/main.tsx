import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import environment helper to force production mode
import './utils/environment';

// Import token patch to fix User not authenticated issue
import './utils/tokenPatch';

// Force production mode in localStorage
localStorage.setItem('useRealApi', 'true');

// Log environment information
console.log('Environment mode:', import.meta.env.MODE);
console.log('Production mode:', import.meta.env.PROD);
console.log('Using real API: true');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

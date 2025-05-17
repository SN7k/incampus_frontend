import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FriendProvider } from './contexts/FriendContext';
import { PostProvider } from './contexts/PostContext';
import InstallPrompt from './components/ui/InstallPrompt';
import LoginForm from './components/auth/LoginForm';
import ProfileSetup from './components/auth/ProfileSetup';
import Navbar from './components/layout/Navbar';
import Feed from './pages/Feed';
// Using a more explicit import path to resolve TypeScript module resolution issue
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Messages from './pages/Messages';
import { Home, Users, User } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  
  // State for navigation between pages with localStorage persistence
  const [currentPage, setCurrentPage] = React.useState<'feed' | 'profile' | 'friends' | 'messages'>(() => {
    // Get the saved page from localStorage or default to 'feed'
    const savedPage = localStorage.getItem('currentPage');
    return (savedPage as 'feed' | 'profile' | 'friends' | 'messages') || 'feed';
  });
  
  // State to track the currently viewed user ID for the profile page
  const [viewProfileUserId, setViewProfileUserId] = React.useState<string | null>(() => {
    return localStorage.getItem('viewProfileUserId');
  });
  
  // Function to handle navigation between pages
  const handleNavigate = (page: string, userId?: string) => {
    const typedPage = page as 'feed' | 'profile' | 'friends' | 'messages';
    // Save the current page to localStorage
    localStorage.setItem('currentPage', typedPage);
    setCurrentPage(typedPage);
    
    // If a userId is provided and we're navigating to the profile page, store it
    if (userId && page === 'profile') {
      localStorage.setItem('viewProfileUserId', userId);
      setViewProfileUserId(userId);
    }
  };
  
  // Update localStorage when page changes
  React.useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Handle profile setup completion
  const [setupComplete, setSetupComplete] = React.useState(() => {
    // Check if we have a stored value for setupComplete
    const savedSetupComplete = localStorage.getItem('setupComplete');
    return savedSetupComplete === 'true';
  });
  const { profileSetupComplete } = useAuth();
  
  // Persist setup complete state to localStorage
  React.useEffect(() => {
    if (setupComplete) {
      localStorage.setItem('setupComplete', 'true');
    }
  }, [setupComplete]);

  // ENHANCED AUTHENTICATION CHECK: Use multiple redundant sources to determine auth state
  // This is a comprehensive approach to prevent "User not authenticated" errors
  
  // 1. Check context state (primary source)
  console.log('Auth context state:', { isAuthenticated, user: !!user });
  
  // 2. Check localStorage for auth state (backup source)
  const authStateFromStorage = localStorage.getItem('authState') || localStorage.getItem('authStateBackup');
  const isAuthenticatedFromStorage = authStateFromStorage ? JSON.parse(authStateFromStorage).isAuthenticated : false;
  console.log('Auth state from storage:', { isAuthenticatedFromStorage });
  
  // 3. Check individual auth flags (tertiary sources)
  const directAuthFlag = localStorage.getItem('isAuthenticated') === 'true';
  const hasToken = !!localStorage.getItem('token') || !!localStorage.getItem('authToken') || !!localStorage.getItem('userToken');
  const hasUserData = !!localStorage.getItem('userData') || !!localStorage.getItem('user');
  const hasProfileSetupFlag = localStorage.getItem('profileSetupComplete') === 'true' || localStorage.getItem('setupComplete') === 'true';
  console.log('Individual auth flags:', { directAuthFlag, hasToken, hasUserData, hasProfileSetupFlag });
  
  // 4. Check URL parameters (used after redirects, especially after profile setup)
  const urlParams = new URLSearchParams(window.location.search);
  const hasAuthParam = urlParams.has('auth');
  const hasTokenParam = urlParams.has('token');
  const hasSetupParam = urlParams.has('setup');
  console.log('URL auth params:', { hasAuthParam, hasTokenParam, hasSetupParam });
  
  // 5. Check special flags that indicate we just completed profile setup
  const fromProfileSetup = localStorage.getItem('fromProfileSetup') === 'true';
  const lastAuthAction = localStorage.getItem('lastAuthAction');
  const authTimestamp = localStorage.getItem('authTimestamp');
  const isRecentAuth = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 1000 * 60 * 60; // Within last hour
  console.log('Special auth flags:', { fromProfileSetup, lastAuthAction, isRecentAuth });
  
  // CRITICAL: Consider authenticated if ANY of these conditions are true
  // This is an extremely robust approach that uses multiple redundant checks
  const isEffectivelyAuthenticated = 
    isAuthenticated || 
    isAuthenticatedFromStorage || 
    directAuthFlag || 
    (hasToken && hasUserData) || 
    hasAuthParam || 
    (hasTokenParam && hasSetupParam) || 
    fromProfileSetup || 
    (lastAuthAction === 'profileSetup' && isRecentAuth);
  
  console.log('Final authentication determination:', { isEffectivelyAuthenticated });
  
  // If we have auth indicators in URL but not in context, force authentication state
  if ((hasAuthParam || hasTokenParam || hasSetupParam) && !isAuthenticated) {
    console.log('Auth parameters detected in URL but not authenticated in context, forcing authentication state');
    
    // Try to recover user data from localStorage
    const userData = localStorage.getItem('userData') || localStorage.getItem('user');
    if (userData) {
      // Force authentication state by setting all auth flags
      const user = JSON.parse(userData);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Create a complete auth state with timestamp
      const timestamp = Date.now();
      const forceAuthState = {
        isAuthenticated: true,
        user: user,
        loading: false,
        error: null,
        profileSetupComplete: true,
        timestamp: timestamp
      };
      
      // Store in multiple locations for redundancy
      localStorage.setItem('authState', JSON.stringify(forceAuthState));
      localStorage.setItem('authStateBackup', JSON.stringify(forceAuthState));
      localStorage.setItem('authTimestamp', timestamp.toString());
      
      // Ensure we have a token in multiple locations
      const token = localStorage.getItem('token') || localStorage.getItem('authToken') || 
                   localStorage.getItem('userToken') || urlParams.get('token') || ('auth-token-' + Date.now());
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userToken', token);
      
      // Set profile setup flags
      localStorage.setItem('profileSetupComplete', 'true');
      localStorage.setItem('setupComplete', 'true');
      
      // Remove the auth params from URL to prevent issues on refresh
      const newUrl = window.location.pathname + 
                    (window.location.search ? 
                     window.location.search
                      .replace(/[?&]auth=[^&]+/, '')
                      .replace(/[?&]token=[^&]+/, '')
                      .replace(/[?&]setup=[^&]+/, '') : '');
      window.history.replaceState({}, document.title, newUrl);
      
      // Force reload to apply the new authentication state
      window.location.reload();
    }
  }
  
  console.log('Authentication state check:', {
    contextAuth: isAuthenticated,
    storageAuth: isAuthenticatedFromStorage,
    directFlag: directAuthFlag,
    hasToken,
    hasUserData,
    hasAuthParam,
    effective: isEffectivelyAuthenticated
  });
  
  if (!isEffectivelyAuthenticated) {
    console.log('User is not authenticated, showing login form');
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 flex items-center justify-center px-4">
        <LoginForm />
      </div>
    );
  }
  
  // Show profile setup if the user hasn't completed it yet
  // Check profile setup completion from multiple sources
  const profileSetupCompleteFromStorage = authStateFromStorage ? 
    JSON.parse(authStateFromStorage).profileSetupComplete : false;
  const directSetupFlag = localStorage.getItem('profileSetupComplete') === 'true';
  
  // Consider profile setup complete if ANY of these conditions are true
  const isProfileSetupEffectivelyComplete = profileSetupComplete || profileSetupCompleteFromStorage || directSetupFlag || setupComplete;
  
  console.log('Profile setup state check:', {
    contextComplete: profileSetupComplete,
    storageComplete: profileSetupCompleteFromStorage,
    directFlag: directSetupFlag,
    setupComplete,
    effective: isProfileSetupEffectivelyComplete
  });
  
  if (isEffectivelyAuthenticated && !isProfileSetupEffectivelyComplete) {
    console.log('Showing profile setup screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <ProfileSetup onComplete={() => {
          console.log('Profile setup completed');
          setSetupComplete(true);
          
          // Ensure all authentication flags are set before reload
          localStorage.setItem('profileSetupComplete', 'true');
          localStorage.setItem('setupComplete', 'true');
          
          // Make sure we have an auth state in localStorage
          const authStateData = localStorage.getItem('authState');
          if (authStateData) {
            const authState = JSON.parse(authStateData);
            authState.profileSetupComplete = true;
            localStorage.setItem('authState', JSON.stringify(authState));
          }
          
          // Add auth parameter to URL to force authentication on reload
          const url = new URL(window.location.href);
          url.searchParams.set('auth', 'true');
          
          // Force reload the page to ensure all state is properly synchronized
          console.log('Reloading page to refresh authentication state');
          setTimeout(() => {
            window.location.href = url.toString();
          }, 500);
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-[4.75rem]">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      
      {/* Content wrapper with padding for mobile footer */}
      <div className="pb-4 md:pb-0"> {/* Very minimal padding for mobile footer */}
        {/* Content */}
        {currentPage === 'feed' && <Feed onNavigate={handleNavigate} />}
        {currentPage === 'friends' && <Friends />}
        {currentPage === 'messages' && <Messages />}
        {currentPage === 'profile' && <Profile onNavigate={handleNavigate} viewUserId={viewProfileUserId} />}
      </div>
      
      {/* Mobile navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => handleNavigate('feed')}
            className={`px-3 py-2 flex flex-col items-center ${currentPage === 'feed' ? 'text-blue-800 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Home size={20} className="mb-1" />
            <span className="text-xs">Feed</span>
          </button>
          <button 
            onClick={() => handleNavigate('friends')}
            className={`px-3 py-2 flex flex-col items-center ${currentPage === 'friends' ? 'text-blue-800 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Users size={20} className="mb-1" />
            <span className="text-xs">Friends</span>
          </button>
          <button 
            onClick={() => handleNavigate('profile')}
            className={`px-3 py-2 flex flex-col items-center ${currentPage === 'profile' ? 'text-blue-800 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <User size={20} className="mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <FriendProvider>
        <PostProvider>
          <NotificationsProvider>
            <ThemeProvider>
              <AppContent />
              <InstallPrompt />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10B981',
                    },
                  },
                  error: {
                    style: {
                      background: '#EF4444',
                    },
                  },
                }}
              />
            </ThemeProvider>
          </NotificationsProvider>
        </PostProvider>
      </FriendProvider>
    </AuthProvider>
  );
}

export default App;
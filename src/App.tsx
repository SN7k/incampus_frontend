import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FriendProvider } from './contexts/FriendContext';
import { PostProvider } from './contexts/PostContext';
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
  const { isAuthenticated } = useAuth();
  
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
  const { profileSetupComplete, isAuthenticated: authContextAuthenticated } = useAuth();
  
  // Persist setup complete state to localStorage
  React.useEffect(() => {
    if (setupComplete) {
      localStorage.setItem('setupComplete', 'true');
    }
  }, [setupComplete]);

  // Check if the user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 flex items-center justify-center px-4">
        <LoginForm />
      </div>
    );
  }
  
  // Show profile setup if the user hasn't completed it yet
  if (authContextAuthenticated && !profileSetupComplete && !setupComplete) {
    console.log('Showing profile setup screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <ProfileSetup onComplete={() => {
          console.log('Profile setup completed');
          setSetupComplete(true);
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
            </ThemeProvider>
          </NotificationsProvider>
        </PostProvider>
      </FriendProvider>
    </AuthProvider>
  );
}

export default App;
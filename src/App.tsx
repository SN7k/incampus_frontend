import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import OtpVerification from './components/auth/OtpVerification';
import ProfileSetup from './components/auth/ProfileSetup';
import FriendSuggestions from './components/auth/FriendSuggestions';
import Navbar from './components/layout/Navbar';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Settings from './pages/Settings';
import { User } from './types';

// Mock data for friend requests (in a real app, this would come from an API)
const mockFriendRequests = [
  { id: 5, name: 'Priya Sharma', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', department: 'Mathematics', mutualFriends: 3 },
  { id: 6, name: 'James Wilson', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', department: 'Physics', mutualFriends: 1 },
];

type RegistrationStep = 'login' | 'signup' | 'otp' | 'profile-setup' | 'friend-suggestions';
type AppPage = 'feed' | 'profile' | 'friends' | 'settings';

function AppContent() {
  const { isAuthenticated, login } = useAuth();
  const { isDarkMode } = useTheme();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('login');
  
  // Initialize currentPage from localStorage or default to 'feed'
  const [currentPage, setCurrentPage] = React.useState<AppPage>(() => {
    const savedPage = localStorage.getItem('currentPage');
    return (savedPage === 'profile' || savedPage === 'feed' || savedPage === 'friends' || savedPage === 'settings') ? savedPage as AppPage : 'feed';
  });
  
  // State to track friend requests
  const [hasFriendRequests, setHasFriendRequests] = useState(mockFriendRequests.length > 0);
  
  // Update friend requests state when they change
  React.useEffect(() => {
    // Listen for changes to friend requests
    const handleFriendRequestsChange = (event: CustomEvent) => {
      if (event.detail?.hasRequests !== undefined) {
        setHasFriendRequests(event.detail.hasRequests);
      }
    };
    
    window.addEventListener('friendRequestsChange', handleFriendRequestsChange as EventListener);
    return () => {
      window.removeEventListener('friendRequestsChange', handleFriendRequestsChange as EventListener);
    };
  }, []);
  
  // Listen for navigation events from Navbar
  React.useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      if (event.detail?.page) {
        setCurrentPage(event.detail.page);
      }
    };
    
    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);
  
  // Save currentPage to localStorage whenever it changes and dispatch page change event
  React.useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
    
    // Dispatch a custom event to notify components about page change
    window.dispatchEvent(new CustomEvent('pageChange', { detail: { page: currentPage } }));
  }, [currentPage]);
  
  // Store user data during the registration flow
  const [pendingUserData, setPendingUserData] = useState<{
    fullName: string;
    email: string;
    universityId?: string;
    program?: string;
    batch?: string;
    department?: string;
    role: 'student' | 'faculty';
  } | null>(null);

  const [pendingOtp, setPendingOtp] = useState<string | null>(null);

  const handleSignupSuccess = (userData: {
    fullName: string;
    email: string;
    universityId?: string;
    program?: string;
    batch?: string;
    department?: string;
    role: 'student' | 'faculty';
  }, otp?: string) => {
    setPendingUserData(userData);
    setPendingOtp(otp || null);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = () => {
    setRegistrationStep('profile-setup');
  };

  const handleResendOtp = async () => {
    // In a real app, you would call your backend to resend the OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Just a simulation for demo purposes
  };

  // Store the user profile data during registration
  const [pendingProfileData, setPendingProfileData] = useState<Partial<User> | null>(null);
  
  const handleProfileComplete = async (profileData: Partial<User>) => {
    // Store the profile data and move to friend suggestions
    setPendingProfileData(profileData);
    setRegistrationStep('friend-suggestions');
  };
  
  const handleSkipProfile = () => {
    // Create minimal profile data with default avatar and explicitly set bio to empty string
    setPendingProfileData({
      avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pendingUserData?.fullName || 'User'),
      bio: '' // Explicitly set bio to empty string when skipping profile setup
    });
    setRegistrationStep('friend-suggestions');
  };
  
  const handleFriendSuggestionsComplete = async (followedUsers: string[]) => {
    // In a real app, you would send this to your backend
    // For demo, we'll simulate a successful registration and auto-login
    
    // Create a mock user with the combined data
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: pendingUserData?.fullName || '',
      universityId: pendingUserData?.universityId || `BWU/${pendingUserData?.program || 'BCA'}/23/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      role: pendingUserData?.role || 'student',
      avatar: pendingProfileData?.avatar || '',
      bio: pendingProfileData?.bio,
      coverPhoto: pendingProfileData?.coverPhoto
    };
    
    // Store the new user in localStorage for the login function to find
    localStorage.setItem('pendingRegistration', JSON.stringify(mockUser));
    
    // Auto-login the user
    try {
      // This is a mock login - in a real app you'd get a token from your backend
      // and then fetch the user profile
      await login(mockUser.universityId, 'password', mockUser.role);
      
      // Initialize friend system for new user
      const defaultFriends: { id: string; name: string; avatar: string }[] = [];
      localStorage.setItem('userFriends', JSON.stringify(defaultFriends));
      
      // In a real app, you would also store the followed users
      console.log('Followed users:', followedUsers);
      
      // Set current page to feed to ensure the user sees the feed after login
      setCurrentPage('feed');
    } catch (error) {
      console.error('Failed to auto-login after registration', error);
      // Fall back to login screen
      setRegistrationStep('login');
    }
  };

  // Apply dark mode to body element to ensure full page coverage
  React.useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#111827' : '#f9fafb';
    document.body.style.color = isDarkMode ? '#f3f4f6' : '#111827';
  }, [isDarkMode]);
  
  // Listen for authentication state changes and update registration step when user logs out
  React.useEffect(() => {
    if (!isAuthenticated) {
      // When user logs out, reset to login page
      setRegistrationStep('login');
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center px-4 transition-colors duration-200">
        {registrationStep === 'signup' && (
          <SignupForm 
            onBackToLogin={() => setRegistrationStep('login')} 
            onSignupSuccess={handleSignupSuccess}
          />
        )}
        
        {registrationStep === 'login' && (
          <LoginForm onShowSignup={() => setRegistrationStep('signup')} />
        )}
        
        {registrationStep === 'otp' && pendingUserData && (
          <OtpVerification 
            email={pendingUserData.email}
            onVerificationComplete={handleOtpVerificationComplete}
            onResendOtp={handleResendOtp}
            providedOtp={pendingOtp || undefined}
          />
        )}
        
        {registrationStep === 'profile-setup' && pendingUserData && (
          <ProfileSetup 
            userInfo={{
              fullName: pendingUserData.fullName,
              email: pendingUserData.email,
              role: pendingUserData.role
            }}
            onProfileComplete={handleProfileComplete}
            onSkip={handleSkipProfile}
          />
        )}
        
        {registrationStep === 'friend-suggestions' && pendingUserData && pendingProfileData && (
          <FriendSuggestions
            onComplete={handleFriendSuggestionsComplete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => {
              setCurrentPage('feed');
              localStorage.setItem('currentPage', 'feed');
            }}
            className={`px-4 py-2 ${currentPage === 'feed' ? 'text-blue-800 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Feed
          </button>
          <button 
            onClick={() => {
              setCurrentPage('friends');
              localStorage.setItem('currentPage', 'friends');
            }}
            className={`px-4 py-2 ${currentPage === 'friends' ? 
              hasFriendRequests ? 'text-red-600 dark:text-red-400 font-medium' : 'text-blue-800 dark:text-blue-400 font-medium' 
              : hasFriendRequests ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Friends
          </button>
          <button 
            onClick={() => {
              setCurrentPage('profile');
              localStorage.setItem('currentPage', 'profile');
              // Clear any stored profile ID to ensure we show the user's own profile
              localStorage.removeItem('viewProfileUserId');
            }}
            className={`px-4 py-2 ${currentPage === 'profile' ? 'text-blue-800 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}
          >
            Profile
          </button>
        </div>
      </div>
      
      {isAuthenticated && currentPage === 'feed' && <Feed />}
      {isAuthenticated && currentPage === 'profile' && <Profile />}
      {isAuthenticated && currentPage === 'friends' && <Friends />}
      {isAuthenticated && currentPage === 'settings' && <Settings />}

    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
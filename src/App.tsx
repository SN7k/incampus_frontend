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

type RegistrationStep = 'login' | 'signup' | 'otp' | 'profile-setup' | 'friend-suggestions';
type AppPage = 'feed' | 'profile' | 'friends' | 'settings';

function AppContent() {
  const { isAuthenticated, updateProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('login');
  
  // Initialize currentPage from localStorage or default to 'feed'
  const [currentPage, setCurrentPage] = React.useState<AppPage>(() => {
    const savedPage = localStorage.getItem('currentPage');
    return (savedPage === 'profile' || savedPage === 'feed' || savedPage === 'friends' || savedPage === 'settings') ? savedPage as AppPage : 'feed';
  });
  
  // State to track friend requests
  const [hasFriendRequests, setHasFriendRequests] = useState(false);
  
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

  const handleSignupSuccess = (userData: {
    fullName: string;
    email: string;
    universityId?: string;
    program?: string;
    batch?: string;
    department?: string;
    role: 'student' | 'faculty';
  }) => {
    setPendingUserData(userData);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = () => {
    // User is now authenticated after OTP verification
    // Move to profile setup
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
    const minimalProfileData = {
      avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pendingUserData?.fullName || 'User'),
      bio: '' // Explicitly set bio to empty string when skipping profile setup
    };
    setPendingProfileData(minimalProfileData);
    setRegistrationStep('friend-suggestions');
  };
  
  const handleFriendSuggestionsComplete = async (followedUsers: string[]) => {
    try {
      // Since the user is already authenticated after OTP verification,
      // we just need to update their profile and redirect to feed
      
      // Update the user's profile with the collected data
      if (pendingProfileData) {
        try {
          await updateProfile(pendingProfileData);
        } catch (error) {
          console.error('Failed to update profile:', error);
          // Continue anyway, profile can be updated later
        }
      }
      
      // Store followed users (in a real app, this would be sent to backend)
      console.log('Followed users:', followedUsers);
      
      // Set current page to feed
      setCurrentPage('feed');
      localStorage.setItem('currentPage', 'feed');
      
      // Clear pending data
      setPendingUserData(null);
      setPendingProfileData(null);
      
    } catch (error) {
      console.error('Failed to complete registration:', error);
      // If there's an error, just redirect to feed anyway
      setCurrentPage('feed');
      localStorage.setItem('currentPage', 'feed');
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
  
  // If user is not authenticated, show auth forms
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

  // If user is authenticated but still in registration flow, show registration steps
  if (isAuthenticated && (registrationStep !== 'login' && registrationStep !== 'signup')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center px-4 transition-colors duration-200">
        {registrationStep === 'otp' && pendingUserData && (
          <OtpVerification 
            email={pendingUserData.email}
            onVerificationComplete={handleOtpVerificationComplete}
            onResendOtp={handleResendOtp}
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
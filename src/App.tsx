import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { initializeSocket, disconnectSocket, testConnection } from './services/socketService';
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
import { profileApi } from './services/profileApi';

type RegistrationStep = 'login' | 'signup' | 'otp' | 'profile-setup' | 'friend-suggestions';
type AppPage = 'feed' | 'profile' | 'friends' | 'settings';

function AppContent() {
  const { isAuthenticated, updateProfileState } = useAuth();
  const { isDarkMode } = useTheme();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('login');
  
  // Initialize current page from localStorage
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    const savedPage = localStorage.getItem('currentPage') as AppPage;
    return savedPage && ['feed', 'profile', 'friends', 'settings'].includes(savedPage) ? savedPage : 'feed';
  });
  
  // State to track friend requests
  const [hasFriendRequests, setHasFriendRequests] = useState(false);
  
  // Listen for friend request status changes
  useEffect(() => {
    const handleFriendRequestsChange = (event: CustomEvent) => {
      setHasFriendRequests(event.detail.hasFriendRequests);
    };
    window.addEventListener('friendRequestStatusChanged', handleFriendRequestsChange as EventListener);
    return () => {
      window.removeEventListener('friendRequestStatusChanged', handleFriendRequestsChange as EventListener);
    };
  }, []);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      console.log('App: Navigation event received:', event.detail);
      if (event.detail?.page) {
        console.log('App: Setting current page to:', event.detail.page);
        setCurrentPage(event.detail.page);
      }
    };
    
    window.addEventListener('navigate', handleNavigation as EventListener);
    return () => {
      window.removeEventListener('navigate', handleNavigation as EventListener);
    };
  }, []);
  
  // Save currentPage to localStorage whenever it changes and dispatch page change event
  useEffect(() => {
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
      // Include signup data
      name: pendingUserData?.fullName,
      universityId: pendingUserData?.universityId,
      course: pendingUserData?.program,
      batch: pendingUserData?.batch,
      role: pendingUserData?.role,
      // Include minimal profile data
      avatar: { url: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(pendingUserData?.fullName || 'User') },
      bio: '' // Explicitly set bio to empty string when skipping profile setup
    };
    setPendingProfileData(minimalProfileData);
    setRegistrationStep('friend-suggestions');
  };
  
  const handleSkipFriendSuggestions = () => {
    console.log('User skipped friend suggestions');
    // Call the same handler as completing with no followed users
    handleFriendSuggestionsComplete([]);
  };
  
  const handleFriendSuggestionsComplete = async (followedUsers: string[]) => {
    try {
      console.log('Friend suggestions completed with followed users:', followedUsers);
      
      // Since the user is already authenticated after OTP verification,
      // we just need to update their profile and redirect to feed
      
      // Setup the user's profile with the complete data
      try {
        const setupData = {
          name: pendingUserData?.fullName || '',
          avatar: pendingProfileData?.avatar,
          coverPhoto: pendingProfileData?.coverPhoto,
          bio: pendingProfileData?.bio,
          role: pendingUserData?.role || 'student'
        };
        console.log('Setting up profile with data:', setupData);
        
        const updatedProfile = await profileApi.setupProfile(setupData);
        console.log('Profile setup successfully with:', setupData);
        console.log('Updated profile from backend:', updatedProfile);
        
        // Update the AuthContext with the new profile data
        // Use updateProfileState to avoid API conflict since setupProfile already updated the backend
        const profileUpdateData = {
          name: updatedProfile.name,
          avatar: updatedProfile.avatar,
          coverPhoto: updatedProfile.coverPhoto,
          bio: updatedProfile.bio
        };
        console.log('Updating AuthContext with:', profileUpdateData);
        
        updateProfileState(profileUpdateData);
        
        // Verify the update worked
        console.log('Profile state updated successfully');
      } catch (error) {
        console.error('Failed to setup profile:', error);
        // Continue anyway, profile can be updated later
        // Don't let profile setup failure prevent navigation to feed
      }
      
      // Store followed users (in a real app, this would be sent to backend)
      console.log('Followed users:', followedUsers);
      
      // Clear pending data first
      setPendingUserData(null);
      setPendingProfileData(null);
      
      // Reset registration step to login to exit the registration flow
      setRegistrationStep('login');
      
      // Set current page to feed
      setCurrentPage('feed');
      localStorage.setItem('currentPage', 'feed');
      
      console.log('Successfully navigated to feed');
      
    } catch (error) {
      console.error('Failed to complete registration:', error);
      // If there's an error, clear pending data and redirect to feed anyway
      setPendingUserData(null);
      setPendingProfileData(null);
      setRegistrationStep('login');
      setCurrentPage('feed');
      localStorage.setItem('currentPage', 'feed');
      console.log('Error occurred but still navigated to feed');
    }
  };

  // Apply dark mode to body element to ensure full page coverage
  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    document.body.style.backgroundColor = isDarkMode ? '#111827' : '#f9fafb';
    document.body.style.color = isDarkMode ? '#f3f4f6' : '#111827';
  }, [isDarkMode]);
  
  // Listen for authentication state changes and update registration step when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // When user logs out, reset to login page
      setRegistrationStep('login');
    }
  }, [isAuthenticated]);
  
  // Initialize socket connection when user is authenticated
  useEffect(() => {
    console.log('App: Socket initialization effect triggered, isAuthenticated:', isAuthenticated);
    console.log('App: Auth state in localStorage:', localStorage.getItem('authState'));
    if (isAuthenticated) {
      console.log('App: Initializing socket connection...');
      const socket = initializeSocket();
      console.log('App: Socket initialization result:', !!socket);
      
      // Test the connection after a short delay
      setTimeout(() => {
        console.log('App: Testing socket connection...');
        testConnection();
      }, 3000);
    } else {
      console.log('App: User not authenticated, disconnecting socket...');
      disconnectSocket();
    }
  }, [isAuthenticated]);
  
  // Force PWA to always start from 'feed' page on true fresh launch
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (typeof window.navigator === 'object' && 'standalone' in window.navigator && (window.navigator as any).standalone === true);

    let isFreshLaunch = false;
    if (performance && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'navigate') {
        isFreshLaunch = true;
      }
    } else if (performance && (performance as any).navigation) {
      if ((performance as any).navigation.type === 0) {
        isFreshLaunch = true;
      }
    }

    if (isStandalone && isFreshLaunch) {
      setCurrentPage('feed');
      localStorage.setItem('currentPage', 'feed');
      window.history.replaceState({ page: 'feed' }, '', '');
    }
  }, []);
  
  // On initial load, set the current page in history
  useEffect(() => {
    window.history.replaceState({ page: currentPage }, '', '');
  }, []);

  // On every page change, push the new page to history
  useEffect(() => {
    window.history.pushState({ page: currentPage }, '', '');
  }, [currentPage]);

  // Listen for popstate (back button) and update currentPage
  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const page = (event.state && event.state.page) || 'feed';
      setCurrentPage(page);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
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
            onSkip={handleSkipFriendSuggestions}
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
            onSkip={handleSkipFriendSuggestions}
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
              console.log('APP: Profile button clicked');
              setCurrentPage('profile');
              localStorage.setItem('currentPage', 'profile');
              // Always clear viewProfileUserId to show the current user's profile
              localStorage.removeItem('viewProfileUserId');
              console.log('APP: Cleared viewProfileUserId from localStorage');
              // Dispatch a custom event to notify Profile component
              console.log('APP: Dispatching profileNavigation event');
              window.dispatchEvent(new CustomEvent('profileNavigation', { 
                detail: { action: 'viewOwnProfile' } 
              }));
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
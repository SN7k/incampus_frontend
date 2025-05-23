import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import axiosInstance from './utils/axios';
// Import types as needed

// Friend request data is now handled by the Friends component

type RegistrationStep = 'login' | 'signup' | 'otp' | 'profile-setup' | 'friend-suggestions' | 'completed';

interface PendingUserData {
  fullName: string;
  email: string;
  role: 'student' | 'faculty';
  universityId?: string;
  program?: string;
  batch?: string;
  department?: string;
}

interface PendingProfileData {
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
}

function AppContent() {
  // Clean up URL parameters on first render to prevent force logout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('forceLogout')) {
      console.log('Removing forceLogout parameter from URL');
      // Create a new URL without the forceLogout parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []); // Empty dependency array means this runs once on mount
  
  const { isAuthenticated, loading, user, logout, authenticateWithToken } = useAuth();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(() => {
    const inRegistrationFlow = localStorage.getItem('inRegistrationFlow');
    if (inRegistrationFlow === 'true') {
      console.log('Detected registration flow');
      return 'login';
    }
    return 'login';
  });
  const [pendingUserData, setPendingUserData] = useState<PendingUserData | null>(null);
  const [pendingProfileData, setPendingProfileData] = useState<PendingProfileData | null>(null);
  
  // Add debug logging for authentication state changes
  useEffect(() => {
    console.log('AppContent: Auth state changed useEffect triggered.', { 
      isAuthenticated, 
      loading, 
      userId: user?._id,
      hasToken: !!localStorage.getItem('token'),
      hasUser: !!localStorage.getItem('user'),
      // Log dependency values
      dependencies: { isAuthenticated, loading, user: !!user }
    });
  }, [isAuthenticated, loading, user]); // Dependencies: isAuthenticated, loading, user
  
  // Add error handling for initial load and uncaught errors
  useEffect(() => {
    console.log('AppContent: Error handling useEffect triggered.', { 
      isAuthenticated, 
      loading, 
      user: !!user, 
      // Log dependency values
      dependencies: { isAuthenticated, loading, user: !!user, logout: !!logout }
    });
    // Only run this when authenticated and not loading
    if (isAuthenticated && !loading && user) {
      console.log('AppContent: User is authenticated, setting up error handlers.', user);
    }

    // Add a global error handler for uncaught errors (sync errors)
    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught (sync) error:', event.error);
      // Check if the error message contains "is not a function"
      if (event.error && typeof event.error.toString === 'function' && event.error.toString().includes('is not a function')) {
        console.log('Detected potential authentication error, logging out...');
        // Set auth error flag
        localStorage.setItem('authError', 'true');
        // Clear local storage and log out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login with force logout parameter
        window.location.href = '/?forceLogout=true';
      }
    };
    
    // Add a global handler for unhandled promise rejections (async errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      // Prevent the default handling (which might be the refresh)
      event.preventDefault();
      // Optionally, trigger a logout if the error looks like an auth issue
      if (event.reason && typeof event.reason.toString === 'function' && event.reason.toString().includes('is not a function')) {
         console.log('Detected potential authentication error in unhandled rejection, logging out...');
         localStorage.setItem('authError', 'true');
         localStorage.removeItem('token');
         localStorage.removeItem('user');
         window.location.href = '/?forceLogout=true';
      }
       // You might want to handle other types of unhandled rejections here
    };
    
    // Add the error handlers
    console.log('AppContent: Adding global error and unhandledrejection listeners.');
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Clean up the error handlers when the component unmounts
    return () => {
      console.log('AppContent: Cleaning up global error and unhandledrejection listeners.');
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
    
  }, [isAuthenticated, loading, user, logout]); // Dependencies: isAuthenticated, loading, user, logout

  // Add a check for token on mount (handled in AuthProvider init state)
  useEffect(() => {
    console.log('AppContent: Token check useEffect triggered.', { 
      isAuthenticated, 
      loading,
      // Log dependency values
      dependencies: { isAuthenticated, loading }
    });
    // This effect is primarily for debugging or if AuthProvider init isn't enough
    // AuthProvider's initial state logic handles session restoration.
    // We can keep this for extra logging if needed, but ensure it doesn't cause issues.
    // The core logic is in AuthProvider.
    console.log('AppContent useEffect running - checking auth state for potential issues');
    if (isAuthenticated && !user) {
       console.warn('Authenticated but user object is null!');
       // Potentially log out or attempt re-fetch user here if necessary
    }

  }, [isAuthenticated, user]);

  const handleSignupSuccess = (userData: PendingUserData) => {
    console.log('Signup success, user data:', userData);
    // Set a flag to indicate we're in the registration flow
    localStorage.setItem('inRegistrationFlow', 'true');
    setPendingUserData(userData);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = async () => {
    console.log('OTP verification complete, moving to profile setup');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // If we don't have token or user in localStorage, go back to login
    if (!token || !userStr) {
      console.error('Token or user data not found after OTP verification');
      localStorage.removeItem('inRegistrationFlow'); // Clean up the flag
      setRegistrationStep('login');
      return;
    }
    
    try {
      // Parse the user data
      const user = JSON.parse(userStr);
      console.log('User data from local storage:', user);
      
      // Validate user data
      if (!user._id || !user.name || !user.email) {
        throw new Error('Invalid user data');
      }
      
      // Set axios authorization header
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Convert data to the expected format
      const userData: PendingUserData = {
        fullName: user.name,
        email: user.email,
        role: (user.role as 'student' | 'faculty') || 'student',
        universityId: user.universityId || user.collegeId || '',
        department: user.department || '',
        batch: user.batch || '',
        program: user.program || ''
      };
      
      console.log('Setting pendingUserData:', userData);
      
      // Set the pending user data first
      setPendingUserData(userData);
      
      // Ensure we're still in registration flow
      localStorage.setItem('inRegistrationFlow', 'true');
      localStorage.setItem('completingOnboarding', 'true');
      
      // Use a small timeout to ensure state updates are processed
      setTimeout(async () => {
        try {
          // Authenticate the user with the token
          await authenticateWithToken(token, user);
          
          // Check if we're still in registration flow after authentication
          if (localStorage.getItem('inRegistrationFlow') === 'true') {
            console.log('Moving to profile setup');
            setRegistrationStep('profile-setup');
          } else {
            console.log('No longer in registration flow, redirecting to feed');
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Error during authentication after OTP verification:', error);
          setRegistrationStep('login');
        }
      }, 100);
    } catch (error) {
      console.error('Error in OTP verification completion:', error);
      localStorage.removeItem('inRegistrationFlow');
      setRegistrationStep('login');
    }
  };

  const handleProfileComplete = (profileData: PendingProfileData) => {
    console.log('Profile setup complete, profile data:', profileData);
    setPendingProfileData(profileData);
    setRegistrationStep('friend-suggestions');
  };

  const handleSkipProfile = () => {
    console.log('Profile setup skipped, moving to friend suggestions');
    setRegistrationStep('friend-suggestions');
  };

  const handleFriendSuggestionsComplete = () => {
    console.log('Friend suggestions complete, transitioning to feed page');
    try {
      // First reset the registration state
      setPendingUserData(null);
      setPendingProfileData(null);
      
      // Set registration step to completed
      setRegistrationStep('completed');
      
      // Ensure we have valid authentication data
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        console.error('Missing authentication data during friend suggestions completion');
        // Clean up any registration flags
        localStorage.removeItem('inRegistrationFlow');
        localStorage.removeItem('completingOnboarding');
        // Redirect to login page if authentication data is missing
        window.location.href = '/?forceLogout=true';
        return;
      }
      
      // Validate the user object
      try {
        const user = JSON.parse(userStr);
        console.log('Valid user data available for transition:', user);
        
        // Ensure the auth header is set for the next page load
        if (token) {
          console.log('Setting auth header for transition');
          // Set the authorization header for axios
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Clear the registration flow flags since we're done with onboarding
          localStorage.removeItem('inRegistrationFlow');
          localStorage.removeItem('completingOnboarding');
          
          // Refresh the authentication state before redirecting
          const refreshAuth = async () => {
            try {
              await authenticateWithToken(token, user);
              console.log('Authentication refreshed, redirecting to feed');
              // Use a small timeout to ensure state is updated
              setTimeout(() => {
                window.location.href = '/';
              }, 100);
            } catch (err) {
              console.error('Error refreshing authentication:', err);
              window.location.href = '/';
            }
          };
          refreshAuth();
          return;
        }
      } catch (e) {
        console.error('Invalid user data during friend suggestions completion:', e);
        // Clean up any registration flags
        localStorage.removeItem('inRegistrationFlow');
        localStorage.removeItem('completingOnboarding');
        window.location.href = '/?forceLogout=true';
        return;
      }
      
      // Fallback redirect if something went wrong
      console.log('Redirecting to main application...');
      window.location.href = '/';
    } catch (error) {
      console.error('Error completing friend suggestions:', error);
      // Clean up any registration flags
      localStorage.removeItem('inRegistrationFlow');
      localStorage.removeItem('completingOnboarding');
      // Fallback to login page on error
      window.location.href = '/?forceLogout=true';
    }
  };

  const handleResendOtp = async () => {
    if (!pendingUserData?.email) return;
    
    try {
      const response = await fetch('https://incampus-backend.onrender.com/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: pendingUserData.email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    console.log('AppContent: loading state is true, rendering loading message.');
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  console.log('AppContent: loading state is false, checking authentication status.');

  // If not authenticated, show auth forms
  if (!isAuthenticated) {
    console.log('AppContent: Not authenticated, rendering auth forms. Current step:', registrationStep);
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center px-4 transition-colors duration-200">
        {registrationStep === 'signup' && (
          <SignupForm 
            onBackToLogin={() => setRegistrationStep('login')} 
            onSignupSuccess={handleSignupSuccess}
            onShowProfileSetup={() => {
              console.log('Showing profile setup');
              setRegistrationStep('profile-setup');
            }}
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
            currentUser={{
              ...pendingUserData,
              ...pendingProfileData
            }}
            onComplete={handleFriendSuggestionsComplete}
          />
        )}
      </div>
    );
  }

  // If authenticated, show protected routes
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
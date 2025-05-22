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
  const { isAuthenticated, loading, user, logout } = useAuth();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(() => {
    // Check if we're completing onboarding
    const completingOnboarding = localStorage.getItem('completingOnboarding');
    if (completingOnboarding === 'true') {
      console.log('Detected onboarding completion flag, setting registration step to completed');
      // Remove the flag
      localStorage.removeItem('completingOnboarding');
      return 'completed';
    }
    return 'login';
  });
  const [pendingUserData, setPendingUserData] = useState<PendingUserData | null>(null);
  const [pendingProfileData, setPendingProfileData] = useState<PendingProfileData | null>(null);
  
  // Add debug logging for authentication state
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, loading, userId: user?.id });
  }, [isAuthenticated, loading, user]);
  
  // Add error handling for initial load
  useEffect(() => {
    // Only run this when authenticated and not loading
    if (isAuthenticated && !loading && user) {
      console.log('User is authenticated:', user);
      // Add a global error handler for uncaught errors
      const handleError = (event: ErrorEvent) => {
        console.error('Uncaught error:', event.error);
        // Check if the error message contains "r is not a function"
        if (event.error && event.error.toString().includes('is not a function')) {
          console.log('Detected authentication error, logging out...');
          // Set auth error flag
          localStorage.setItem('authError', 'true');
          // Clear local storage and log out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login with force logout parameter
          window.location.href = '/?forceLogout=true';
        }
      };
      
      // Add the error handler
      window.addEventListener('error', handleError);
      
      // Clean up the error handler when the component unmounts
      return () => {
        window.removeEventListener('error', handleError);
      };
    }
  }, [isAuthenticated, loading, user, logout]);

  // Add a check for token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser && !isAuthenticated && !loading) {
      console.log('Found saved credentials, attempting to restore session');
      try {
        const user = JSON.parse(savedUser);
        console.log('Parsed user data:', user);
        // Set axios authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [isAuthenticated, loading]);

  const handleSignupSuccess = (userData: PendingUserData) => {
    console.log('Signup success, user data:', userData);
    setPendingUserData(userData);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = () => {
    console.log('OTP verification complete, moving to profile setup');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User string exists:', !!userStr);
    
    if (!token || !userStr) {
      console.error('Token or user data not found after OTP verification');
      setRegistrationStep('login');
      return;
    }

    try {
      console.log('Raw user string from localStorage:', userStr);
      const user = JSON.parse(userStr);
      console.log('Parsed user object:', user);
      
      // Create a valid pendingUserData object
      const userData = {
        fullName: user.name || user.collegeId || '',
        email: user.email || '',
        role: (user.role as 'student' | 'faculty') || 'student',
        universityId: user.collegeId,
        department: user.department,
        program: user.program,
        batch: user.batch
      };
      
      console.log('Setting pendingUserData:', userData);
      setPendingUserData(userData);
      
      // Set the registration step to profile setup
      console.log('Moving to profile setup');
      setRegistrationStep('profile-setup');
    } catch (error) {
      console.error('Error parsing user data:', error);
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
          // This will be used by axios on the next page load
          localStorage.setItem('authHeader', `Bearer ${token}`);
        }
      } catch (e) {
        console.error('Invalid user data during friend suggestions completion');
        window.location.href = '/?forceLogout=true';
        return;
      }
      
      // Navigate to the feed page
      console.log('Redirecting to main application...');
      window.location.href = '/';
    } catch (error) {
      console.error('Error completing friend suggestions:', error);
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show auth forms
  if (!isAuthenticated) {
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
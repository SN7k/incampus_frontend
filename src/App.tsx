import { useState, useEffect, useRef } from 'react';
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
import { hasRegistrationFlags, navigateWithoutForceLogout } from './utils/authFlowHelpers';
// Authentication flow helpers


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

interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  data?: any;
}

function AppContent() {
  // Add a ref to track if we've checked for registration flags
  const registrationFlagsChecked = useRef(false);
  
  // Check for registration flags on first render, before any other checks
  useEffect(() => {
    if (registrationFlagsChecked.current) return;
    registrationFlagsChecked.current = true;
    
    // Use our utility function to check for registration flags
    const registrationFlagsPresent = hasRegistrationFlags();
    
    console.log('Initial check for registration flags:', {
      hasRegistrationFlags: registrationFlagsPresent
    });
    
    // If we have registration flags, ensure we don't have forceLogout parameter
    if (registrationFlagsPresent) {
      // Remove the forceLogout parameter if present
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('forceLogout')) {
        console.log('Removing forceLogout parameter while preserving registration flags');
        
        // Use our utility to navigate without the forceLogout parameter
        navigateWithoutForceLogout(window.location.pathname);
      }
    } else {
      // Normal URL cleanup if no registration flags
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('forceLogout')) {
        console.log('Removing forceLogout parameter from URL');
        // Create a new URL without the forceLogout parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []); // Empty dependency array means this runs once on mount
  
  const { isAuthenticated, loading, user, logout, authenticateWithToken } = useAuth();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(() => {
    const inRegistrationFlow = localStorage.getItem('inRegistrationFlow');
    const currentStep = localStorage.getItem('registrationStep');
    
    if (inRegistrationFlow === 'true') {
      console.log('Detected registration flow, current step:', currentStep);
      
      // If we have a saved step, use it
      if (currentStep === 'otp') {
        return 'otp';
      } else if (currentStep === 'profile-setup') {
        return 'profile-setup';
      } else if (currentStep === 'friend-suggestions') {
        return 'friend-suggestions';
      }
    }
    
    // Default to login
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
    // Set flags to indicate we're in the registration flow and save current step
    localStorage.setItem('inRegistrationFlow', 'true');
    localStorage.setItem('registrationStep', 'otp');
    setPendingUserData(userData);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = async () => {
    console.log('OTP verification complete, moving to profile setup');
    
    // Try to get token from multiple sources
    let token = localStorage.getItem('token');
    let userStr = localStorage.getItem('user');
    
    // If not in localStorage, try sessionStorage as fallback
    if (!token) {
      console.log('Token not found in localStorage, trying sessionStorage');
      token = sessionStorage.getItem('token');
    }
    
    // If not in sessionStorage, try cookies as fallback
    if (!token) {
      console.log('Token not found in sessionStorage, trying cookies');
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      if (authCookie) {
        token = authCookie.split('=')[1];
        console.log('Found token in cookies');
      }
    }
    
    // Try to get user data from sessionStorage if not in localStorage
    if (!userStr) {
      console.log('User data not found in localStorage, trying sessionStorage');
      userStr = sessionStorage.getItem('user');
    }
    
    // If we don't have token or user data, go back to login
    if (!token || !userStr) {
      console.error('Token or user data not found after OTP verification from any source');
      localStorage.removeItem('inRegistrationFlow'); // Clean up the flag
      setRegistrationStep('login');
      return;
    }
    
    // Ensure token is properly set in localStorage and axios for future use
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
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
      
      // CRITICAL: First set the registration step to profile-setup
      // This must happen before any async operations
      localStorage.setItem('registrationStep', 'profile-setup');
      setRegistrationStep('profile-setup');
      
      // Then ensure we're still in registration flow
      localStorage.setItem('inRegistrationFlow', 'true');
      localStorage.setItem('completingOnboarding', 'true');
      
      // Force a re-render to ensure the UI updates immediately
      setTimeout(() => {
        // Double-check that we're still in the right state
        if (localStorage.getItem('registrationStep') === 'profile-setup') {
          console.log('Confirming profile setup is active');
    setRegistrationStep('profile-setup');
        }
      }, 0);
      
      // Log the current state to help with debugging
      console.log('Set registration step to profile-setup, current state:', {
        registrationStep: 'profile-setup',
        isAuthenticated,
        pendingUserData: userData,
        inRegistrationFlow: localStorage.getItem('inRegistrationFlow'),
        completingOnboarding: localStorage.getItem('completingOnboarding'),
        registrationStepInStorage: localStorage.getItem('registrationStep')
      });
      
      // Authenticate the user with the token in the background
      // We don't need to wait for this to complete since we've already set the registration step
      try {
        // Call authenticateWithToken but don't wait for it to complete
        authenticateWithToken(token, user);
      } catch (error: any) {
        console.error('Error during authentication after OTP verification:', error);
        // Ensure token is set in axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error in OTP verification completion:', error);
      localStorage.removeItem('inRegistrationFlow');
      setRegistrationStep('login');
    }
  };

  const handleProfileComplete = async (profileData: PendingProfileData) => {
    console.log('Profile setup complete, profile data:', profileData);
    try {
      // Get the current user data
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User data not found');
      }
      const user = JSON.parse(userStr);
      
      // Get token from multiple sources
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        // Try to get from cookies
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        if (authCookie) {
          token = authCookie.split('=')[1];
        }
      }
      
      // Ensure token is set in axios headers
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Prepare the profile data - IMPORTANT: Don't include large base64 images
      const setupData = {
        name: user.name || user.collegeId || 'User' + Math.floor(Math.random() * 10000),
        role: user.role || 'student',
        email: user.email,
        bio: profileData.bio || ''
        // Do not include avatar or coverPhoto if they're base64 encoded
        // The server can't handle large payloads
      };

      console.log('Sending profile setup request:', setupData);
      
      try {
        // Make the API request
        const response = await axiosInstance.post<ApiResponse>('/api/profile/setup', setupData);
        
        if (response.data.status === 'success') {
          console.log('Profile setup successful');
          setPendingProfileData(profileData);
          localStorage.setItem('registrationStep', 'friend-suggestions');
          setRegistrationStep('friend-suggestions');
        } else {
          // If the API request fails, try a simplified request without optional fields
          console.log('Retrying with simplified data...');
          const simpleData = {
            name: user.name || user.collegeId || 'User' + Math.floor(Math.random() * 10000),
            role: user.role || 'student',
            email: user.email
          };
          
          const retryResponse = await axiosInstance.post<ApiResponse>('/api/profile/setup', simpleData);
          
          if (retryResponse.data.status === 'success') {
            console.log('Profile setup successful with simplified data');
            setPendingProfileData(profileData);
            localStorage.setItem('registrationStep', 'friend-suggestions');
            setRegistrationStep('friend-suggestions');
          } else {
            throw new Error(retryResponse.data.message || 'Profile setup failed');
          }
        }
      } catch (apiError) {
        console.error('API error during profile setup:', apiError);
        // Try to proceed anyway to avoid blocking the user
        console.log('Attempting to proceed to friend suggestions despite error');
    setPendingProfileData(profileData);
        localStorage.setItem('registrationStep', 'friend-suggestions');
        setRegistrationStep('friend-suggestions');
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);
      // Try to proceed anyway to avoid blocking the user
      console.log('Attempting to proceed to friend suggestions despite error');
      setPendingProfileData({} as PendingProfileData); // Use empty object as fallback
      localStorage.setItem('registrationStep', 'friend-suggestions');
    setRegistrationStep('friend-suggestions');
    }
  };

  const handleSkipProfile = async () => {
    console.log('Profile setup skipped, moving to friend suggestions');
    try {
      // Get the current user data
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User data not found');
      }
      const user = JSON.parse(userStr);
      
      // Get token from multiple sources
      let token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        // Try to get from cookies
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
        if (authCookie) {
          token = authCookie.split('=')[1];
        }
      }
      
      // Ensure token is set in axios headers
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Prepare minimal profile data - keep it very simple to avoid 400 errors
      const setupData = {
        name: user.name || user.collegeId || 'User' + Math.floor(Math.random() * 10000),
        role: user.role || 'student',
        email: user.email
        // Don't include avatar or bio to minimize payload size
      };

      console.log('Sending skip profile setup request:', setupData);
      
      try {
        // Make the API request
        const response = await axiosInstance.post<ApiResponse>('/api/profile/setup', setupData);
        
        if (response.data.status === 'success') {
          console.log('Skip profile setup successful');
          localStorage.setItem('registrationStep', 'friend-suggestions');
          setRegistrationStep('friend-suggestions');
        } else {
          // If the API request fails, try an even more simplified request
          console.log('Retrying with minimal data...');
          const minimalData = {
            name: 'User' + Math.floor(Math.random() * 10000),
            role: 'student',
            email: user.email || 'user@example.com'
          };
          
          const retryResponse = await axiosInstance.post<ApiResponse>('/api/profile/setup', minimalData);
          
          if (retryResponse.data.status === 'success') {
            console.log('Profile setup successful with minimal data');
            localStorage.setItem('registrationStep', 'friend-suggestions');
            setRegistrationStep('friend-suggestions');
          } else {
            // If all else fails, just proceed to the next step
            console.log('API requests failed, proceeding anyway');
            localStorage.setItem('registrationStep', 'friend-suggestions');
            setRegistrationStep('friend-suggestions');
          }
        }
      } catch (apiError: any) {
        console.error('API error during skip profile:', apiError);
        // Proceed anyway to avoid blocking the user
        console.log('Proceeding to friend suggestions despite error');
        localStorage.setItem('registrationStep', 'friend-suggestions');
        setRegistrationStep('friend-suggestions');
      }
    } catch (error: any) {
      console.error('Skip profile setup error:', error);
      // Proceed anyway to avoid blocking the user
      console.log('Proceeding to friend suggestions despite error');
      localStorage.setItem('registrationStep', 'friend-suggestions');
    setRegistrationStep('friend-suggestions');
    }
  };
  
  const handleFriendSuggestionsComplete = async (followedUsers: string[]) => {
  try {
    console.log('Friend suggestions complete, followed users:', followedUsers);
    
    // First reset the registration state
    setPendingUserData(null);
    setPendingProfileData(null);
    
    // Set registration step to completed
    setRegistrationStep('completed');
    
    // Set ALL possible flags to ensure we don't get logged out during the process
    localStorage.setItem('justCompletedRegistration', 'true');
    sessionStorage.setItem('redirectAfterRegistration', 'true');
    localStorage.setItem('completedFriendSuggestions', 'true');
    localStorage.setItem('forceAuthenticated', 'true');
    localStorage.setItem('authBypassTimestamp', Date.now().toString());
    localStorage.setItem('bypassTokenVerification', 'true');
    localStorage.setItem('comingFromRegistration', 'true');
    localStorage.setItem('inRegistrationFlow', 'true');
    
    // Remove any forceLogout parameters from URL if present
    if (window.location.search.includes('forceLogout')) {
      const newUrl = window.location.pathname + 
        (window.location.search ? '?' + window.location.search.substring(1).replace(/[&?]forceLogout=true/, '') : '');
      window.history.replaceState({}, document.title, newUrl);
      console.log('Removed forceLogout parameter from URL');
    }
    
    // Get the current token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token || !user) {
      console.error('No token or user data found during friend suggestions completion');
      
      // Try to recover token from cookies as a last resort
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
      if (authCookie) {
        const cookieToken = authCookie.split('=')[1];
        if (cookieToken && user) {
          console.log('Recovered token from cookies, proceeding with authentication');
          // Continue with the token from cookies
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${cookieToken}`;
          localStorage.setItem('token', cookieToken);
          sessionStorage.setItem('token', cookieToken);
        } else {
          window.location.href = '/login';
          return;
        }
      } else {
        window.location.href = '/login';
        return;
      }
    }
    
    // Ensure the token is set in axios headers
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Also set a cookie with the token for extra redundancy
    document.cookie = `authToken=${token}; path=/; max-age=86400`; // 24 hours
    
    // Ensure the user object has all required fields
    const validUser = {
      _id: user._id,
      id: user._id, // For backward compatibility
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'student',
      avatar: user.avatar || '/default-avatar.png',
      hasCompletedRegistration: true
    };
    
    // Save the valid user data to localStorage and sessionStorage
    localStorage.setItem('user', JSON.stringify(validUser));
    sessionStorage.setItem('user', JSON.stringify(validUser));
    
    console.log('Authentication refreshed, preparing to redirect to feed');
    
    // Verify authentication state before redirecting
    const verifyAndRedirect = () => {
      // Double-check all authentication flags are still set
      if (!localStorage.getItem('justCompletedRegistration')) {
        localStorage.setItem('justCompletedRegistration', 'true');
      }
      if (!sessionStorage.getItem('redirectAfterRegistration')) {
        sessionStorage.setItem('redirectAfterRegistration', 'true');
      }
      if (!localStorage.getItem('token') && token) {
        localStorage.setItem('token', token);
      }
      
      console.log('Redirecting to feed page after authentication refresh');
      
      // Ensure we're not redirecting with any query parameters
      const cleanUrl = window.location.origin + '/';
      console.log('Redirecting to clean URL:', cleanUrl);
      
      // Use replaceState to avoid adding to browser history
      window.history.replaceState(null, '', cleanUrl);
      
      // Force a full page reload to ensure a clean state
      window.location.replace(cleanUrl);
    };
    
    // Use a direct approach to transition to the feed page
    setTimeout(verifyAndRedirect, 300);
  } catch (error) {
    console.error('Error during friend suggestions completion:', error);
    // Don't clean up registration flags on error - keep them for recovery
    
    // Try a direct redirect as a fallback
    window.location.href = '/';
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

  // Check for all possible registration completion flags
  const justCompletedRegistration = localStorage.getItem('justCompletedRegistration') === 'true';
  const redirectAfterRegistration = sessionStorage.getItem('redirectAfterRegistration') === 'true';
  const bypassTokenVerification = localStorage.getItem('bypassTokenVerification') === 'true';
  const comingFromRegistration = localStorage.getItem('comingFromRegistration') === 'true';
  
  // If any of these flags are set, force authentication
  const forceAuthenticated = justCompletedRegistration || redirectAfterRegistration || 
                            bypassTokenVerification || comingFromRegistration;
  
  // Check if we're in the registration flow (OTP verification, profile setup, or friend suggestions)
  const inRegistrationProcess = ['otp', 'profile-setup', 'friend-suggestions'].includes(registrationStep);
  
  // Only show auth forms if not authenticated and not in special cases
  const showAuthForms = (!isAuthenticated && !forceAuthenticated) || inRegistrationProcess;
  
  console.log('AppContent: Registration state:', { 
    registrationStep, 
    isAuthenticated, 
    inRegistrationProcess, 
    showAuthForms,
    inRegistrationFlow: localStorage.getItem('inRegistrationFlow'),
    completingOnboarding: localStorage.getItem('completingOnboarding'),
    justCompletedRegistration,
    redirectAfterRegistration,
    bypassTokenVerification,
    comingFromRegistration,
    forceAuthenticated
  });
  
  // If we should force authentication but are not authenticated,
  // try to restore the authentication state from localStorage
  if (forceAuthenticated && !isAuthenticated) {
    console.log('Detected special flags but not authenticated, forcing feed page display');
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('Found valid user data, setting up auth state manually:', userData);
        
        // Set axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Manually authenticate with the token and user data
        authenticateWithToken(token, userData);
        
        // Clear the flags after using them
        if (justCompletedRegistration) localStorage.removeItem('justCompletedRegistration');
        if (redirectAfterRegistration) sessionStorage.removeItem('redirectAfterRegistration');
        if (bypassTokenVerification) localStorage.removeItem('bypassTokenVerification');
        if (comingFromRegistration) localStorage.removeItem('comingFromRegistration');
        
        // Return early to show the feed page
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
      } catch (e) {
        console.error('Error parsing user data during auth restoration:', e);
      }
    }
  }
  
  // If not authenticated or still in registration flow, show auth forms or registration steps
  if (showAuthForms) {
    console.log('AppContent: Showing auth forms or registration steps. Current step:', registrationStep);
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
        
        {registrationStep === 'profile-setup' && (
          <ProfileSetup 
            userInfo={{
              fullName: pendingUserData?.fullName || (user?.name || '') || localStorage.getItem('fullName') || sessionStorage.getItem('fullName') || 'User' + Math.floor(Math.random() * 10000),
              email: pendingUserData?.email || (user?.email || '') || localStorage.getItem('email') || sessionStorage.getItem('email') || '',
              role: (pendingUserData?.role || user?.role || localStorage.getItem('role') || sessionStorage.getItem('role') || 'student') as 'student' | 'faculty'
            }}
            onProfileComplete={handleProfileComplete}
            onSkip={handleSkipProfile}
          />
        )}
        
        {registrationStep === 'friend-suggestions' && (
          <FriendSuggestions
            currentUser={{
              ...(pendingUserData || {}),
              ...(pendingProfileData || {}),
              // Use type assertion to avoid TypeScript errors
              name: pendingUserData?.fullName || user?.name || '',
              email: pendingUserData?.email || user?.email || '',
              role: (pendingUserData?.role || user?.role || 'student') as 'student' | 'faculty'
            } as any}
            onComplete={handleFriendSuggestionsComplete}
          />
        )}
      </div>
    );
  }

  // If authenticated and not in registration flow, show protected routes
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
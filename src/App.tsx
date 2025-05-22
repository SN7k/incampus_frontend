import { useState } from 'react';
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
// Import types as needed

// Friend request data is now handled by the Friends component

type RegistrationStep = 'login' | 'signup' | 'otp' | 'profile-setup' | 'friend-suggestions';

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
  const { isAuthenticated, loading } = useAuth();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('login');
  const [pendingUserData, setPendingUserData] = useState<PendingUserData | null>(null);
  const [pendingProfileData, setPendingProfileData] = useState<PendingProfileData | null>(null);

  const handleSignupSuccess = (userData: PendingUserData) => {
    console.log('Signup success, user data:', userData);
    setPendingUserData(userData);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = () => {
    console.log('OTP verification complete, moving to profile setup');
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.error('Token or user data not found after OTP verification');
      setRegistrationStep('login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Ensure we have the required user data
      // Check for name instead of fullName to match the User interface
      if (!user.name || !user.email || !user.role) {
        console.error('Missing required user data:', user);
        setRegistrationStep('login');
        return;
      }
      
      // If we have valid user data, update pendingUserData to match what we need
      setPendingUserData({
        fullName: user.name,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
        department: user.department,
        batch: user.batch
      });
      
      // Set the registration step to profile setup
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
    console.log('Friend suggestions complete, resetting registration state');
    setRegistrationStep('login');
    setPendingUserData(null);
    setPendingProfileData(null);
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
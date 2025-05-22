import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import OtpVerification from './components/auth/OtpVerification';
import ProfileSetup from './components/auth/ProfileSetup';
import FriendSuggestions from './components/auth/FriendSuggestions';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('login');
  const [pendingUserData, setPendingUserData] = useState<PendingUserData | null>(null);
  const [pendingProfileData, setPendingProfileData] = useState<PendingProfileData | null>(null);

  const handleSignupSuccess = (userData: PendingUserData) => {
    setPendingUserData(userData);
    setRegistrationStep('otp');
  };

  const handleOtpVerificationComplete = () => {
    setRegistrationStep('profile-setup');
  };

  const handleProfileComplete = (profileData: PendingProfileData) => {
    setPendingProfileData(profileData);
    setRegistrationStep('friend-suggestions');
  };

  const handleSkipProfile = () => {
    setRegistrationStep('friend-suggestions');
  };

  const handleFriendSuggestionsComplete = () => {
    // Reset registration state
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
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
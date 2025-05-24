import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Standalone emergency login page that completely bypasses the existing authentication system
const EmergencyLogin: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  // Clear any redirect loops on component mount
  useEffect(() => {
    // Clear all localStorage items that might cause redirect loops
    localStorage.removeItem('authError');
    localStorage.removeItem('inLogoutLoop');
    localStorage.removeItem('forceLogout');
    localStorage.removeItem('preventRedirectLoop');
    
    // Remove any URL parameters
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Set a message if we were redirected here due to login issues
    const referrer = document.referrer;
    if (referrer && referrer.includes('incampusbwu.netlify.app')) {
      setMessage('You were redirected here due to login issues. This is an emergency login page.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Determine if the identifier is an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      // Create the login payload
      const loginPayload = {
        password,
        role
      } as any;
      
      // Add the appropriate identifier field
      if (isEmail) {
        loginPayload.email = identifier;
      } else {
        loginPayload.universityId = identifier;
      }
      
      console.log('Emergency login attempt with payload:', { ...loginPayload, password: '[REDACTED]' });
      
      // Make a direct API call to the backend
      const response = await axios.post<{
        status: string;
        message: string;
        data: { token: string; user: any }
      }>('https://incampus-backend.onrender.com/api/auth/login', loginPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.status === 'success') {
        const { token, user } = response.data.data;
        
        console.log('Emergency login successful');
        
        // Clear all localStorage first to remove any problematic data
        localStorage.clear();
        sessionStorage.clear();
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        
        // Set flags to indicate successful login
        localStorage.setItem('emergencyLogin', 'true');
        localStorage.setItem('isAuthenticated', 'true');
        
        // Show success message
        setSuccess(true);
        setError('');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          // Open the feed in a new tab to avoid any redirect issues
          window.open('https://incampusbwu.netlify.app', '_blank');
        }, 2000);
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Emergency login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Emergency Login</h2>
          <p className="text-gray-600">This page bypasses the normal authentication flow</p>
          {message && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {message}
            </div>
          )}
        </div>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            Login successful! Opening the feed in a new tab...
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  role === 'student'
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('faculty')}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  role === 'faculty'
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Faculty
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'student' ? 'Student ID or Email' : 'Email'}
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={role === 'student' ? 'BWU/ABC/00/000 or your email' : 'Enter your email'}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              This is an emergency login page that bypasses the normal authentication flow.
              <br />
              After login, the main site will open in a new tab.
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmergencyLogin;

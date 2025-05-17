import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSetup from './ProfileSetup';

interface SignupFormProps {
  onToggleForm: () => void;
}

const SignupFormNew: React.FC<SignupFormProps> = ({ onToggleForm }) => {
  // Form state
  const [userType, setUserType] = useState<'student' | 'faculty'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [program, setProgram] = useState('');
  const [batch, setBatch] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Profile setup state
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  
  const { requestOTP, verifyOTPAndRegister, loading, error } = useAuth();

  // Request OTP for email verification
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Requesting OTP');
    setFormError('');
    
    // Basic validation
    if (!name || !email) {
      setFormError('Name and email are required');
      console.log('Validation failed: Name and email are required');
      return;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address (e.g., example@gmail.com)');
      console.log('Validation failed: Invalid email format');
      return;
    }
    
    // Strict validation for common email domains
    const emailDomain = email.split('@')[1];
    const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'];
    const isCommonDomain = commonDomains.some(domain => emailDomain && emailDomain.toLowerCase() === domain);
    
    // Check for possible typos in common domains
    const possibleTypos: Record<string, string> = {
      'gmal.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gmai.com': 'gmail.com',
      'glal.com': 'gmail.com',
      'hotmial.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'ymail.com': 'yahoo.com',
      'outloo.com': 'outlook.com',
      'outlok.com': 'outlook.com'
    };
    
    // If domain is a known typo, suggest correction
    if (emailDomain && emailDomain.toLowerCase() in possibleTypos) {
      const correctedDomain = possibleTypos[emailDomain.toLowerCase()];
      const correctedEmail = email.split('@')[0] + '@' + correctedDomain;
      setFormError(`Did you mean ${correctedEmail}? Please correct your email address.`);
      console.log('Validation failed: Possible typo in email domain');
      return;
    }
    
    // If not a common domain, prevent proceeding
    if (!isCommonDomain) {
      setFormError(`Please use a common email provider like Gmail, Yahoo, Outlook, or Hotmail.`);
      console.log('Validation failed: Uncommon email domain detected:', emailDomain);
      return;
    }

    // For students, validate university ID if provided
    if (userType === 'student' && id) {
      const idPattern = /^[A-Z]+\/[A-Z]+\/\d+\/\d+$|^[A-Z]+\/[A-Z]+\/[A-Z]+\/\d+$/;
      if (!idPattern.test(id)) {
        setFormError('Invalid university ID format. Example: BWU/BCA/20/123');
        console.log('Validation failed: Invalid university ID format');
        return;
      }
    }
    
    const universityId = id || email; // Use ID if provided, otherwise use email
    
    try {
      console.log('Requesting OTP for:', email);
      const success = await requestOTP(name, email, universityId);
      
      if (success) {
        setOtpSent(true);
        setShowOtpVerification(true);
      }
    } catch (err) {
      console.error('OTP request error:', err);
      setFormError('Failed to send verification code. Please try again.');
    }
  };
  
  // Verify OTP and complete registration
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verifying OTP');
    setFormError('');
    
    // Basic validation - only OTP is required at this stage
    if (!otp) {
      setFormError('Please enter the verification code');
      console.log('Validation failed: Verification code is required');
      return;
    }
    
    // OTP validation
    const otpPattern = /^\d{6}$/;
    if (!otpPattern.test(otp)) {
      setFormError('Invalid verification code. Please enter a 6-digit code.');
      return;
    }
    
    // Clear any existing auth state before verification
    localStorage.removeItem('token');
    localStorage.removeItem('authState');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('profileSetupComplete');
    localStorage.removeItem('setupComplete');
    
    // Generate a random secure password since we're not asking the user for one
    const generatedPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + Math.random().toString(10).slice(-2);
    
    // Prepare signup data with OTP and generated password
    const signupData = {
      name,
      email,
      universityId: id || email, // Use ID if provided, otherwise use email
      role: userType,
      program,
      batch: userType === 'student' ? batch : '',
      password: generatedPassword, // Use generated password
      otp
    };
    
    console.log('Attempting to verify OTP and register:', signupData);
    
    try {
      await verifyOTPAndRegister(signupData);
      console.log('Registration successful');
      
      // Check if we have a token after verification (indicates success)
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found after OTP verification');
        setFormError('Authentication failed. Please try again.');
        return;
      }
      
      // Show profile setup after successful OTP verification
      setShowOtpVerification(false);
      setShowProfileSetup(true);
    } catch (err: any) {
      console.error('Verification error:', err);
      setFormError(err.message || 'Verification failed. Please try again.');
    }
  };
  


  // Handle profile setup completion
  const handleProfileSetupComplete = () => {
    console.log('Profile setup completed, redirecting to main app');
    
    // Instead of toggling back to login form, redirect directly to the app
    // This prevents the authentication loss that can happen during form toggle
    setShowProfileSetup(false);
    
    // Make sure all auth flags are set
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('profileSetupComplete', 'true');
    localStorage.setItem('setupComplete', 'true');
    
    // Clean reload without URL parameters to prevent white screen issues
    window.location.href = window.location.origin;
  };
  
  // Render profile setup, OTP verification form, or initial signup form
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      {showProfileSetup ? (
        // Profile Setup Form
        <ProfileSetup onComplete={handleProfileSetupComplete} />
      ) : showOtpVerification ? (
        // OTP Verification Form
        <form onSubmit={handleVerifyOTP}>
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {formError || error}
            </div>
          )}
          
          {otpSent && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              Verification code sent to {email}. Please check your inbox.
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1.5">Verification Code</label>
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          
          {/* Password fields removed as requested */}
          
          <button
            type="submit"
            className={`w-full mt-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg px-6 py-3 flex items-center justify-center transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : 'Complete Registration'}
          </button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-blue-800 hover:text-blue-700 font-medium text-sm"
              onClick={() => setShowOtpVerification(false)}
            >
              &larr; Back to signup
            </button>
          </div>
        </form>
      ) : (
        // Initial Signup Form
        <>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Join InCampus</h2>
            <p className="text-gray-600">Create your university network account</p>
          </div>
          <form onSubmit={handleRequestOTP}>
            {(formError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {formError || error}
              </div>
            )}
        
        <div className="flex border border-gray-300 rounded-lg mb-4">
          <button
            type="button"
            className={`flex-1 py-2 ${userType === 'student' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-white text-gray-700'} rounded-l-lg`}
            onClick={() => setUserType('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`flex-1 py-2 ${userType === 'faculty' ? 'bg-blue-100 text-blue-800 font-medium' : 'bg-white text-gray-700'} rounded-r-lg`}
            onClick={() => setUserType('faculty')}
          >
            Faculty
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1.5">Full Name</label>
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1.5">Email</label>
          <input
            type="email"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
            placeholder={userType === 'faculty' ? "abc.cs@brainwareuniversity.ac.in or personal email" : "Enter your email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {userType === 'student' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1.5">University ID</label>
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
              placeholder="BWU/ABC/00/000"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1.5">Program</label>
          <input
            type="text"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
            placeholder={userType === 'student' ? "BCA, MCA, BTech, etc." : "Department (CS, ECE, etc.)"}
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          />
        </div>
        
        {userType === 'student' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1.5">Batch</label>
            <input
              type="text"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
              placeholder="2020-2024, 2021-2025, etc."
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1.5">Password</label>
          <input
            type="password"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1.5">Confirm Password</label>
          <input
            type="password"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 w-full"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full mt-4 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg px-6 py-3 flex items-center justify-center transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                ></circle>
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : 'Create Account'}
        </button>
          </form>
        </>
      )}
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => {
              console.log('Login button clicked');
              onToggleForm();
            }}
            className="text-blue-800 hover:text-blue-700 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupFormNew;

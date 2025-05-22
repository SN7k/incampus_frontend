import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowLeft, User as UserIcon, Lock, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'password' | 'delete'>('personal');
  
  // Navigate back to previous page
  const handleBack = () => {
    const previousPage = localStorage.getItem('previousPage') || 'feed';
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: previousPage } }));
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 pt-20 md:pt-24">
      <div className="flex items-center mb-6">
        <button 
          onClick={handleBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings & Privacy</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center px-4 py-3 font-medium text-sm ${
              activeTab === 'personal'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <UserIcon size={16} className="mr-2" />
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center px-4 py-3 font-medium text-sm ${
              activeTab === 'password'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Lock size={16} className="mr-2" />
            Password & Security
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex items-center px-4 py-3 font-medium text-sm ${
              activeTab === 'delete'
                ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Account
          </button>
        </div>
        
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <PersonalInformationTab user={user} updateProfile={updateProfile} />
        )}
        
        {/* Password & Security Tab */}
        {activeTab === 'password' && (
          <PasswordSecurityTab />
        )}
        
        {/* Delete Account Tab */}
        {activeTab === 'delete' && (
          <DeleteAccountTab logout={logout} />
        )}
      </div>
    </div>
  );
};

// Personal Information Tab Component
const PersonalInformationTab: React.FC<{
  user: User | null;
  updateProfile: (profileData: Partial<User>) => void;
}> = ({ user, updateProfile }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    universityId: user?.universityId || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    // Check if email has been changed
    if (formData.email === user?.email) {
      setErrorMessage('The email address is the same as your current one');
      setLoading(false);
      return;
    }
    
    try {
      // Store the new email for OTP verification
      setNewEmail(formData.email);
      
      // Simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show OTP verification
      setShowOtpVerification(true);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    } catch (error) {
      console.error('Failed to send OTP', error);
      setErrorMessage('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`email-otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`email-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  
  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }
    
    setLoading(true);
    setOtpError('');
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll consider 123456 as the valid OTP
      if (otp === '123456') {
        // Proceed with email update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update profile with the new email
        updateProfile({
          email: newEmail,
        });
        
        setShowOtpVerification(false);
        setSuccessMessage('Email updated successfully!');
        setIsEditing(false);
        
        // Update the form data with the new email
        setFormData(prev => ({
          ...prev,
          email: newEmail
        }));
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify OTP', error);
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = () => {
    // Simulate resending OTP
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Show success message or notification
      alert('A new OTP has been sent to your email.');
    }, 1000);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Information</h2>
        {!isEditing && !showOtpVerification && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            Edit Information
          </Button>
        )}
      </div>
      
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {errorMessage}
        </div>
      )}
      
      {!showOtpVerification ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              fullWidth
            />
          </div>
          
          <div className="mb-4">
            <Input
              label="University ID"
              name="universityId"
              value={formData.universityId}
              disabled={true} // University ID cannot be changed
              fullWidth
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">University ID cannot be changed.</p>
          </div>
          
          {isEditing && (
            <div className="flex justify-end space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    email: user?.email || '',
                    universityId: user?.universityId || '',
                  });
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                loading={loading}
              >
                Continue
              </Button>
            </div>
          )}
        </form>
      ) : (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-700 dark:text-blue-400 font-medium mb-2">OTP Verification Required</h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              For security, we've sent a 6-digit verification code to your current email address: 
              <span className="font-medium">{user?.email ? user.email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'your email'}</span>
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-2">
              Please enter the code below to verify your email change to: <span className="font-medium">{newEmail}</span>
            </p>
          </div>
          
          {otpError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {otpError}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center space-x-2">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  id={`email-otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Didn't receive the code? 
              <button 
                onClick={handleResendOtp} 
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                disabled={loading}
                type="button"
              >
                Resend OTP
              </button>
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowOtpVerification(false);
                setIsEditing(true);
                setOtpError('');
              }}
              disabled={loading}
              type="button"
            >
              Back
            </Button>
            <Button 
              size="sm" 
              onClick={handleVerifyOtp}
              disabled={otpValues.some(v => !v) || loading}
              loading={loading}
              type="button"
            >
              Verify & Update Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Password & Security Tab Component
const PasswordSecurityTab: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [email, setEmail] = useState('');
  
  // Initialize email from user data
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setLoading(false);
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    try {
      // Simulate API call to verify current password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll assume the current password is correct
      // In a real app, you would verify this with your backend
      
      // Send OTP for verification
      setShowOtpVerification(true);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    } catch (error) {
      console.error('Failed to verify current password', error);
      setErrorMessage('Current password is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pwd-otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`pwd-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  
  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }
    
    setLoading(true);
    setOtpError('');
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll consider 123456 as the valid OTP
      if (otp === '123456') {
        // Proceed with password change
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, you would send this to your backend
        console.log('Password changed after OTP verification:', formData);
        
        setShowOtpVerification(false);
        setSuccessMessage('Password updated successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify OTP', error);
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = () => {
    // Simulate resending OTP
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Show success message or notification
      alert('A new OTP has been sent to your email.');
    }, 1000);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Password & Security</h2>
      
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {errorMessage}
        </div>
      )}
      
      {!showOtpVerification ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>
          
          <div className="mb-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              fullWidth
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Password must be at least 8 characters long.</p>
          </div>
          
          <div className="mb-6">
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="sm" 
              loading={loading}
            >
              Continue
            </Button>
          </div>
        </form>
      ) : (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-700 dark:text-blue-400 font-medium mb-2">OTP Verification Required</h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              For security, we've sent a 6-digit verification code to your email address: 
              <span className="font-medium">{email ? email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'your email'}</span>
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-2">
              Please enter the code below to complete your password change.
            </p>
          </div>
          
          {otpError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {otpError}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center space-x-2">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  id={`pwd-otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Didn't receive the code? 
              <button 
                onClick={handleResendOtp} 
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                disabled={loading}
                type="button"
              >
                Resend OTP
              </button>
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowOtpVerification(false);
                setOtpError('');
              }}
              disabled={loading}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleVerifyOtp}
              disabled={otpValues.some(v => !v) || loading}
              loading={loading}
              type="button"
            >
              Verify & Update Password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Delete Account Tab Component
const DeleteAccountTab: React.FC<{
  logout: () => void;
}> = ({ logout }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [email, setEmail] = useState('');
  const { user } = useAuth();
  
  // Initialize email from user data
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);
  
  const handleDeleteRequest = () => {
    setShowConfirmation(true);
  };
  
  const handleProceedToOtp = () => {
    if (confirmText !== 'DELETE') {
      return;
    }
    
    setLoading(true);
    
    // Simulate sending OTP to user's email
    setTimeout(() => {
      setLoading(false);
      setShowConfirmation(false);
      setShowOtpVerification(true);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    }, 1500);
  };
  
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };
  
  const handleVerifyOtp = async () => {
    const otp = otpValues.join('');
    
    if (otp.length !== 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }
    
    setLoading(true);
    setOtpError('');
    
    try {
      // Simulate OTP verification
      // In a real app, you would verify this with your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll consider 123456 as the valid OTP
      if (otp === '123456') {
        // Proceed with account deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Account deleted after OTP verification');
        
        // Log the user out
        logout();
      } else {
        setOtpError('Invalid OTP. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to verify OTP', error);
      setOtpError('Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };
  
  const handleResendOtp = () => {
    // Simulate resending OTP
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Show success message or notification
      alert('A new OTP has been sent to your email.');
    }, 1000);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete Account</h2>
      
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <h3 className="text-red-700 dark:text-red-400 font-medium mb-2">Warning: This action cannot be undone</h3>
        <p className="text-red-600 dark:text-red-300 text-sm mb-3">
          Deleting your account will permanently remove all your data from InCampus, including:
        </p>
        <ul className="list-disc pl-5 text-red-600 dark:text-red-300 text-sm space-y-1 mb-3">
          <li>Your profile information</li>
          <li>All your posts and comments</li>
          <li>Your friend connections</li>
          <li>Your messages and conversations</li>
        </ul>
        <p className="text-red-600 dark:text-red-300 text-sm">
          This action is permanent and cannot be reversed.
        </p>
      </div>
      
      {!showConfirmation && !showOtpVerification ? (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
            onClick={handleDeleteRequest}
          >
            Delete My Account
          </Button>
        </div>
      ) : showConfirmation && !showOtpVerification ? (
        <div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            To confirm deletion, please type <span className="font-bold">DELETE</span> in the field below:
          </p>
          
          <div className="mb-4">
            <Input
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              fullWidth
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowConfirmation(false);
                setConfirmText('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              onClick={handleProceedToOtp}
              disabled={confirmText !== 'DELETE' || loading}
              loading={loading}
            >
              Proceed to Verification
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-blue-700 dark:text-blue-400 font-medium mb-2">OTP Verification Required</h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              For security, we've sent a 6-digit verification code to your email address: 
              <span className="font-medium">{email ? email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'your email'}</span>
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-2">
              Please enter the code below to complete account deletion.
            </p>
          </div>
          
          {otpError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {otpError}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center space-x-2">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Didn't receive the code? 
              <button 
                onClick={handleResendOtp} 
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                disabled={loading}
              >
                Resend OTP
              </button>
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowOtpVerification(false);
                setShowConfirmation(false);
                setConfirmText('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              onClick={handleVerifyOtp}
              disabled={otpValues.some(v => !v) || loading}
              loading={loading}
            >
              Verify & Delete Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

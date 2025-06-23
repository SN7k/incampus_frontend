import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// Minimal ForgotPassword form
const ForgotPassword: React.FC<{ onBack: () => void; onOtpSent: (identifier: string, role: UserRole) => void }> = ({ onBack, onOtpSent }) => {
  const [identifier, setIdentifier] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { authApi } = useAuth() as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(identifier, role);
      onOtpSent(identifier, role);
    } catch (err: any) {
      // Handle both Error objects (from interceptor) and axios error objects
      let errorMessage = 'Failed to send OTP.';
      
      if (err instanceof Error) {
        // This is a plain Error object from the API interceptor
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        // This is an axios error object
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        // Fallback for other error types
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Forgot Password</h2>
        <p className="text-gray-600 dark:text-gray-400">Enter your email or university ID to receive an OTP</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email or University ID
          </label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter your email or university ID"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            I am a:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Student</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="faculty"
                checked={role === 'faculty'}
                onChange={() => setRole('faculty')}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Faculty</span>
            </label>
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send OTP
        </Button>
        <div className="mt-4 text-center">
          <button type="button" onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

type UserRole = 'student' | 'faculty';

interface LoginFormProps {
  onShowSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowSignup }) => {
  const { login, loading, error, clearCorruptedData, authApi } = useAuth() as any;
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'student' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showClearDataOption, setShowClearDataOption] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'otp'>('login');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpRole, setOtpRole] = useState<UserRole>('student');

  // For OTP reset password
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.identifier, formData.password, formData.role);
    } catch (error) {
      setShowClearDataOption(true);
    }
  };

  const handleClearData = () => {
    clearCorruptedData();
    setShowClearDataOption(false);
  };

  // Handle OTP verification and password reset
  const handleOtpVerification = async (otp: string, newPassword: string) => {
    setResetLoading(true);
    setResetError('');
    try {
      await authApi.resetPassword(otpIdentifier, otp, newPassword, otpRole);
      setResetSuccess(true);
      // Show success message for 2 seconds before redirecting to login
      setTimeout(() => {
        setView('login');
        // Optionally prefill the login form with the identifier
        setFormData(prev => ({...prev, identifier: otpIdentifier}));
      }, 2000);
    } catch (err: any) {
      // Handle both Error objects (from interceptor) and axios error objects
      let errorMessage = 'Failed to reset password.';
      
      if (err instanceof Error) {
        // This is a plain Error object from the API interceptor
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        // This is an axios error object
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        // Fallback for other error types
        errorMessage = err.message;
      }
      
      console.error('Reset password error:', err);
      setResetError(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  // Render views
  if (view === 'forgot') {
    return <ForgotPassword onBack={() => setView('login')} onOtpSent={(identifier, role) => { setOtpIdentifier(identifier); setOtpRole(role); setView('otp'); }} />;
  }
  if (view === 'otp') {
    // Custom OTP + new password form
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Reset Password</h2>
          <p className="text-gray-600 dark:text-gray-400">Enter the OTP sent to your email and set a new password.</p>
        </div>
        
        {resetSuccess ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-center">
            <p className="text-lg font-medium mb-2">Password Reset Successful!</p>
            <p>Redirecting you to login...</p>
          </div>
        ) : (
          <OtpResetForm
            onSubmit={handleOtpVerification}
            loading={resetLoading}
            error={resetError}
            onBack={() => setView('login')}
            identifier={otpIdentifier}
            role={otpRole}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Welcome Back</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in to your InCampus account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email/University ID Field */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email or University ID
          </label>
          <input
            type="text"
            id="identifier"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter your email or university ID"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            I am a:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="student"
                checked={formData.role === 'student'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Student</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="role"
                value="faculty"
                checked={formData.role === 'faculty'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Faculty</span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {/* Clear Data Option */}
        {showClearDataOption && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
            <p className="text-sm mb-2">Having trouble logging in? Your stored data might be corrupted.</p>
            <button
              type="button"
              onClick={handleClearData}
              className="text-sm underline hover:no-underline"
            >
              Clear stored data and try again
            </button>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <button
            onClick={onShowSignup}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Don't have an account? Sign up
          </button>
        </p>
        <p className="text-sm mt-2">
          <button
            type="button"
            onClick={() => setView('forgot')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Forgot password?
          </button>
        </p>
      </div>
    </div>
  );
};

// OTP + new password form
const OtpResetForm: React.FC<{
  onSubmit: (otp: string, newPassword: string) => void;
  loading: boolean;
  error: string;
  onBack: () => void;
  identifier: string;
  role: UserRole;
}> = ({ onSubmit, loading, error, onBack, identifier, role }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendError, setResendError] = useState('');
  const { authApi } = useAuth() as any;

  // Handle countdown timer for resend OTP
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) return 'weak';
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = 
      (hasUpperCase ? 1 : 0) +
      (hasLowerCase ? 1 : 0) +
      (hasNumbers ? 1 : 0) +
      (hasSpecialChars ? 1 : 0);
      
    if (strength < 2) return 'weak';
    if (strength < 4) return 'medium';
    return 'strong';
  };

  const getPasswordStrengthColor = (strength: string) => {
    if (strength === 'weak') return 'bg-red-500';
    if (strength === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const passwordStrength = newPassword ? checkPasswordStrength(newPassword) : '';
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    // Validate password strength
    if (passwordStrength === 'weak') {
      setPasswordError('Password is too weak. Use at least 8 characters including uppercase, lowercase, numbers, and special characters.');
      return;
    }
    
    setPasswordError('');
    onSubmit(otp, newPassword);
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setResendLoading(true);
    setResendError('');
    try {
      // First try using the resendOTP method if the identifier is an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      if (isEmail) {
        await authApi.resendOTP(identifier);
      } else {
        // Fall back to forgotPassword if it's not an email (universityId)
        await authApi.forgotPassword(identifier, role);
      }
      
      setResendSuccess(true);
      setResendCountdown(60); // 60 seconds cooldown
      
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err: any) {
      // Handle both Error objects (from interceptor) and axios error objects
      let errorMessage = 'Failed to resend OTP.';
      
      if (err instanceof Error) {
        // This is a plain Error object from the API interceptor
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        // This is an axios error object
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        // Fallback for other error types
        errorMessage = err.message;
      }
      
      console.error('Failed to resend OTP:', err);
      setResendError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setResendError('');
      }, 5000);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}
      
      {resendSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
          OTP has been resent successfully!
        </div>
      )}
      
      {resendError && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {resendError}
        </div>
      )}
      
      <div className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        The OTP will expire after 10 minutes. If you don't receive it, you can request a new one.
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          OTP
        </label>
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center letter-spacing-1"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            style={{ letterSpacing: '0.5em' }}
            required
          />
          <div className="flex justify-center gap-1 mt-1">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className={`h-1 w-8 rounded-full ${otp.length > i ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              ></div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCountdown > 0 || resendLoading}
            className={`text-sm text-blue-600 dark:text-blue-400 hover:underline ${(resendCountdown > 0 || resendLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {resendLoading ? 'Sending...' : resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter new password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {newPassword && (
          <div className="mt-1">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full ${passwordStrengthColor}`} style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '67%' : '100%' }}></div>
            </div>
            <p className="text-xs mt-1 text-gray-500">
              Password strength: <span className={`font-medium ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{passwordStrength}</span>
            </p>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Confirm new password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      {passwordError && (
        <div className="text-red-500 text-sm">{passwordError}</div>
      )}
      
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Reset Password
      </Button>
      
      <div className="mt-2 text-center">
        <button type="button" onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Back to Login
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
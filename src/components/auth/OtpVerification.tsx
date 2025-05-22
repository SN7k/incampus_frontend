import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import axiosInstance from '../../utils/axios';
// useAuth import removed as it's not needed
import { User } from '../../types';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}

interface OtpVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onResendOtp: () => Promise<void>;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  email, 
  onVerificationComplete,
  onResendOtp 
}) => {
  // Auth context not needed in this component
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      inputRefs.current[pastedData.length - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendDisabled(true);
      setCountdown(30);
      await onResendOtp();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending OTP verification request:', { email, otp: otpString });
      const response = await axiosInstance.post<ApiResponse<{ token: string; user: User }>>('/api/auth/verify-otp', {
        email,
        otp: otpString
      });

      console.log('OTP verification response:', response.data);
      console.log('OTP verification user data:', response.data.data?.user);

      if (response.data.status === 'success' && response.data.data?.token && response.data.data?.user) {
        const { token, user } = response.data.data;
        
        // Log the user data we're about to store
        console.log('Storing user data in localStorage:', user);
        
        // Create a processed user object with all required fields
        const processedUser = {
          ...user,
          // Use collegeId as name if name is not available
          name: user.name || user.collegeId || '',
          // Ensure email exists
          email: user.email || email,
          // Ensure role exists
          role: user.role || 'student'
        };
        
        console.log('Processed user data:', processedUser);
        
        // Store token and processed user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(processedUser));
        
        // Set the token in axios instance
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Call the completion handler
        onVerificationComplete();
      } else {
        setError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter the 6-digit code sent to {email}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          ))}
        </div>
        
        <Button
          type="submit"
          loading={loading}
          className="w-full mb-4"
          size="lg"
        >
          Verify OTP
        </Button>
        
        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendDisabled}
            className={`text-sm font-medium ${
              resendDisabled
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
            }`}
          >
            {resendDisabled
              ? `Resend code in ${countdown}s`
              : 'Resend verification code'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OtpVerification;

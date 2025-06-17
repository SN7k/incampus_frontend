import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  onVerificationComplete: (otp: string) => void;
  onResendOtp: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  email, 
  onVerificationComplete, 
  onResendOtp 
}) => {
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { resendOTP } = useAuth();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    try {
      await onVerificationComplete(otp);
    } catch {
      setFormError('Invalid OTP or server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendOTP(email);
      setCountdown(60); // 60 second countdown
      onResendOtp();
    } catch {
      setFormError('Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (formError) setFormError('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent a verification code to
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-medium">{email}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {formError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {formError}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
            maxLength={6}
            autoFocus
          />
        </div>
        
        <Button
          type="submit"
          loading={loading}
          className="w-full mb-4"
          size="lg"
        >
          Verify Email
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Didn't receive the code?
        </p>
        
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || resendLoading}
          className={`flex items-center justify-center w-full py-2 px-4 rounded-lg transition-colors ${
            countdown > 0 || resendLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
          }`}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
          {countdown > 0 
            ? `Resend in ${countdown}s` 
            : resendLoading 
              ? 'Sending...' 
              : 'Resend Code'
          }
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sign Up
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;

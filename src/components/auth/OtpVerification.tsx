import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';

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
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);
  
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };
  
  const handleResendOtp = async () => {
    try {
      setResendDisabled(true);
      setCountdown(30);
      await onResendOtp();
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      // For demo purposes, we'll just accept any 6-digit OTP
      // In a real app, you would verify this with your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpString === '123456') {
        onVerificationComplete();
      } else {
        setError('Invalid OTP. Please try again or request a new one.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Verify Your Email</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-center space-x-2 mb-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        <Button
          type="submit"
          loading={loading}
          className="w-full mb-4"
          size="lg"
        >
          Verify
        </Button>
        
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendDisabled}
            className={`text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium ${
              resendDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {resendDisabled ? `Resend code in ${countdown}s` : 'Resend code'}
          </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          For demo purposes, use the code: <span className="font-medium">123456</span>
        </div>
      </form>
    </div>
  );
};

export default OtpVerification;

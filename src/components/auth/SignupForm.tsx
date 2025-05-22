import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

interface ApiResponse {
  status: string;
  message?: string;
  data?: any;
}

type UserRole = 'student' | 'faculty';

interface SignupFormProps {
  onBackToLogin: () => void;
  onSignupSuccess: (userData: {
    fullName: string;
    email: string;
    universityId?: string;
    program?: string;
    batch?: string;
    department?: string;
    role: 'student' | 'faculty';
  }) => void;
  onShowProfileSetup: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ 
  onBackToLogin, 
  onSignupSuccess,
  onShowProfileSetup 
}) => {
  const auth = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [program, setProgram] = useState('');
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (role === 'student' && (!universityId || !program || !batch)) {
      setFormError('All fields are required for student registration');
      return;
    }
    
    if (role === 'faculty' && !department) {
      setFormError('Department is required for faculty registration');
      return;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Password strength validation
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    
    // University ID validation for students
    if (role === 'student') {
      const idPattern = /^[A-Z]+\/[A-Z]+\/\d+\/\d+$/;
      if (!idPattern.test(universityId)) {
        setFormError('Invalid university ID format. Example: BWU/BCA/20/123');
        return;
      }
    }
    
    // Make API call to register user
    setLoading(true);
    try {
      // Prepare user data for API
      const userData = {
        name: fullName,
        email,
        password,
        role,
        collegeId: role === 'student' ? universityId : undefined,
        ...(role === 'student' ? {
          program,
          batch
        } : {
          department
        })
      };
      
      console.log('Sending signup request with data:', { ...userData, password: '[REDACTED]' });
      
      // Send registration request to backend
      const response = await axiosInstance.post<ApiResponse>('/api/auth/signup', userData);
      
      console.log('Signup response:', response.data);
      
      if (response.data.status === 'success') {
        console.log('Registration successful, proceeding to OTP verification');
        setShowOTPVerification(true);
        
        // Pass the user data to the parent component to handle OTP verification
        onSignupSuccess({
          role,
          fullName,
          email,
          universityId: role === 'student' ? universityId : undefined,
          program: role === 'student' ? program : undefined,
          batch: role === 'student' ? batch : undefined,
          department: role === 'faculty' ? department : undefined
        });
      } else {
        setFormError(response.data.message || 'Failed to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setFormError(error.response.data.message || 'Failed to create account. Please try again.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        setFormError('No response from server. Please check your internet connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setFormError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      const response = await axiosInstance.post<ApiResponse>('/api/auth/verify-otp', {
        email,
        otp
      });

      console.log('OTP verification response:', response.data);

      if (response.data.status === 'success' && response.data.data?.token) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        // Update auth context using login function
        await auth.login(email, password);

        // Call onSignupSuccess to update the registration step
        onSignupSuccess({
          fullName,
          email,
          universityId: role === 'student' ? universityId : undefined,
          program: role === 'student' ? program : undefined,
          batch: role === 'student' ? batch : undefined,
          department: role === 'faculty' ? department : undefined,
          role
        });

        // Show profile setup
        onShowProfileSetup();
      } else {
        setFormError('Failed to verify OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      if (error.response?.data?.message) {
        setFormError(error.response.data.message);
      } else {
        setFormError('Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showOTPVerification) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 dark:text-gray-400">Enter the OTP sent to your email</p>
        </div>
        
        <form onSubmit={handleOTPVerification}>
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {formError}
            </div>
          )}
          
          <Input
            label="OTP"
            placeholder="Enter the 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
          />
          
          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2"
            size="lg"
          >
            Verify OTP
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Join InCampus</h2>
        <p className="text-gray-600 dark:text-gray-400">Create your university community account</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {formError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {formError}
          </div>
        )}
        
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              role === 'student'
                ? 'bg-blue-800 text-white dark:bg-blue-700'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              role === 'faculty'
                ? 'bg-blue-800 text-white dark:bg-blue-700'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Faculty
          </button>
        </div>
        
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
        />
        
        <Input
          label="Email"
          type="email"
          placeholder={role === 'faculty' ? "abc.cs@brainwareuniversity.ac.in or personal email" : "Enter your email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        
        {role === 'student' && (
          <>
            <Input
              label="University ID"
              placeholder="BWU/BCA/00/000"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              fullWidth
            />
            
            <Input
              label="Program"
              placeholder="Enter your program (e.g., BCA, MCA, BTech)"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              fullWidth
            />
            
            <Input
              label="Batch"
              placeholder="Year of admission (e.g., 2023)"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              fullWidth
            />
          </>
        )}
        
        {role === 'faculty' && (
          <>
            <Input
              label="Department"
              placeholder="Enter your department (e.g., CS, ECE, EE)"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              fullWidth
            />
          </>
        )}
        
        <Input
          label="Password"
          type="password"
          placeholder="Create a password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
        />
        
        <Button
          type="submit"
          loading={loading}
          className="w-full mt-2"
          size="lg"
        >
          Create Account
        </Button>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;

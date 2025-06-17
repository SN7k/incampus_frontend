import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
}

const SignupForm: React.FC<SignupFormProps> = ({ onBackToLogin, onSignupSuccess }) => {
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

  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    
    setLoading(true);
    try {
      // Use the collegeId field for universityId
      const collegeId = role === 'student' ? universityId : department;
      
      // Debug logging
      console.log('Signup data:', {
        email,
        role,
        collegeId,
        universityId,
        department,
        fullName
      });
      
      // Additional validation to ensure collegeId is not empty
      if (!collegeId || collegeId.trim() === '') {
        setFormError(role === 'student' ? 'University ID is required' : 'Department is required');
        setLoading(false);
        return;
      }
      
      const response = await signup(email, password, collegeId, fullName, role);
      
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
      
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          setFormError(axiosError.response.data.message);
        } else if (axiosError.response?.data?.errors) {
          // Show the first validation error
          setFormError(axiosError.response.data.errors[0]?.msg || 'Signup failed. Please try again.');
        } else {
          setFormError('Signup failed. Please try again.');
        }
      } else {
        setFormError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          placeholder="Enter your password"
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
          className="w-full mt-6"
          size="lg"
        >
          Create Account
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

export default SignupForm;

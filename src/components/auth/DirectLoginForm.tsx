import React, { useState } from 'react';
import { directLogin } from '../../utils/directLogin';
import Button from '../ui/Button';
import Input from '../ui/Input';

type UserRole = 'student' | 'faculty';

interface DirectLoginFormProps {
  onShowSignup: () => void;
}

const DirectLoginForm: React.FC<DirectLoginFormProps> = ({ onShowSignup }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    console.log('Direct login form submission initiated');
    
    if (!identifier) {
      setFormError(role === 'student' ? 'Student ID or email is required' : 'Email is required');
      setLoading(false);
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      setLoading(false);
      return;
    }
    
    // Check if the identifier is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    console.log('Identifier is email:', isEmail);
    
    // If it's a student and not an email, validate the university ID format
    if (role === 'student' && !isEmail) {
      const idPattern = /^[A-Z]+\/[A-Z]+\/\d+\/\d+$|^[A-Z]+\/[A-Z]+\/[A-Z]+\/\d+$/;
      if (!idPattern.test(identifier)) {
        setFormError('Invalid university ID format. Example: BWU/BCA/20/123');
        setLoading(false);
        return;
      }
    }
    
    try {
      // Use our direct login utility
      const success = await directLogin(identifier, password, role);
      
      if (success) {
        setLoginSuccess(true);
        setFormError('');
        console.log('Login successful, redirecting...');
      } else {
        setFormError('Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error caught in DirectLoginForm:', error);
      setFormError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-400 mb-2">Welcome to InCampus</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in with your university credentials</p>
      </div>
      
      {loginSuccess ? (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
          Login successful! Redirecting to your dashboard...
        </div>
      ) : (
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
            id="login-identifier"
            name="identifier"
            label={role === 'student' ? "Student ID or Email" : "Email"}
            placeholder={role === 'student' ? "BWU/ABC/00/000 or your email" : "Enter your email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            fullWidth
            aria-required="true"
          />
          
          <Input
            id="login-password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            aria-required="true"
          />
          
          <div className="flex items-center justify-between mb-6 mt-2">
            <div className="flex items-center">
              <input 
                id="remember-me"
                name="remember-me"
                type="checkbox" 
                className="h-4 w-4 text-blue-800 dark:text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <a href="#" className="text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Forgot password?
              </a>
            </div>
          </div>
          
          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>
        </form>
      )}
      
      <div className="mt-6 text-center text-sm">
        <button
          type="button"
          onClick={onShowSignup}
          className="text-blue-800 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};

export default DirectLoginForm;

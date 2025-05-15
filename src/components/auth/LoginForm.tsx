import React, { useState, InputHTMLAttributes } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import SignupFormNew from './SignupFormNew';

// Custom Input component for LoginForm that always stays light
interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const LoginInput: React.FC<LoginInputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-gray-700 font-medium mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          px-4 py-2 rounded-lg border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-white text-gray-900 w-full transition-colors duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const LoginForm: React.FC = () => {
  // All state declarations must be at the top level of the component
  const [showSignup, setShowSignup] = useState(false);
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, loading, error } = useAuth();
  
  // Toggle between login and signup forms
  const toggleForm = () => {
    console.log('Toggling form, current state:', showSignup);
    setShowSignup(!showSignup);
  };
  
  if (showSignup) {
    console.log('Showing signup form');
    return <SignupFormNew onToggleForm={toggleForm} />;
  }
  
  console.log('Showing login form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!universityId) {
      setFormError('University ID is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    // Validate university ID format (e.g., BWU/BCA/00/000)
    const idPattern = /^[A-Z]+\/[A-Z]+\/\d+\/\d+$|^[A-Z]+\/[A-Z]+\/[A-Z]+\/\d+$/;
    if (!idPattern.test(universityId)) {
      setFormError('Invalid university ID format. Example: BWU/BCA/20/123');
      return;
    }
    
    await login(universityId, password);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Welcome to InCampus</h2>
        <p className="text-gray-600">Sign in with your university credentials</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {(formError || error) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {formError || error}
          </div>
        )}
        
        <LoginInput
          label="University ID"
          placeholder="BWU/BCA/00/000"
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
          fullWidth
        />
        
        <LoginInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        
        <div className="flex items-center justify-between mb-6 mt-2">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              className="h-4 w-4 text-blue-800 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="text-blue-800 hover:text-blue-700 font-medium">
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
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => {
              console.log('Sign Up button clicked');
              toggleForm();
            }}
            className="text-blue-800 hover:text-blue-700 font-medium"
          >
            Sign Up
          </button>
        </p>
        {/* Login credentials removed */}
      </div>
    </div>
  );
};

export default LoginForm;
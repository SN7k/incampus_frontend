import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

type UserRole = 'student' | 'faculty';

interface LoginFormProps {
  onShowSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowSignup }) => {
  const { login, loading, error, clearCorruptedData } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'student' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showClearDataOption, setShowClearDataOption] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.identifier, formData.password, formData.role);
    } catch (error) {
      // If login fails, show option to clear data
      setShowClearDataOption(true);
    }
  };

  const handleClearData = () => {
    clearCorruptedData();
    setShowClearDataOption(false);
  };

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
          Don't have an account?{' '}
          <button
            onClick={onShowSignup}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
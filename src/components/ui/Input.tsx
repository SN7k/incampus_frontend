import React, { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = props.type === 'password';
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            px-4 py-2 rounded-lg border ${error ? 'border-red-500 dark:border-red-800' : 'border-gray-300 dark:border-gray-600'} 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
            w-full transition-colors duration-200
            ${isPasswordField ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
          type={isPasswordField ? (showPassword ? 'text' : 'password') : props.type}
        />
        {isPasswordField && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
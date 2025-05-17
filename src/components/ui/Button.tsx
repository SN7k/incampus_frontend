import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'navbar';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  mobileStyle?: boolean; // New prop for mobile-specific styling
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  mobileStyle = false, // Default to false
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes all buttons will have
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center';
  
  // Mobile-specific classes to match Navbar image styling
  const mobileClasses = mobileStyle ? 'md:border-2 md:border-blue-200 md:dark:border-blue-700 md:hover:border-blue-400 md:dark:hover:border-blue-500' : '';
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-blue-800 hover:bg-blue-900 text-white focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800',
    secondary: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-300 dark:bg-amber-600 dark:hover:bg-amber-700',
    outline: 'bg-transparent border border-blue-800 text-blue-800 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/30',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-700',
    navbar: 'bg-transparent text-gray-700 active:bg-gray-100 focus:ring-gray-300 dark:text-gray-300 dark:active:bg-gray-700',
  };
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };
  
  // Disabled state
  const disabledClasses = disabled || loading ? 'opacity-70 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${mobileClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;
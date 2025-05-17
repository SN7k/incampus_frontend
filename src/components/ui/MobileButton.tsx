import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import Button from './Button';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

/**
 * MobileButton component that extends the regular Button component
 * but adds styling to match the Navbar profile image on mobile devices
 */
const MobileButton: React.FC<MobileButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  loading = false,
  children,
  className = '',
  ...props
}) => {
  // Use the same styling as desktop buttons
  const mobileClasses = 'rounded-full flex items-center justify-center transition-all';
  
  return (
    <Button
      variant={variant}
      size={size}
      loading={loading}
      className={`${mobileClasses} ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default MobileButton;

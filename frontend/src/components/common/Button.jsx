import React from 'react';
import { Loader2 } from 'lucide-react'; // Make sure lucide-react is installed

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = false,
  isLoading = false, // Added for Auth
  disabled,          // Added for Auth
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100';
  const shapeStyles = icon ? 'rounded-full' : 'rounded-lg';
  
  // Hover styles (disabled when loading)
  const hoverStyles = !isLoading ? 'hover:scale-105 hover:-translate-y-0.5' : '';

  const variants = {
    primary: `bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-2xl ${hoverStyles}`,
    secondary: `bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-2xl ${hoverStyles}`,
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600',
    ghost: 'text-gray-700 hover:text-white-500'
  };

  const sizes = {
    sm: icon ? 'w-10 h-10' : 'px-4 py-2 text-sm',
    md: icon ? 'w-12 h-12' : 'px-6 py-3 text-base',
    lg: icon ? 'w-14 h-14' : 'px-8 py-4 text-lg'
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyles} ${shapeStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {/* Show spinner when loading, otherwise show children */}
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300';
  const shapeStyles = icon ? 'rounded-full' : 'rounded-lg';
  const hoverStyles = 'hover:scale-105 hover:-translate-y-0.5';

  const variants = {
    primary: `bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-2xl ${hoverStyles}`,
    secondary: `bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-2xl ${hoverStyles}`,
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600',
    ghost: 'text-gray-700 hover:text-orange-500 hover:bg-orange-50'
  };

  const sizes = {
    sm: icon ? 'w-10 h-10' : 'px-4 py-2 text-sm',
    md: icon ? 'w-12 h-12' : 'px-6 py-3 text-base',
    lg: icon ? 'w-14 h-14' : 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={`${baseStyles} ${shapeStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

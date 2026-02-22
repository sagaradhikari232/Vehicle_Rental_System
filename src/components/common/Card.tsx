import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function Card({
  children,
  className = '',
  hover = false,
  gradient = false
}: CardProps) {
  const baseStyles = 'rounded-2xl backdrop-blur-sm border border-gray-100';
  const bgStyles = gradient
    ? 'bg-gradient-to-br from-white via-white to-orange-50'
    : 'bg-white';
  const shadowStyles = 'shadow-lg';
  const hoverStyles = hover
    ? 'transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-1 hover:border-orange-200 cursor-pointer'
    : 'transition-colors duration-300';

  return (
    <div
      className={`${baseStyles} ${bgStyles} ${shadowStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}

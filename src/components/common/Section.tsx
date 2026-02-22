import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'gray' | 'dark';
}

export default function Section({
  children,
  className = '',
  id,
  background = 'white'
}: SectionProps) {
  const backgroundStyles = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gradient-to-b from-gray-950 to-gray-900'
  };

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${backgroundStyles[background]} ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {children}
      </div>
    </section>
  );
}

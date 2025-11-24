import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'primary' 
}) => {
  const variantClasses = {
    primary: 'bg-[var(--card)]',
    secondary: 'bg-[var(--card)]',
    accent: 'bg-[var(--card)]',
  };

  return (
    <div
      className={`
        border border-[var(--border)] shadow-card rounded-lg p-6 
        ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
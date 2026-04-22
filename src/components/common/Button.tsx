import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, To } from 'react-router-dom';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  /** Renders as React Router `Link` with the same styles (avoids invalid `<a><button>` nesting). */
  to?: To;
  replace?: boolean;
  /** External URL — renders `<a target="_blank" rel="noopener noreferrer">`. */
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  to,
  replace,
  href,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500/60 focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-black/[0.06] hover:shadow-lg dark:shadow-black/25';

  const variantClasses = {
    primary: 'bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-primary-600',
    secondary: 'bg-[var(--card)] text-[var(--fg)] border border-[var(--border)] hover:bg-neutral-100 dark:hover:bg-neutral-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  };

  const merged = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={merged}>
        {children}
      </a>
    );
  }

  if (to != null && to !== '') {
    return (
      <Link to={to} replace={replace} className={merged}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = props;
  return (
    <button type={type} className={merged} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;

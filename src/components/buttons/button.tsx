import React from 'react';

import { cn } from '@/utils/cn';

export interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'transparent';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const baseStyles =
    'inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 focus-visible:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
    transparent: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300',
  };

  return (
    <button
      type={type}
      onClick={onClick ? () => onClick() : undefined}
      disabled={disabled}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      {children || label}
    </button>
  );
};

export default Button;

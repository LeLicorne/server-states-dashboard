import React from 'react';

import { cn } from '@/utils/cn';

interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, active, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex min-h-10 flex-row items-center overflow-hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100',
        active && 'bg-slate-900 text-white hover:bg-slate-900/90',
        className
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className={cn(
          'ml-2 whitespace-nowrap transition-all duration-500 ease-in-out',
          label ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default IconButton;

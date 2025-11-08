import React from 'react';

import { cn } from '@/utils/cn';

interface IconButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-row items-center rounded-md p-2 transition-all hover:bg-gray-200 overflow-hidden',
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

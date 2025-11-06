import { FunctionComponent } from '@/commons/types';
import { cn } from '@/utils/cn';

export interface TagProps {
  label?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  color: 'gray' | 'orange' | 'blue' | 'green' | 'red';
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  label,
  leadingIcon,
  trailingIcon,
  color,
  className,
}): FunctionComponent => {
  const colors = {
    gray: 'bg-gray-200 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400 w-fit',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-500',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-500',
    green: 'bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-500',
    red: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-xs font-medium text-nowrap',
        colors[color],
        className
      )}
    >
      {leadingIcon}
      {label}
      {trailingIcon}
    </span>
  );
};

export default Tag;

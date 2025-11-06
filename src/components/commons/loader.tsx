import { FunctionComponent } from '@/commons/types';
import { cn } from '@/utils/cn';

interface LoaderProps {
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ className }): FunctionComponent => {
  return (
    <div
      className={cn(
        'm-auto size-8 animate-spin rounded-full border-[3px] border-current border-t-transparent text-blue-600 dark:text-blue-500',
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;

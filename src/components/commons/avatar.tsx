import { cn } from '@/utils/cn';

type AvatarProps = {
  src?: string;
  alt: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ src, alt, size, className }) => {
  const baseClass =
    'flex shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800';

  const sizeClass = {
    sm: 'size-6',
    md: 'size-10',
    lg: 'size-16',
    xl: 'size-24',
  }[size];

  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[size];

  return (
    <div className={cn(baseClass, sizeClass, className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`rounded-full ${textSizeClass} ${sizeClass} object-contain`}
        />
      ) : (
        <p className={`font-semibold uppercase ${textSizeClass}`}>{alt}</p>
      )}
    </div>
  );
};

export default Avatar;

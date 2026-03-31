import clsx from 'clsx';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = ({ name, size = 'md', className }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((n) => n?.[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={clsx(
        'rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

export default Avatar;
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return <Loader2 className={`animate-spin text-primary ${className}`} size={sizes[size]} />;
};

export default Spinner;
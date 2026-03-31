import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-primary hover:bg-green-600 text-white shadow-md hover:shadow-lg',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
      md: 'px-4 py-2.5 text-sm font-bold rounded-xl',
      lg: 'px-6 py-3 text-base font-bold rounded-xl',
    };

    const disabledStyles = (disabled || isLoading) && 'opacity-60 cursor-not-allowed';

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 transition-all duration-200',
          variants[variant],
          sizes[size],
          disabledStyles,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} className="animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
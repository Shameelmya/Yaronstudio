import React from 'react';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-yaron-charcoal text-white hover:bg-black',
      secondary: 'bg-yaron-magenta/10 text-yaron-magenta hover:bg-yaron-magenta/20',
      outline: 'border border-gray-200 bg-white hover:bg-gray-50 text-yaron-charcoal',
      ghost: 'hover:bg-gray-100 text-yaron-charcoal',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-11 px-6 font-medium',
      lg: 'h-14 px-8 text-lg font-medium',
      icon: 'h-10 w-10 p-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Music className="animate-bounce -ml-1 mr-2 h-4 w-4" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

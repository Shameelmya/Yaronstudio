import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-yaron-charcoal ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-12 rounded-xl bg-gray-50 border border-gray-200 text-yaron-charcoal transition-all",
              "focus:outline-none focus:ring-2 focus:ring-yaron-magenta/20 focus:border-yaron-magenta focus:bg-white",
              "placeholder:text-gray-400 disabled:opacity-50",
              icon ? "pl-11 pr-4" : "px-4",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500 ml-1 mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

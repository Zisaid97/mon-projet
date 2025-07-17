import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-300 font-medium rounded-xl';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    gradient: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl animate-gradient'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        'hover:scale-105 active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className={cn('flex items-center gap-2', loading && 'opacity-0')}>
        {Icon && iconPosition === 'left' && (
          <Icon className={iconSizeClasses[size]} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={iconSizeClasses[size]} />
        )}
      </div>
      
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </Button>
  );
};

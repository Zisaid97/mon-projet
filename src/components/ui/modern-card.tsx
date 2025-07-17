import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  value?: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-600',
  value,
  change,
  className,
  children,
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1';
  
  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-lg',
    gradient: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200 shadow-lg',
    glass: 'bg-white/80 backdrop-blur-md border-gray-200/50 shadow-lg'
  };
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600 bg-green-100';
      case 'decrease':
        return 'text-red-600 bg-red-100';
      case 'neutral':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}>
      {/* Header avec icône et titre */}
      {(Icon || title) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn('p-2 rounded-xl', iconColor.includes('indigo') ? 'bg-indigo-100' : 'bg-gray-100')}>
                <Icon className={cn('h-6 w-6', iconColor)} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Valeur principale */}
      {value && (
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
          {change && (
            <div className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getChangeColor(change.type))}>
              {change.type === 'increase' && '↗'}
              {change.type === 'decrease' && '↘'}
              {change.type === 'neutral' && '→'}
              <span className="ml-1">{change.value}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Contenu personnalisé */}
      {children && (
        <div className="space-y-4">
          {children}
        </div>
      )}
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

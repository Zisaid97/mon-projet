import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface ModernStatsProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const ModernStats: React.FC<ModernStatsProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  size = 'md',
  loading = false
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'from-blue-500 to-blue-600',
          text: 'text-blue-600',
          light: 'bg-blue-50 border-blue-200'
        };
      case 'green':
        return {
          bg: 'from-green-500 to-green-600',
          text: 'text-green-600',
          light: 'bg-green-50 border-green-200'
        };
      case 'purple':
        return {
          bg: 'from-purple-500 to-purple-600',
          text: 'text-purple-600',
          light: 'bg-purple-50 border-purple-200'
        };
      case 'orange':
        return {
          bg: 'from-orange-500 to-orange-600',
          text: 'text-orange-600',
          light: 'bg-orange-50 border-orange-200'
        };
      case 'red':
        return {
          bg: 'from-red-500 to-red-600',
          text: 'text-red-600',
          light: 'bg-red-50 border-red-200'
        };
      case 'indigo':
        return {
          bg: 'from-indigo-500 to-indigo-600',
          text: 'text-indigo-600',
          light: 'bg-indigo-50 border-indigo-200'
        };
      default:
        return {
          bg: 'from-blue-500 to-blue-600',
          text: 'text-blue-600',
          light: 'bg-blue-50 border-blue-200'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          icon: 'w-8 h-8',
          iconContainer: 'w-12 h-12',
          title: 'text-xs',
          value: 'text-lg',
          change: 'text-xs'
        };
      case 'md':
        return {
          container: 'p-6',
          icon: 'w-6 h-6',
          iconContainer: 'w-14 h-14',
          title: 'text-sm',
          value: 'text-2xl',
          change: 'text-sm'
        };
      case 'lg':
        return {
          container: 'p-8',
          icon: 'w-8 h-8',
          iconContainer: 'w-16 h-16',
          title: 'text-base',
          value: 'text-3xl',
          change: 'text-base'
        };
      default:
        return {
          container: 'p-6',
          icon: 'w-6 h-6',
          iconContainer: 'w-14 h-14',
          title: 'text-sm',
          value: 'text-2xl',
          change: 'text-sm'
        };
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getChangeTextColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl ${sizes.container} shadow-lg border border-gray-200/50 animate-pulse`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div className={`${sizes.iconContainer} bg-gray-200 rounded-2xl`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl ${sizes.container} shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className={`${sizes.title} font-medium text-gray-600 mb-1`}>
            {title}
          </h3>
          <p className={`${sizes.value} font-bold text-gray-900 mb-2`}>
            {value}
          </p>
          {change && (
            <div className={`flex items-center space-x-1 ${sizes.change}`}>
              {getChangeIcon()}
              <span className={`font-medium ${getChangeTextColor()}`}>
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              {change.period && (
                <span className="text-gray-500">vs {change.period}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${sizes.iconContainer} bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`${sizes.icon} text-white`} />
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour afficher plusieurs statistiques en grille
interface ModernStatsGridProps {
  stats: Array<ModernStatsProps>;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const ModernStatsGrid: React.FC<ModernStatsGridProps> = ({
  stats,
  columns = 3,
  gap = 'md'
}) => {
  const getGridClasses = () => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    };

    return `grid ${colClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={getGridClasses()}>
      {stats.map((stat, index) => (
        <ModernStats key={index} {...stat} />
      ))}
    </div>
  );
};

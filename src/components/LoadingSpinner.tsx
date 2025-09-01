'use client';
import { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-purple-600 border-t-transparent', 
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export const LoadingDots: FC<LoadingDotsProps> = ({ 
  size = 'md',
  color = 'primary', 
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-purple-600',
    white: 'bg-white',
    gray: 'bg-gray-600'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}></div>
    </div>
  );
};

interface LoadingPulseProps {
  className?: string;
}

export const LoadingPulse: FC<LoadingPulseProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex space-x-4">
        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

interface LoadingBarsProps {
  bars?: number;
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export const LoadingBars: FC<LoadingBarsProps> = ({ 
  bars = 3,
  color = 'primary',
  className = ''
}) => {
  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-purple-600', 
    white: 'bg-white',
    gray: 'bg-gray-600'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 h-4 ${colorClasses[color]} animate-pulse`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineLoading: FC<InlineLoadingProps> = ({ 
  text = 'Loading...',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      <span className="text-gray-600 text-sm">{text}</span>
    </div>
  );
};
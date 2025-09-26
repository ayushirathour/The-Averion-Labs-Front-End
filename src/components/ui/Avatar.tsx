
import React from 'react';
import { cn } from '@/utils/helpers';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };

  // Show fallback if no src, image error, or fallback text provided
  const showFallback = !src || imageError || loading;

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600',
      sizeClasses[size],
      className
    )}>
      {src && !imageError && (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: loading ? 'none' : 'block' }}
        />
      )}
      
      {showFallback && (
        <div className="flex items-center justify-center w-full h-full bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
          {loading ? (
            <div className="animate-pulse">•••</div>
          ) : (
            fallback || '👤'
          )}
        </div>
      )}
    </div>
  );
};

// Default export for compatibility
export default Avatar;

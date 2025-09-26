import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  title,
  children,
  className,
  onClick,
}) => {
  const cardClasses = cn(
    'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
    onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
    className
  );

  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { duration: 0.2 },
  } : {};

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      {...cardProps}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </CardComponent>
  );
};

export default Card;

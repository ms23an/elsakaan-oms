
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  value = 0, 
  onChange, 
  readOnly = false,
  size = 'md'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };
  
  const handleMouseEnter = (rating: number) => {
    if (readOnly) return;
    setHoverRating(rating);
  };
  
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };
  
  const handleClick = (rating: number) => {
    if (readOnly || !onChange) return;
    onChange(rating);
  };
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={cn(
            'rating-star',
            sizes[size],
            (hoverRating || value) >= rating ? 'filled' : 'empty',
            !readOnly && 'cursor-pointer'
          )}
          fill={(hoverRating || value) >= rating ? 'currentColor' : 'none'}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(rating)}
        />
      ))}
    </div>
  );
};

export default StarRating;

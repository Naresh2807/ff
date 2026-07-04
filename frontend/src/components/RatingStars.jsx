import React, { useState } from 'react';
import { Star } from 'lucide-react';

function RatingStars({ rating, onRate, readonly = false, size = 'md' }) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = (value) => {
    if (readonly) return;
    if (onRate) onRate(value);
  };

  const handleMouseEnter = (value) => {
    if (readonly) return;
    setHoveredRating(value);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating || 0;

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${
            !readonly && 'hover:scale-110'
          }`}
        >
          <Star
            className={`${sizes[size]} ${
              star <= displayRating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 fill-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

export default RatingStars;
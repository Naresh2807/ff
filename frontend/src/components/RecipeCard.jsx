import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Star } from 'lucide-react';

function RecipeCard({ recipe }) {
  const { _id, title, image, averageRating, cuisine, mealType, prepTime, servings, author } = recipe;

  return (
    <Link to={`/recipe/${_id}`} className="block group">
      <div className="card bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-200">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=FlavorFusion';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
              {cuisine}
            </span>
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
              {mealType}
            </span>
          </div>
          
          {/* Rating */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-gray-700">
              {averageRating ? averageRating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            by {author?.name || 'Anonymous'}
          </p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{prepTime}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{servings} servings</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
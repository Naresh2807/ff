import React, { useState, useEffect } from 'react';
import { getFavorites } from '../api/api';
import RecipeCard from '../components/RecipeCard';
import Loader from '../components/Loader';
import { Heart } from 'lucide-react';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      setFavorites(response.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Heart className="w-8 h-8 text-primary fill-primary" />
        <h1 className="text-3xl font-extrabold text-gray-800">My Favorites</h1>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          {favorites.length} recipes
        </span>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchFavorites} className="btn-primary mt-4">Retry</button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="text-6xl mb-4">❤️</p>
          <h3 className="text-2xl font-semibold text-gray-600">No favorites yet</h3>
          <p className="text-gray-400 mt-2">Start saving your favorite recipes!</p>
          <a href="/" className="btn-primary inline-block mt-4">Explore Recipes</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
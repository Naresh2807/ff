import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import { getFavorites } from "../api/api";
import RecipeCard from "../components/RecipeCard";
import Loader from "../components/Loader";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getFavorites();

      console.log("❤️ Favorites Response:", response);

      // Handle different backend response formats
      if (Array.isArray(response)) {
        setFavorites(response);
      } else if (Array.isArray(response.favorites)) {
        setFavorites(response.favorites);
      } else if (Array.isArray(response.data)) {
        setFavorites(response.data);
      } else if (response.success && Array.isArray(response.favorites)) {
        setFavorites(response.favorites);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load favorites."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary fill-primary" />

        <h1 className="text-3xl font-extrabold text-gray-800">
          My Favorites
        </h1>

        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          {favorites.length} Recipes
        </span>
      </div>

      {error ? (
        <div className="text-center py-12">

          <p className="text-red-500 mb-4">
            {error}
          </p>

          <button
            onClick={fetchFavorites}
            className="btn-primary"
          >
            Retry
          </button>

        </div>
      ) : favorites.length === 0 ? (

        <div className="bg-white rounded-2xl shadow-sm py-16 text-center">

          <div className="text-6xl mb-4">
            ❤️
          </div>

          <h2 className="text-2xl font-bold text-gray-700">
            No Favorite Recipes
          </h2>

          <p className="text-gray-500 mt-2">
            Start adding recipes to your favorites.
          </p>

          <Link
            to="/"
            className="btn-primary inline-block mt-6"
          >
            Explore Recipes
          </Link>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
            />
          ))}

        </div>

      )}

    </div>
  );
}

export default Favorites;
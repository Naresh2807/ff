import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getRecipe,
  toggleLike,
  rateRecipe,
  addComment,
  toggleFavorite,
  checkFavorite,
  deleteRecipe,
} from '../api/api';
import RatingStars from '../components/RatingStars';
import CommentSection from '../components/CommentSection';
import Loader from '../components/Loader';
import {
  Heart,
  Clock,
  Users,
  ChefHat,
  ArrowLeft,
  Share2,
  Edit,
  Trash2,
  Star,
  Play,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='60' text-anchor='middle' dy='.3em' fill='%239ca3af'%3E🍽️%3C/text%3E%3C/svg%3E";

function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Memoized values for performance
  const imageUrl = useMemo(
    () => (recipe?.image ? `${BASE_URL}${recipe.image}` : PLACEHOLDER_IMAGE),
    [recipe?.image]
  );
  const videoUrl = useMemo(
    () => (recipe?.video ? `${BASE_URL}${recipe.video}` : ''),
    [recipe?.video]
  );
  const displayRating = useMemo(
    () =>
      recipe?.averageRating != null
        ? Number(recipe.averageRating).toFixed(1)
        : 'No ratings',
    [recipe?.averageRating]
  );

  const fetchRecipe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [getRecipe(id)];
      if (isAuthenticated) {
        requests.push(checkFavorite(id));
      }

      const results = await Promise.allSettled(requests);
      const recipeResult = results[0];

      if (recipeResult.status === 'rejected') {
        throw recipeResult.reason;
      }

      const recipeData = recipeResult.value;
      if (!recipeData || !recipeData._id) {
        throw new Error('Recipe not found');
      }

      setRecipe(recipeData);
      setIsLiked(recipeData.isLiked || false);
      setLikesCount(recipeData.likes?.length || 0);
      setUserRating(recipeData.userRating || null);

      if (isAuthenticated && results[1]) {
        const favResult = results[1];
        if (favResult.status === 'fulfilled') {
          setIsFavorite(favResult.value.isFavorite);
        }
      }

      setError(null);
    } catch (err) {
      console.error('❌ Error fetching recipe:', err);
      setError(err.response?.status === 404 ? 'Recipe not found' : 'Unable to load recipe.');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const response = await toggleLike(id);
      const data = response.data;
      setIsLiked(data.isLiked);
      const newCount = Array.isArray(data.likes) ? data.likes.length : data.likes;
      setLikesCount(newCount);

      setRecipe((prev) => ({
        ...prev,
        likes: data.isLiked
          ? [...(prev.likes || []), currentUser.id]
          : (prev.likes || []).filter((uid) => uid.toString() !== currentUser.id),
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleRate = async (value) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await rateRecipe(id, value);
      setUserRating(value);
      await fetchRecipe();
    } catch (err) {
      console.error('Error rating:', err);
    }
  };

  // ✅ FIXED: Optimistic favorite toggle
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 1. Save previous state and toggle optimistically
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      // 2. Call the API
      const res = await toggleFavorite(id);

      // 3. Extract the new favorite status (handles both `res.isFavorite` and `res.data.isFavorite`)
      const newFavoriteStatus = res.isFavorite ?? res.data?.isFavorite;

      // 4. If the server returned a value, update the state (in case of race or mismatch)
      if (newFavoriteStatus !== undefined && newFavoriteStatus !== !previousState) {
        setIsFavorite(newFavoriteStatus);
      }
    } catch (err) {
      // 5. Revert on error
      setIsFavorite(previousState);
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleAddComment = async (text) => {
    if (!isAuthenticated) return;
    try {
      setIsAddingComment(true);
      await addComment(id, text);
      await fetchRecipe();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl text-red-500">{error}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Go Home
        </Link>
      </div>
    );
  }
  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl text-gray-500">Recipe not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Go Home
        </Link>
      </div>
    );
  }

  const isAuthor = recipe?.author?._id?.toString() === currentUser?.id?.toString();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to recipes</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Image / Video */}
        <div className="relative h-80 md:h-96 bg-gray-200">
          {showVideo && recipe.video ? (
            <video
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = PLACEHOLDER_IMAGE;
              }}
            />
          )}

          {recipe.video && !showVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
            >
              <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </button>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700">
              {recipe.cuisine}
            </span>
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700">
              {recipe.mealType}
            </span>
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={handleFavorite}
                className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-colors shadow-sm"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  <BookmarkCheck className="w-5 h-5 text-primary" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: recipe.title,
                      text: recipe.description,
                      url: window.location.href,
                    })
                    .catch(() => {});
                } else {
                  navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => alert('Recipe URL copied.'))
                    .catch(() => alert('Could not copy URL.'));
                }
              }}
              className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-white transition-colors shadow-sm"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                {recipe.title}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-700">{displayRating}</span>
                  <span className="text-gray-400 text-sm">
                    ({recipe.ratings?.length || 0})
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Heart
                    className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{likesCount}</span>
                </div>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit-recipe/${id}`}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {/* Author and meta */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-gray-600">
                By{' '}
                <span className="font-semibold text-gray-800">
                  {recipe.author?.name || 'Anonymous'}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>Prep: {recipe.prepTime}m</span>
              <span className="text-gray-300">|</span>
              <span>Cook: {recipe.cookTime}m</span>
              <span className="text-gray-300">|</span>
              <Users className="w-4 h-4 ml-1" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          {/* Rating */}
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-700">Rate this recipe:</span>
              <RatingStars
                rating={userRating || 0}
                onRate={handleRate}
                readonly={!isAuthenticated}
                size="lg"
              />
              {!isAuthenticated && (
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Login to rate
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{recipe.description}</p>
          </div>

          {/* Dietary preferences */}
          {recipe.dietaryPreference?.length > 0 && recipe.dietaryPreference[0] !== 'None' && (
            <div className="py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Dietary Preferences</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dietaryPreference.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Ingredients</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredients?.map((ing, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span>
                    <span className="font-medium">{ing.name}</span>
                    <span className="text-gray-500"> — {ing.amount}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Steps</h3>
            <ol className="space-y-3">
              {recipe.steps?.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-0.5">{step.description}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Comments */}
          <div className="pt-4">
            <CommentSection
              comments={recipe.comments || []}
              onAddComment={handleAddComment}
              isAuthenticated={isAuthenticated}
              isLoading={isAddingComment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recipe;
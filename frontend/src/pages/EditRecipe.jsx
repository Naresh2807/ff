import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, updateRecipe } from '../api/api';
import RecipeForm from '../components/RecipeForm';
import Loader from '../components/Loader';
import { ArrowLeft } from 'lucide-react';

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await getRecipe(id);
        setRecipe(response.data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Recipe not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      const response = await updateRecipe(id, data);
      navigate(`/recipe/${id}`);
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err.response?.data?.message || 'Failed to update recipe. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-2xl text-red-500">{error}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={`/recipe/${id}`} className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to recipe</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Edit Recipe</h1>
        <p className="text-gray-500 mb-6">Update your recipe to make it even better!</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}

export default EditRecipe;
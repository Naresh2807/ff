import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getRecipe, updateRecipe } from "../api/api";
import RecipeForm from "../components/RecipeForm";
import Loader from "../components/Loader";

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);

        const response = await getRecipe(id);

        console.log("📥 Recipe Response:", response);

        let recipeData = null;

        // Backend returns recipe directly
        if (response?._id) {
          recipeData = response;
        }

        // Backend returns { recipe: {...} }
        else if (response?.recipe?._id) {
          recipeData = response.recipe;
        }

        // Backend returns { success:true, recipe:{...} }
        else if (response?.success && response?.recipe) {
          recipeData = response.recipe;
        }

        if (!recipeData) {
          throw new Error(response?.message || "Recipe not found");
        }

        recipeData = {
          ...recipeData,
          image: recipeData.image
            ? `${BASE_URL}${recipeData.image}`
            : "",
          video: recipeData.video
            ? `${BASE_URL}${recipeData.video}`
            : "",
        };

        setRecipe(recipeData);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Recipe not found."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      const response = await updateRecipe(id, data);

      console.log("📤 Update Response:", response);

      // Axios throws automatically for failed requests.
      // If we reach here, update succeeded.

      navigate(`/recipe/${id}`);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update recipe."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-3xl font-bold text-red-500">
          Recipe Not Found
        </h2>

        <p className="mt-3 text-gray-600">{error}</p>

        <Link
          to="/"
          className="btn-primary mt-6 inline-block"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to={`/recipe/${id}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Recipe
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          Edit Recipe
        </h1>

        <p className="text-gray-500 mb-6">
          Update your recipe to make it even better!
        </p>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
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
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { createRecipe } from "../api/api";
import RecipeForm from "../components/RecipeForm";

function AddRecipe() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Axios interceptor already returns response.data
      const response = await createRecipe(data);

      console.log("Create Recipe Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to create recipe.");
      }
      navigate("/");

      // Get recipe ID from different possible response formats
      const recipeId =
        response.recipe?._id ||
        response.recipeId ||
        response._id;

      if (!recipeId) {
        console.warn("Recipe created but no ID returned:", response);

        // Go to home if recipe was created but ID wasn't returned
        navigate("/");
        return;
      }

      navigate(`/recipe/${recipeId}`);
    } catch (err) {
      console.error("Create Recipe Error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create recipe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recipes</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Create New Recipe
        </h1>

        <p className="text-gray-500 mb-6">
          Share your delicious recipe with the FlavorFusion community!
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <RecipeForm
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}

export default AddRecipe;
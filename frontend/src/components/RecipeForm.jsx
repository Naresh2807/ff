import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Image as ImageIcon, Video } from 'lucide-react';

const CUISINE_TYPES = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'French', 'Spanish', 'Greek', 'American', 'Mediterranean', 'Middle Eastern', 'African', 'Korean', 'Vietnamese', 'Other'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'];
const DIETARY_PREFERENCES = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'High-Protein', 'None'];

function RecipeForm({ initialData = {}, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cuisine: '',
    mealType: '',
    dietaryPreference: ['None'],
    ingredients: [{ name: '', amount: '' }],
    steps: [{ description: '' }],
    prepTime: '',
    cookTime: '',
    servings: '',
    image: null,
    video: null,
    existingImage: '',
    existingVideo: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        cuisine: initialData.cuisine || '',
        mealType: initialData.mealType || '',
        dietaryPreference: initialData.dietaryPreference || ['None'],
        ingredients: initialData.ingredients?.length ? initialData.ingredients : [{ name: '', amount: '' }],
        steps: initialData.steps?.length ? initialData.steps : [{ description: '' }],
        prepTime: initialData.prepTime || '',
        cookTime: initialData.cookTime || '',
        servings: initialData.servings || '',
        image: null,
        video: null,
        existingImage: initialData.image || '',
        existingVideo: initialData.video || ''
      });
      if (initialData.image) setImagePreview(initialData.image);
      if (initialData.video) setVideoPreview(initialData.video);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDietaryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => {
      let newDietary = [...prev.dietaryPreference];
      if (value === 'None') {
        newDietary = ['None'];
      } else {
        const index = newDietary.indexOf(value);
        if (index > -1) {
          newDietary.splice(index, 1);
        } else {
          newDietary = newDietary.filter(d => d !== 'None');
          newDietary.push(value);
        }
        if (newDietary.length === 0) newDietary = ['None'];
      }
      return { ...prev, dietaryPreference: newDietary };
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...formData.ingredients];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, ingredients: updated }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length <= 1) return;
    const updated = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: updated }));
  };

  const handleStepChange = (index, value) => {
    const updated = [...formData.steps];
    updated[index].description = value;
    setFormData(prev => ({ ...prev, steps: updated }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { description: '' }]
    }));
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 1) return;
    const updated = formData.steps.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, steps: updated }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, [type]: file }));
    
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (type === 'video') {
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      existingImage: formData.existingImage,
      existingVideo: formData.existingVideo
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <label className="label-text">Recipe Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="input-field"
          placeholder="e.g., Creamy Garlic Pasta"
        />
      </div>

      {/* Description */}
      <div>
        <label className="label-text">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          className="input-field resize-y"
          placeholder="Describe your recipe..."
        />
      </div>

      {/* Cuisine, Meal Type, Dietary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label-text">Cuisine *</label>
          <select
            name="cuisine"
            value={formData.cuisine}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select cuisine</option>
            {CUISINE_TYPES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text">Meal Type *</label>
          <select
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select meal type</option>
            {MEAL_TYPES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text">Dietary Preference</label>
          <select
            value={formData.dietaryPreference.includes('None') ? 'None' : formData.dietaryPreference[0] || 'None'}
            onChange={handleDietaryChange}
            className="input-field"
          >
            {DIETARY_PREFERENCES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prep Time, Cook Time, Servings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label-text">Prep Time (minutes) *</label>
          <input
            type="number"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleChange}
            required
            min="1"
            className="input-field"
            placeholder="e.g., 15"
          />
        </div>
        <div>
          <label className="label-text">Cook Time (minutes) *</label>
          <input
            type="number"
            name="cookTime"
            value={formData.cookTime}
            onChange={handleChange}
            required
            min="0"
            className="input-field"
            placeholder="e.g., 30"
          />
        </div>
        <div>
          <label className="label-text">Servings *</label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
            required
            min="1"
            className="input-field"
            placeholder="e.g., 4"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="label-text">Recipe Image</label>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Choose Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
              className="hidden"
            />
          </label>
          {imagePreview && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview('');
                  setFormData(prev => ({ ...prev, image: null, existingImage: '' }));
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {formData.existingImage && !imagePreview && (
            <span className="text-sm text-green-600">✓ Current image kept</span>
          )}
        </div>
      </div>

      {/* Video Upload */}
      <div>
        <label className="label-text">Recipe Video</label>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
            <Video className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Choose Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video')}
              className="hidden"
            />
          </label>
          {videoPreview && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              <video src={videoPreview} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setVideoPreview('');
                  setFormData(prev => ({ ...prev, video: null, existingVideo: '' }));
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {formData.existingVideo && !videoPreview && (
            <span className="text-sm text-green-600">✓ Current video kept</span>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="label-text">Ingredients *</label>
        <div className="space-y-2">
          {formData.ingredients.map((ing, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={ing.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="flex-1 input-field"
                required
              />
              <input
                type="text"
                value={ing.amount}
                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                placeholder="Amount (e.g., 2 cups)"
                className="w-40 input-field"
                required
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={formData.ingredients.length <= 1}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 flex items-center space-x-1 text-primary hover:text-orange-600 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Steps */}
      <div>
        <label className="label-text">Steps *</label>
        <div className="space-y-2">
          {formData.steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <input
                type="text"
                value={step.description}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1} description`}
                className="flex-1 input-field"
                required
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={formData.steps.length <= 1}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addStep}
          className="mt-2 flex items-center space-x-1 text-primary hover:text-orange-600 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Step</span>
        </button>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
              <span>Saving...</span>
            </>
          ) : (
            <span>{initialData._id ? 'Update Recipe' : 'Create Recipe'}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm;
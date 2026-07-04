import React, { useState, useEffect } from 'react';
import { getMealPlans, createMealPlan, deleteMealPlan, getShoppingList } from '../api/api';
import { getRecipes } from '../api/api';
import { Calendar, Plus, Trash2, ShoppingBag, X, ChevronDown, ChevronUp } from 'lucide-react';
import Loader from '../components/Loader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function MealPlanner() {
  const [mealPlans, setMealPlans] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    breakfast: '',
    lunch: '',
    dinner: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, recipesRes, shoppingRes] = await Promise.all([
        getMealPlans(),
        getRecipes({ limit: 100 }),
        getShoppingList()
      ]);
      setMealPlans(plansRes.data);
      setRecipes(recipesRes.data.recipes || []);
      setShoppingList(shoppingRes.data.shoppingList || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMealPlan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.day) {
      setError('Please select a day');
      return;
    }

    // Check if at least one meal is selected
    if (!formData.breakfast && !formData.lunch && !formData.dinner) {
      setError('Please select at least one meal');
      return;
    }

    try {
      const response = await createMealPlan(formData);
      setMealPlans(prev => [response.data.mealPlan, ...prev]);
      setSuccess('Meal plan added successfully!');
      setShowAddForm(false);
      setFormData({ day: '', breakfast: '', lunch: '', dinner: '' });
      
      // Refresh shopping list
      const shoppingRes = await getShoppingList();
      setShoppingList(shoppingRes.data.shoppingList || []);
    } catch (err) {
      console.error('Error creating meal plan:', err);
      setError(err.response?.data?.message || 'Failed to create meal plan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meal plan?')) return;
    try {
      await deleteMealPlan(id);
      setMealPlans(prev => prev.filter(p => p._id !== id));
      const shoppingRes = await getShoppingList();
      setShoppingList(shoppingRes.data.shoppingList || []);
    } catch (err) {
      console.error('Error deleting meal plan:', err);
    }
  };

  const getDayMeal = (plan, type) => {
    const meal = plan[type];
    if (!meal) return null;
    return recipes.find(r => r._id === meal._id) || meal;
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold text-gray-800">Meal Planner</h1>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {mealPlans.length} plans
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowShoppingList(!showShoppingList)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shopping List ({shoppingList.length})</span>
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setError('');
              setSuccess('');
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Create Meal Plan</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm border border-green-200">
              {success}
            </div>
          )}

          <form onSubmit={handleAddMealPlan} className="space-y-4">
            <div>
              <label className="label-text">Day *</label>
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a day</option>
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MEAL_TYPES.map(type => (
                <div key={type}>
                  <label className="label-text capitalize">{type}</label>
                  <select
                    value={formData[type]}
                    onChange={(e) => setFormData({ ...formData, [type]: e.target.value })}
                    className="input-field"
                  >
                    <option value="">None</option>
                    {recipes.map(r => (
                      <option key={r._id} value={r._id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary px-6">
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shopping List */}
      {showShoppingList && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>Shopping List</span>
            </h3>
            <button
              onClick={() => setShowShoppingList(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {shoppingList.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No items in shopping list. Add some meal plans!</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shoppingList.map((item, index) => (
                <li key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500 text-sm">— {item.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Meal plans grid */}
      {mealPlans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="text-6xl mb-4">📅</p>
          <h3 className="text-2xl font-semibold text-gray-600">No meal plans yet</h3>
          <p className="text-gray-400 mt-2">Plan your meals for the week!</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary inline-block mt-4">
            Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-primary">{plan.day}</h3>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {MEAL_TYPES.map(type => {
                  const meal = getDayMeal(plan, type);
                  return (
                    <div key={type} className="flex items-center space-x-2 text-sm">
                      <span className="capitalize font-medium text-gray-500 w-20">{type}:</span>
                      {meal ? (
                        <a href={`/recipe/${meal._id}`} className="text-gray-700 hover:text-primary transition-colors truncate">
                          {meal.title}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MealPlanner;
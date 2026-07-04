import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';

export const createMealPlan = async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body;
    const userId = req.user.id;

    // Check if meal plan already exists for this user and day
    const existing = await MealPlan.findOne({ user: userId, day });
    if (existing) {
      return res.status(400).json({ 
        message: 'Meal plan already exists for this day. Please update the existing plan.' 
      });
    }

    // Validate that recipes exist
    const recipeIds = [breakfast, lunch, dinner].filter(id => id);
    if (recipeIds.length > 0) {
      const recipes = await Recipe.find({ _id: { $in: recipeIds } });
      if (recipes.length !== recipeIds.length) {
        return res.status(400).json({ message: 'One or more recipes not found' });
      }
    }

    const mealPlan = await MealPlan.create({
      user: userId,
      day,
      breakfast: breakfast || null,
      lunch: lunch || null,
      dinner: dinner || null
    });

    // Populate recipe details
    await mealPlan.populate(['breakfast', 'lunch', 'dinner']);

    res.status(201).json({
      message: 'Meal plan created successfully',
      mealPlan
    });
  } catch (error) {
    console.error('Create meal plan error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Meal plan already exists for this day' });
    }
    res.status(500).json({ message: 'Server error while creating meal plan' });
  }
};

export const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user.id })
      .populate('breakfast', 'title image averageRating prepTime')
      .populate('lunch', 'title image averageRating prepTime')
      .populate('dinner', 'title image averageRating prepTime')
      .sort({ createdAt: -1 });

    res.json(mealPlans);
  } catch (error) {
    console.error('Get meal plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Check if user owns this meal plan
    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this meal plan' });
    }

    await mealPlan.deleteOne();

    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getShoppingList = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user.id })
      .populate('breakfast')
      .populate('lunch')
      .populate('dinner');

    // Collect all ingredients from all meals
    const ingredientMap = new Map();

    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    mealPlans.forEach(plan => {
      mealTypes.forEach(type => {
        const recipe = plan[type];
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase().trim();
            if (ingredientMap.has(key)) {
              // Combine amounts (simple concatenation for now)
              const existing = ingredientMap.get(key);
              ingredientMap.set(key, {
                name: ing.name,
                amount: `${existing.amount}, ${ing.amount}`
              });
            } else {
              ingredientMap.set(key, {
                name: ing.name,
                amount: ing.amount
              });
            }
          });
        }
      });
    });

    const shoppingList = Array.from(ingredientMap.values());

    res.json({
      mealPlans,
      shoppingList,
      totalItems: shoppingList.length
    });
  } catch (error) {
    console.error('Get shopping list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
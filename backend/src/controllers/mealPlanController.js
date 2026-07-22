import mongoose from "mongoose";
import MealPlan from "../models/MealPlan.js";
import Recipe from "../models/Recipe.js";

/* ==========================================
   Create Meal Plan
========================================== */
export const createMealPlan = async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body;
    const userId = req.user.id;

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "Day is required."
      });
    }

    // Prevent duplicate meal plans for same day
    const existingPlan = await MealPlan.findOne({
      user: userId,
      day
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Meal plan already exists for this day."
      });
    }

    const recipeIds = [breakfast, lunch, dinner].filter(Boolean);

    // Validate ObjectIds
    for (const id of recipeIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid recipe ID: ${id}`
        });
      }
    }

    // Check recipes exist
    const recipes = await Recipe.find({
      _id: { $in: recipeIds }
    }).select("_id");

    const foundIds = recipes.map(r => r._id.toString());

    const missingIds = recipeIds.filter(
      id => !foundIds.includes(id.toString())
    );

    if (missingIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more recipes not found.",
        missingRecipes: missingIds
      });
    }

    const mealPlan = await MealPlan.create({
      user: userId,
      day,
      breakfast: breakfast || null,
      lunch: lunch || null,
      dinner: dinner || null
    });

    await mealPlan.populate([
      {
        path: "breakfast",
        select: "title image averageRating prepTime"
      },
      {
        path: "lunch",
        select: "title image averageRating prepTime"
      },
      {
        path: "dinner",
        select: "title image averageRating prepTime"
      }
    ]);

    return res.status(201).json({
      success: true,
      message: "Meal plan created successfully.",
      mealPlan
    });

  } catch (error) {
    console.error("Create Meal Plan Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Meal plan already exists for this day."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating meal plan."
    });
  }
};

/* ==========================================
   Get Meal Plans
========================================== */
export const getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({
      user: req.user.id
    })
      .populate("breakfast", "title image averageRating prepTime")
      .populate("lunch", "title image averageRating prepTime")
      .populate("dinner", "title image averageRating prepTime")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      mealPlans
    });

  } catch (error) {
    console.error("Get Meal Plans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};

/* ==========================================
   Delete Meal Plan
========================================== */
export const deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found."
      });
    }

    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    await mealPlan.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Meal plan deleted successfully."
    });

  } catch (error) {
    console.error("Delete Meal Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};

/* ==========================================
   Shopping List
========================================== */
export const getShoppingList = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({
      user: req.user.id
    })
      .populate("breakfast")
      .populate("lunch")
      .populate("dinner");

    const ingredientMap = new Map();

    ["breakfast", "lunch", "dinner"].forEach(meal => {
      mealPlans.forEach(plan => {
        const recipe = plan[meal];

        if (!recipe || !recipe.ingredients) return;

        recipe.ingredients.forEach(item => {
          const key = item.name.trim().toLowerCase();

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key);

            ingredientMap.set(key, {
              name: item.name,
              amount: `${existing.amount}, ${item.amount}`
            });
          } else {
            ingredientMap.set(key, {
              name: item.name,
              amount: item.amount
            });
          }
        });
      });
    });

    return res.status(200).json({
      success: true,
      mealPlans,
      shoppingList: Array.from(ingredientMap.values()),
      totalItems: ingredientMap.size
    });

  } catch (error) {
    console.error("Shopping List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
};
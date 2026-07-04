import Recipe from '../models/Recipe.js';
import User from '../models/User.js';

// ---------- Helper to parse dietary preference ----------
const parseDietaryPreference = (value) => {
  if (!value) return ['None'];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      return [value];
    }
  }
  return ['None'];
};

// ---------- Create Recipe ----------
export const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      cuisine,
      mealType,
      dietaryPreference,
      ingredients,
      steps,
      prepTime,
      cookTime,
      servings
    } = req.body;

    // Parse ingredients and steps if they are strings
    let parsedIngredients = ingredients;
    let parsedSteps = steps;
    if (typeof ingredients === 'string') {
      parsedIngredients = JSON.parse(ingredients);
    }
    if (typeof steps === 'string') {
      parsedSteps = JSON.parse(steps);
    }

    // Parse dietaryPreference using the helper
    const parsedDietary = parseDietaryPreference(dietaryPreference);

    // Handle uploaded files
    const image = req.files?.image ? `/uploads/images/${req.files.image[0].filename}` : '';
    const video = req.files?.video ? `/uploads/videos/${req.files.video[0].filename}` : '';

    const recipe = await Recipe.create({
      title,
      description,
      cuisine,
      mealType,
      dietaryPreference: parsedDietary,
      ingredients: parsedIngredients || [],
      steps: Array.isArray(parsedSteps)
        ? parsedSteps.map((step, index) => ({
            ...step,
            order: index + 1
          }))
        : [],
      prepTime: parseInt(prepTime),
      cookTime: parseInt(cookTime),
      servings: parseInt(servings),
      image,
      video,
      author: req.user.id
    });

    // Populate author info
    await recipe.populate('author', 'name profileImage');

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ message: 'Server error while creating recipe' });
  }
};

// ---------- Get All Recipes (with filters & pagination) ----------
export const getRecipes = async (req, res) => {
  try {
    const { search, cuisine, mealType, dietary, sort, page = 1, limit = 10 } = req.query;
    const query = {};

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by cuisine
    if (cuisine && cuisine !== 'All') {
      query.cuisine = cuisine;
    }

    // Filter by meal type
    if (mealType && mealType !== 'All') {
      query.mealType = mealType;
    }

    // Filter by dietary preference
    if (dietary && dietary !== 'All') {
      query.dietaryPreference = dietary;
    }

    // Build sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { likes: -1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .populate('author', 'name profileImage')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Recipe.countDocuments(query)
    ]);

    // Add like status for each recipe
    const recipesWithLikeStatus = recipes.map(recipe => ({
      ...recipe,
      isLiked: req.user ? recipe.likes?.some(id => id.toString() === req.user.id) : false
    }));

    res.json({
      recipes: recipesWithLikeStatus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Get Single Recipe by ID ----------
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .populate('ratings.user', 'name');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if current user liked this recipe
    const isLiked = req.user ? recipe.likes.some(id => id.toString() === req.user.id) : false;

    // Get user's rating
    let userRating = null;
    if (req.user) {
      const rating = recipe.ratings.find(r => r.user.toString() === req.user.id);
      if (rating) userRating = rating.value;
    }

    res.json({
      ...recipe.toObject(),
      isLiked,
      userRating
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Update Recipe ----------
export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to edit this recipe' });
    }

    const {
      title,
      description,
      cuisine,
      mealType,
      dietaryPreference,
      ingredients,
      steps,
      prepTime,
      cookTime,
      servings
    } = req.body;

    // Parse ingredients and steps
    let parsedIngredients = ingredients;
    let parsedSteps = steps;
    if (typeof ingredients === 'string') {
      parsedIngredients = JSON.parse(ingredients);
    }
    if (typeof steps === 'string') {
      parsedSteps = JSON.parse(steps);
    }

    // Parse dietaryPreference using the helper
    const parsedDietary = parseDietaryPreference(dietaryPreference);

    // Handle file uploads
    if (req.files?.image) {
      recipe.image = `/uploads/images/${req.files.image[0].filename}`;
    }
    if (req.files?.video) {
      recipe.video = `/uploads/videos/${req.files.video[0].filename}`;
    }

    // Update fields
    recipe.title = title || recipe.title;
    recipe.description = description || recipe.description;
    recipe.cuisine = cuisine || recipe.cuisine;
    recipe.mealType = mealType || recipe.mealType;
    recipe.dietaryPreference = parsedDietary;
    recipe.ingredients = parsedIngredients || recipe.ingredients;
    recipe.steps = Array.isArray(parsedSteps)
      ? parsedSteps.map((step, index) => ({
          ...step,
          order: index + 1
        }))
      : recipe.steps;
    recipe.prepTime = prepTime ? parseInt(prepTime) : recipe.prepTime;
    recipe.cookTime = cookTime ? parseInt(cookTime) : recipe.cookTime;
    recipe.servings = servings ? parseInt(servings) : recipe.servings;

    await recipe.save();
    await recipe.populate('author', 'name profileImage');

    res.json({
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ message: 'Server error while updating recipe' });
  }
};

// ---------- Delete Recipe ----------
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if user is the author
    if (recipe.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this recipe' });
    }

    await recipe.deleteOne();

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Toggle Like ----------
export const toggleLike = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const userId = req.user.id;
    const likeIndex = recipe.likes.indexOf(userId);

    if (likeIndex === -1) {
      recipe.likes.push(userId);
    } else {
      recipe.likes.splice(likeIndex, 1);
    }

    await recipe.save();

    res.json({
      message: likeIndex === -1 ? 'Recipe liked' : 'Recipe unliked',
      likes: recipe.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Rate Recipe ----------
export const rateRecipe = async (req, res) => {
  try {
    const { value } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const userId = req.user.id;
    const existingRating = recipe.ratings.find(r => r.user.toString() === userId);

    if (existingRating) {
      existingRating.value = value;
    } else {
      recipe.ratings.push({ user: userId, value });
    }

    await recipe.save();

    res.json({
      message: 'Rating submitted successfully',
      averageRating: recipe.averageRating,
      totalRatings: recipe.ratings.length,
      userRating: value
    });
  } catch (error) {
    console.error('Rate recipe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Add Comment ----------
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const comment = {
      user: req.user.id,
      text
    };

    recipe.comments.push(comment);
    await recipe.save();

    // Populate the new comment
    await recipe.populate('comments.user', 'name profileImage');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: recipe.comments[recipe.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
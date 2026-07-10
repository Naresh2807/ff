export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .populate('ratings.user', 'name');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    const userId = req.user?._id?.toString();

    // Check if user liked this recipe
    const isLiked = userId
      ? (recipe.likes || []).some((id) => id.toString() === userId)
      : false;

    // Get user's rating
    let userRating = null;
    if (userId) {
      const rating = recipe.ratings.find(
        (r) => r.user.toString() === userId
      );
      if (rating) userRating = rating.value;
    }

    const recipeObj = recipe.toObject();

    res.status(200).json({
      success: true,
      ...recipeObj,   // <-- recipe fields are spread here
      isLiked,
      userRating,
    });
  } catch (error) {
    console.error('❌ Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recipe',
    });
  }
};
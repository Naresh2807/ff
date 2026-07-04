import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('favorites', 'title image averageRating cuisine mealType');

    // Get user's recipes
    const userRecipes = await Recipe.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .select('title image averageRating cuisine mealType createdAt');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        favorites: user.favorites,
        createdAt: user.createdAt
      },
      recipes: userRecipes,
      recipeCount: userRecipes.length
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = { name, bio };

    // If profile image was uploaded
    if (req.file) {
      updates.profileImage = `/uploads/images/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        favorites: user.favorites
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
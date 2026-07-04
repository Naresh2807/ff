import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

export const toggleFavorite = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(userId);
    const favoriteIndex = user.favorites.indexOf(recipeId);

    if (favoriteIndex === -1) {
      user.favorites.push(recipeId);
      await user.save();
      res.json({ message: 'Recipe added to favorites', isFavorite: true });
    } else {
      user.favorites.splice(favoriteIndex, 1);
      await user.save();
      res.json({ message: 'Recipe removed from favorites', isFavorite: false });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'favorites',
        populate: { path: 'author', select: 'name profileImage' }
      });

    res.json(user.favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isFavorite = user.favorites.includes(recipeId);

    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
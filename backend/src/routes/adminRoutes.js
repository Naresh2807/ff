import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllRecipes,
  deleteRecipe,
  getAllComments,
  deleteComment,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication + admin role
router.use(protect, admin);

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/recipes', getAllRecipes);
router.delete('/recipes/:id', deleteRecipe);

router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteComment);

export default router;
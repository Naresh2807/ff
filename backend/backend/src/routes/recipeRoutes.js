import express from "express";
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleLike,
  rateRecipe,
  addComment
} from "../controllers/recipeController.js";

import { protect } from "../middleware/auth.js";
import { uploadRecipeMedia } from "../middleware/upload.js";

const router = express.Router();

/* ---------- PUBLIC ROUTES ---------- */

router.get("/", getRecipes);

router.get("/:id", getRecipeById);

/* ---------- PROTECTED ROUTES ---------- */

router.post(
  "/",
  protect,
  uploadRecipeMedia,
  createRecipe
);

router.put(
  "/:id",
  protect,
  uploadRecipeMedia,
  updateRecipe
);

router.delete(
  "/:id",
  protect,
  deleteRecipe
);

router.post(
  "/:id/like",
  protect,
  toggleLike
);

router.post(
  "/:id/rate",
  protect,
  rateRecipe
);

router.post(
  "/:id/comment",
  protect,
  addComment
);

export default router;
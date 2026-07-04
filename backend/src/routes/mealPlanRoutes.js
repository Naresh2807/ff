import express from "express";

import {
  createMealPlan,
  getMealPlans,
  deleteMealPlan,
  getShoppingList
} from "../controllers/mealPlanController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createMealPlan);

router.get("/", getMealPlans);

router.get("/shopping-list", getShoppingList);

router.delete("/:id", deleteMealPlan);

export default router;
import express from "express";
import {
  toggleFavorite,
  getFavorites,
  checkFavorite
} from "../controllers/favoriteController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getFavorites);

router.post("/:id", toggleFavorite);

router.get("/check/:id", checkFavorite);

export default router;
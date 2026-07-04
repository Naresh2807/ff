import express from "express";

import {
  register,
  login,
  getMe
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working"
  });
});

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

export default router;
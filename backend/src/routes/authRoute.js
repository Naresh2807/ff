import express from "express";

import {
  register,
  login,
  getMe
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

console.log("✅ authRoutes Loaded");

router.get("/test", (req, res) => {
  console.log("✅ GET /api/auth/test");
  res.json({
    success: true,
    message: "Auth route working"
  });
});

router.post("/register", (req, res, next) => {
  console.log("✅ POST /api/auth/register");
  next();
}, register);

router.post("/login", (req, res, next) => {
  console.log("✅ POST /api/auth/login");
  next();
}, login);

router.get("/me", protect, (req, res, next) => {
  console.log("✅ GET /api/auth/me");
  next();
}, getMe);

export default router;
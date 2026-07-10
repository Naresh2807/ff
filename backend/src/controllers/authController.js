import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ==========================================
   Generate JWT Token
========================================== */

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/* ==========================================
   Register User
========================================== */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        favorites: user.favorites,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================
   Login User
========================================== */

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        favorites: user.favorites,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {

    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================
   Get Logged-in User
========================================== */

export const getMe = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .populate(
        "favorites",
        "title image averageRating cuisine mealType"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    console.error("GetMe Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
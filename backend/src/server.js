import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";


import authRoutes from "./routes/ar.js";
import profileRoutes from "./routes/profileRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==========================================
   CORS Configuration
========================================== */

const allowedOrigins = [
  "https://flavorfusionff123.netlify.app",
  "http://localhost:5173",
  "https://6a53a7ced32eef675d9d37ee--deluxe-sorbet-b1f760.netlify.app",
  "https://deluxe-sorbet-b1f760.netlify.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, curl, mobile apps
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);

    return callback(new Error("Origin not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Requested-With",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ==========================================
   Middleware
========================================== */

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==========================================
   Static Files
========================================== */

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* ==========================================
   Root Route
========================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 FlavorFusion Backend Running",
    version: "1.0.0",
  });
});

/* ==========================================
   API Health
========================================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/* ==========================================
   API Test
========================================== */

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "All API routes are reachable.",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    server: "Running",
    time: new Date(),
  });
});

/* ==========================================
   API Index
========================================== */

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FlavorFusion REST API",
    routes: {
      root: "/",
      health: "GET /api/health",
      test: "GET /api/test",

      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        currentUser: "GET /api/auth/me",
      },

      profile: {
        getProfile: "GET /api/profile",
        updateProfile: "PUT /api/profile",
      },

      recipes: {
        getAll: "GET /api/recipes",
        getById: "GET /api/recipes/:id",
        create: "POST /api/recipes",
        update: "PUT /api/recipes/:id",
        delete: "DELETE /api/recipes/:id",
        like: "PATCH /api/recipes/:id/like",
        rate: "POST /api/recipes/:id/rate",
        comment: "POST /api/recipes/:id/comment",
      },

      mealPlans: {
        getAll: "GET /api/mealplans",
        create: "POST /api/mealplans",
        update: "PUT /api/mealplans/:id",
        delete: "DELETE /api/mealplans/:id",
      },

      favorites: {
        getAll: "GET /api/favorites",
        toggle: "POST /api/favorites/:recipeId",
      },
    },
  });
});

/* ==========================================
   API Routes
========================================== */

app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/favorites", favoriteRoutes);

/* ==========================================
   Route Checker
========================================== */

app.get("/api/check", (req, res) => {
  res.status(200).json({
    success: true,
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",

    routes: [
      {
        route: "/api/auth",
        status: "Available",
      },
      {
        route: "/api/profile",
        status: "Available",
      },
      {
        route: "/api/recipes",
        status: "Available",
      },
      {
        route: "/api/mealplans",
        status: "Available",
      },
      {
        route: "/api/favorites",
        status: "Available",
      },
    ],
  });
});

/* ==========================================
   404 Handler
========================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ==========================================
   Global Error Handler
========================================== */

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ==========================================
   MongoDB Connection
========================================== */

async function startServer() {
  try {
    console.log("🔄 Connecting to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📌 API Index   : http://localhost:${PORT}/api`);
      console.log(`📌 Health      : http://localhost:${PORT}/api/health`);
      console.log(`📌 API Test    : http://localhost:${PORT}/api/test`);
      console.log(`📌 Route Check : http://localhost:${PORT}/api/check`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

startServer();
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================
   CORS Configuration
============================ */

const allowedOrigins = [
  "https://flavorfusionff123.netlify.app",
  "https://splendid-macaron-f2c829.netlify.app",
  "https://delightful-entremet-93c1e7.netlify.app",
    "http://localhost:5173", // for Vite dev server
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ============================
   Middleware
============================ */

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/* ============================
   🔍 Debug: Log all incoming requests
============================ */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

/* ============================
   Static Files (make sure path exists)
============================ */
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));
console.log(`📁 Serving static files from: ${uploadsPath}`);

/* ============================
   Routes
============================ */

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "FlavorFusion Backend Running 🚀" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Mount all route modules
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/favorites", favoriteRoutes);

/* ============================
   🧪 Debug: List all registered routes
============================ */
const listRoutes = (router, basePath = "") => {
  router.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
      console.log(`✅ ${methods} ${basePath}${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle.stack) {
      // Nested routers (if any)
      const newBase = basePath + (layer.regexp.source.replace(/\\/g, "").replace(/\^/g, "").replace(/\?/g, "").replace(/\([^)]*\)/g, ""));
      listRoutes(layer.handle, newBase);
    }
  });
};

console.log("\n📋 Registered routes:");
listRoutes(authRoutes, "/api/auth");
listRoutes(profileRoutes, "/api/profile");
listRoutes(recipeRoutes, "/api/recipes");
listRoutes(mealPlanRoutes, "/api/mealplans");
listRoutes(favoriteRoutes, "/api/favorites");
console.log("");

/* ============================
   404 Handler (must be LAST)
============================ */
app.use((req, res) => {
  console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ============================
   Global Error Handler
============================ */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ============================
   MongoDB Connection & Server Start
============================ */
async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

startServer();
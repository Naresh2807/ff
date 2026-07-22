import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Load environment variables first
dotenv.config();

// ✅ Import routes
import authRoutes from "./routes/ar.js";
import profileRoutes from "./routes/profileRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // ✅ Import admin routes

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
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"],
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
   API Health, Test, etc.
========================================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "All API routes are reachable.",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    server: "Running",
    time: new Date(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FlavorFusion REST API",
    routes: {
      // ... (keep your existing route list)
    },
  });
});

/* ==========================================
   ✅ REGISTER API ROUTES (Order matters)
========================================== */

// 1. Public / unprotected routes
app.use("/api/auth", authRoutes);

// 2. Protected user routes (require auth)
app.use("/api/profile", profileRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/favorites", favoriteRoutes);

// 3. ✅ Admin routes (require auth + admin role) – placed after other routes
app.use("/api/admin", adminRoutes); // This will now work because `app` is defined

/* ==========================================
   Route Checker
========================================== */

app.get("/api/check", (req, res) => {
  // ... (keep as is)
});

/* ==========================================
   404 & Error Handlers
========================================== */

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

/* ==========================================
   MongoDB Connection & Server Start
========================================== */

async function startServer() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📌 Admin routes: /api/admin`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed", error);
    process.exit(1);
  }
}

startServer();
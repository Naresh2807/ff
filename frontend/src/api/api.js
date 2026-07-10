import axios from "axios";

// ==========================================
// Base URL
// ==========================================

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ==========================================
// Axios Instance
// ==========================================

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// Request Interceptor
// ==========================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Response Interceptor
// ==========================================

API.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.data);
    return response.data;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);

    const status = error.response?.status;
    const url = error.config?.url || "";

    if (
      status === 401 &&
      (
        url.includes("/profile") ||
        url.includes("/favorites") ||
        url.includes("/mealplans") ||
        url.includes("/auth/me")
      )
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ==========================================
// AUTH
// ==========================================

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const getCurrentUser = () =>
  API.get("/auth/me");

// ==========================================
// PROFILE
// ==========================================

export const getProfile = () =>
  API.get("/profile");

export const updateProfile = (formData) =>
  API.put("/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ==========================================
// RECIPES
// ==========================================

export const getRecipes = (params = {}) =>
  API.get("/recipes", { params });

export const getRecipe = (id) =>
  API.get(`/recipes/${id}`);

export const createRecipe = (formData) =>
  API.post("/recipes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateRecipe = (id, formData) =>
  API.put(`/recipes/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteRecipe = (id) =>
  API.delete(`/recipes/${id}`);

export const toggleLike = (id) =>
  API.post(`/recipes/${id}/like`);

export const rateRecipe = (id, value) =>
  API.post(`/recipes/${id}/rate`, { value });

export const addComment = (id, text) =>
  API.post(`/recipes/${id}/comment`, { text });

// ==========================================
// FAVORITES
// ==========================================

export const getFavorites = () =>
  API.get("/favorites");

export const toggleFavorite = (id) =>
  API.post(`/favorites/${id}`);

export const checkFavorite = (id) =>
  API.get(`/favorites/check/${id}`);

// ==========================================
// MEAL PLANS
// ==========================================

export const getMealPlans = () =>
  API.get("/mealplans");

export const createMealPlan = (data) =>
  API.post("/mealplans", data);

export const deleteMealPlan = (id) =>
  API.delete(`/mealplans/${id}`);

export const getShoppingList = () =>
  API.get("/mealplans/shopping-list");

export default API;
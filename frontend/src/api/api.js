import axios from "axios";

// ==========================================
// Axios Instance
// ==========================================

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://flavorfusion-1-wxvp.onrender.com/api",
  withCredentials: false,
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
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Response Interceptor
// ==========================================

API.interceptors.response.use(
  (response) => response.data,    // 👈  EXTRACT DATA HERE
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Only logout when protected endpoints fail
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

export const updateProfile = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return API.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ==========================================
// RECIPES
// ==========================================

export const getRecipes = (params = {}) =>
  API.get("/recipes", { params });

export const getRecipe = (id) =>
  API.get(`/recipes/${id}`);

export const createRecipe = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      if (
        key === "ingredients" ||
        key === "steps" ||
        key === "dietaryPreference"
      ) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return API.post("/recipes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateRecipe = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      if (
        key === "ingredients" ||
        key === "steps" ||
        key === "dietaryPreference"
      ) {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return API.put(`/recipes/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

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
// MEAL PLANNER
// ==========================================

export const getMealPlans = () =>
  API.get("/mealplans");

export const createMealPlan = (data) =>
  API.post("/mealplans", data);

export const deleteMealPlan = (id) =>
  API.delete(`/mealplans/${id}`);

export const getShoppingList = () =>
  API.get("/mealplans/shopping-list");

// ==========================================
// Export Axios Instance
// ==========================================

export default API;
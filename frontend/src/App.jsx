import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipe from "./pages/Recipe";
import AddRecipe from "./pages/AddRecipe";
import EditRecipe from "./pages/EditRecipe";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import MealPlanner from "./pages/MealPlanner";

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);

        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Authentication initialization error:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuth();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-500 border-t-transparent mx-auto"></div>

          <p className="mt-4 text-gray-600 font-medium">
            Loading FlavorFusion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={logout}
        />

        <main className="flex-1">
          <Routes>

            {/* Public Routes */}

            <Route
              path="/"
              element={
                <Home
                  isAuthenticated={isAuthenticated}
                />
              }
            />

            <Route
              path="/recipe/:id"
              element={
                <Recipe
                  isAuthenticated={isAuthenticated}
                />
              }
            />

            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate
                    to="/"
                    replace
                  />
                ) : (
                  <Login
                    onLogin={login}
                  />
                )
              }
            />

            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate
                    to="/"
                    replace
                  />
                ) : (
                  <Register
                    onLogin={login}
                  />
                )
              }
            />

            {/* Protected Routes */}

            <Route
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                />
              }
            >
              <Route
                path="/add-recipe"
                element={<AddRecipe />}
              />

              <Route
                path="/edit-recipe/:id"
                element={<EditRecipe />}
              />

              <Route
                path="/profile"
                element={
                  <Profile
                    user={user}
                    setUser={setUser}
                  />
                }
              />

              <Route
                path="/favorites"
                element={<Favorites />}
              />

              <Route
                path="/meal-planner"
                element={<MealPlanner />}
              />
            </Route>

            {/* 404 */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
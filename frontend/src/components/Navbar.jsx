import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  UserIcon, 
  HeartIcon, 
  CalendarIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  ChefHatIcon
} from 'lucide-react';

function Navbar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: HomeIcon },
    ...(isAuthenticated ? [
      { to: '/add-recipe', label: 'Add Recipe', icon: PlusCircleIcon },
      { to: '/favorites', label: 'Favorites', icon: HeartIcon },
      { to: '/meal-planner', label: 'Meal Planner', icon: CalendarIcon },
      { to: '/profile', label: 'Profile', icon: UserIcon },
    ] : [])
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ChefHatIcon className="w-8 h-8 text-primary" />
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              Flavor<span className="text-gray-800">Fusion</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-orange-50 transition-all duration-200 font-medium"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium ml-2"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg text-primary border border-primary hover:bg-primary hover:text-white transition-all duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-orange-600 transition-all duration-200 font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-6 h-6 text-gray-600" />
            ) : (
              <MenuIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <link.icon className="w-5 h-5 text-primary" />
                <span className="font-medium text-gray-700">{link.label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
              >
                <LogOutIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-center rounded-lg bg-primary text-white hover:bg-orange-600 transition-colors font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
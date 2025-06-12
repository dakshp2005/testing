import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, Brain } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationPanel } from '../notifications/NotificationPanel';

function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="bg-white/60 dark:bg-black/10 backdrop-blur-xl shadow-2xl border border-white/30 dark:border-white/10 rounded-full px-6 py-1">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105 hover:rounded-full"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white dark:text-[#5164E1]" />
            </div>
            <span className="text-xl font-bold text-[#5164E1] dark:text-[#A7D1F1]">
              ColrnX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              to="/features" 
              className="px-4 py-2 rounded-xl text-[#5164E1] dark:text-[#A7D1F1] hover:bg-[#A7D1F1]/20 dark:hover:bg-[#5164E1]/20 hover:text-[#5164E1] dark:hover:text-[#A7D1F1] transition-all duration-300 transform hover:scale-105 font-medium hover:rounded-full"
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="px-4 py-2 rounded-xl text-[#5164E1] dark:text-[#A7D1F1] hover:bg-[#A7D1F1]/20 dark:hover:bg-[#5164E1]/20 hover:text-[#5164E1] dark:hover:text-[#A7D1F1] transition-all duration-300 transform hover:scale-105 font-medium hover:rounded-full"
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="px-4 py-2 rounded-xl text-[#5164E1] dark:text-[#A7D1F1] hover:bg-[#A7D1F1]/20 dark:hover:bg-[#5164E1]/20 hover:text-[#5164E1] dark:hover:text-[#A7D1F1] transition-all duration-300 transform hover:scale-105 font-medium hover:rounded-full"
            >
              About
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl border border-white/30 dark:border-gray-700/30"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-[#5164E1]" />
              ) : (
                <Sun className="w-5 h-5 text-[#A7D1F1]" />
              )}
            </button>

            {isAuthenticated && <NotificationPanel />}

            {isAuthenticated ? (
              <Link 
                to="/portfolio" // <-- Change from "/learn" to "/portfolio"
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] flex items-center justify-center shadow-lg hover:from-[#5164E1] hover:to-[#A7D1F1] transition-all duration-300 transform hover:scale-110 hover:shadow-xl border-2 border-white/70 dark:border-[#5164E1]/40"
              >
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.name || "Profile"}
                    className="w-10 h-10 rounded-lg object-cover border-none"
                  />
                ) : (
                  <span className="text-lg font-bold text-white drop-shadow-[0_1px_4px_rgba(81,100,225,0.5)]">
                    {user?.user_metadata?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/signin" 
                  className="px-6 py-2.5 rounded-xl text-[#5164E1] dark:text-[#A7D1F1] bg-white/50 dark:bg-gray-800/50 hover:bg-[#A7D1F1]/30 dark:hover:bg-[#5164E1]/30 transition-all duration-300 transform hover:scale-105 font-medium shadow-md hover:shadow-lg border border-white/30 dark:border-gray-700/30"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5164E1] to-[#A7D1F1] text-white hover:from-[#5164E1] hover:to-[#A7D1F1] transition-all duration-300 transform hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-110 shadow-md border border-white/30 dark:border-gray-700/30"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-[#5164E1]" />
              ) : (
                <Sun className="w-5 h-5 text-[#A7D1F1]" />
              )}
            </button>
            {isAuthenticated && (
              <Link 
                to="/portfolio" // <-- Change from "/learn" to "/portfolio" for mobile as well
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] text-white flex items-center justify-center font-bold text-sm hover:from-[#5164E1] hover:to-[#A7D1F1] transition-all duration-300 transform hover:scale-110 shadow-lg"
              >
                <span className="text-white drop-shadow-[0_1px_4px_rgba(81,100,225,0.5)]">
                  {user?.user_metadata?.name?.charAt(0).toUpperCase()}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
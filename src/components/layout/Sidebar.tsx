import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, Code, Layout, BookOpenCheck, Brain, 
  Settings, LogOut, GraduationCap, Trophy, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';

interface SidebarProps {
  onToggle: (collapsed: boolean) => void;
}

function Sidebar({ onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isAdmin } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };
  
  const navItems = [
    {
      name: 'Dashboard',
      path: '/learn',
      icon: Layout
    },
    {
      name: 'AI Assistant',
      path: '/learn/ai',
      icon: Brain,
      isAI: true
    },
    {
      name: 'Explore Resources',
      path: '/learn/explore',
      icon: BookOpenCheck
    },
    {
      name: 'Community',
      path: '/community',
      icon: Users
    },
    {
      name: 'Projects',
      path: '/projects',
      icon: Code
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: BookOpen
    }
  ];

  return (
    <>
      {/* CSS for AI Assistant animations - Fixed to prevent size changes */}
      <style>{`
        @keyframes aiPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(139, 92, 246, 0);
          }
        }

        @keyframes aiGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
        }

        @keyframes brainSpin {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes gradientShift {
          0%, 100% { 
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%);
          }
          33% { 
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%);
          }
          66% { 
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%);
          }
        }

        .ai-assistant-btn {
          position: relative;
          overflow: hidden;
          animation: aiPulse 3s ease-in-out infinite;
          /* Prevent scaling from affecting layout */
          transform-origin: center;
          will-change: box-shadow;
        }

        .ai-assistant-btn:hover {
          animation: aiGlow 2s ease-in-out infinite;
        }

        .ai-assistant-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.8s;
          pointer-events: none;
        }

        .ai-assistant-btn:hover::before {
          left: 100%;
        }

        .ai-assistant-btn.active {
          animation: gradientShift 4s ease-in-out infinite;
          border: 2px solid rgba(139, 92, 246, 0.3);
        }

        .ai-brain-icon {
          animation: brainSpin 4s ease-in-out infinite;
          /* Prevent rotation from affecting parent size */
          display: inline-block;
          transform-origin: center;
          will-change: transform;
        }

        .ai-assistant-btn:hover .ai-brain-icon {
          animation: brainSpin 1s ease-in-out infinite;
        }

        .ai-text-gradient {
          background: linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease-in-out infinite;
        }

        /* Dark mode adjustments */
        .dark .ai-assistant-btn {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        }

        .dark .ai-assistant-btn:hover {
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
        }

        .dark .ai-assistant-btn.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%);
        }

        /* Additional fixes to prevent layout shifts */
        .sidebar-container {
          contain: layout style;
        }

        .nav-item {
          min-height: 44px; /* Consistent height for all nav items */
          display: flex;
          align-items: center;
        }
      `}</style>

      <aside
        className={`sidebar-container hidden lg:flex flex-col fixed left-4
          bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl 
          shadow-2xl border border-white/20 dark:border-dark-border 
          rounded-xl
          transition-all duration-300 z-20 hover:w-64 ${
            isCollapsed ? 'w-16 px-1.5' : 'w-64 px-4'
          }`}
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          height: 'auto',
          maxHeight: 'calc(100vh - 6rem)',
          bottom: 'initial'
        }}
        onMouseEnter={() => {
          setIsCollapsed(false);
          onToggle(false);
        }}
        onMouseLeave={() => {
          setIsCollapsed(true);
          onToggle(true);
        }}
      >
        <nav className="flex-1 flex flex-col justify-center space-y-4 py-6 overflow-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isAI = item.isAI;

            if (isAI) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ai-assistant-btn flex items-center px-4 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                    active
                      ? 'active text-violet-700 dark:text-white font-bold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-purple-500/10'
                  }`}
                >
                  <Icon className={`ai-brain-icon w-5 h-5 flex-shrink-0 ${active ? 'text-violet-700 dark:text-white' : ''}`} />
                  <span className={`ml-3 truncate transition-opacity duration-300 ${
                    isCollapsed ? 'opacity-0' : 'opacity-100'
                    } ${active ? 'text-violet-700 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-200'}`}>
                    {item.name}
                  </span>
                  {!isCollapsed && (
                    <div className="ml-auto flex-shrink-0">
                      <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 truncate transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors ${
                isActive('/admin')
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border'
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 truncate transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                Admin Panel
              </span>
            </Link>
          )}
          {/* Achievements Link */}
          <Link
            to="/achievements"
            className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors ${
              isActive('/achievements')
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border'
            }`}
          >
            <Trophy className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 truncate transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              Achievements
            </span>
          </Link>

          {/* Settings Link */}
          <Link
            to="/profile"
            className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors ${
              isActive('/profile')
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-border'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 truncate transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              Settings
            </span>
          </Link>

          <div className="mt-6 pt-1.5 border-t border-gray-200 dark:border-dark-border"></div>
          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="nav-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 truncate transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              Sign Out
            </span>
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
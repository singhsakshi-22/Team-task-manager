import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Sparkles, UserCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Map path to section title
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/': return 'Global Command Dashboard';
      case '/projects': return 'Project Hub';
      case '/kanban': return 'Collaborative Kanban';
      case '/team': return 'Team Stream';
      case '/profile': return 'Aether Identity Profile';
      default: return 'Aether Hub';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md">
      {/* Page Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg lg:text-xl font-bold tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent font-sans flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            {getPageTitle(location.pathname)}
          </h2>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Futuristic Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-900/60 dark:bg-slate-950/40 border border-slate-850 hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-glow-teal transition-all duration-300 text-slate-400"
          title={theme === 'dark' ? 'Activate Light Space' : 'Activate Deep Space'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 animate-pulse-slow" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* User Identity Avatar & Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${user.avatarColor || 'from-cyan-500 to-blue-500'} flex items-center justify-center font-bold text-slate-950 shadow-glow-teal transition-transform duration-300 hover:scale-105`}
            >
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </button>

            {dropdownOpen && (
              <>
                {/* Click backcatcher */}
                <div 
                  onClick={() => setDropdownOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent"
                />
                
                {/* Floating identity card */}
                <div className="absolute right-0 mt-3.5 w-60 z-50 glass-panel rounded-2xl p-4 shadow-2xl animate-fade-in border border-slate-850">
                  <div className="border-b border-slate-850 pb-3 mb-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Logged In As</p>
                    <p className="text-sm font-bold text-slate-200 truncate mt-0.5">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        window.location.hash = '#/profile'; // Or standard routing
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>View Profile Settings</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
                    >
                      <span>Sign Out from Aether</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Trello, 
  Users, 
  UserCircle2, 
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Kanban Board', path: '/kanban', icon: Trello },
    { name: 'Team & Collaboration', path: '/team', icon: Users },
    { name: 'Profile Settings', path: '/profile', icon: UserCircle2 }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-full glass-panel border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Title Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/50">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 shadow-glow-teal">
            <Sparkles className="w-5 h-5 text-slate-950 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent uppercase font-sans">
              Aether
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Productivity</p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-4 my-6 p-4 rounded-xl bg-slate-900/60 dark:bg-slate-950/40 border border-slate-800/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${user.avatarColor || 'from-cyan-500 to-blue-500'} flex items-center justify-center font-bold text-slate-950 shadow-md`}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold truncate text-slate-200 dark:text-slate-200 light:text-slate-800">{user.name}</h4>
              
              <div className="flex items-center gap-1.5 mt-0.5">
                {user.role === 'Admin' ? (
                  <span className="flex items-center text-[10px] text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/50 px-1.5 py-0.5 rounded-md uppercase font-mono tracking-widest shadow-glow-teal">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                  </span>
                ) : (
                  <span className="flex items-center text-[10px] text-violet-400 font-bold bg-violet-950/40 border border-violet-800/50 px-1.5 py-0.5 rounded-md uppercase font-mono tracking-widest">
                    Member
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm border group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-cyan-500/25 text-cyan-400 shadow-glow-teal'
                      : 'border-transparent text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-100 hover:bg-slate-800/40 hover:border-slate-850'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 dark:text-slate-400 light:text-slate-500 group-hover:text-cyan-400'
                    }`} />
                    <span className="tracking-wide">{link.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Control */}
        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl border border-transparent text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 font-medium text-sm transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

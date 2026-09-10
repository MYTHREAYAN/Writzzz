import React from 'react';
import { motion } from 'motion/react';
import { PenTool, Plus, Sparkles, Star, LogOut, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'dashboard' | 'new-assignment' | 'assignment-detail' | 'handwriting-lab';
  onNavigate: (view: 'dashboard' | 'new-assignment' | 'handwriting-lab') => void;
  onOpenFeedback: () => void;
  onOpenHandwritingUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenFeedback,
  onOpenHandwritingUpload,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <PenTool className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xl font-extrabold tracking-wider font-display text-white">
                WRITZZ
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Handwriter
              </span>
            </div>
          </button>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-neutral-800/90 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Assignments</span>
            </button>

            <button
              onClick={onOpenHandwritingUpload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Handwriting Studio</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* New Assignment Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('new-assignment')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Assignment</span>
            <span className="sm:hidden">Create</span>
          </motion.button>

          {/* Feedback Button with Star Bounce */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenFeedback}
            title="Give feedback (1-5 stars)"
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-300 text-xs sm:text-sm font-medium rounded-xl transition-all cursor-pointer group"
          >
            <Star className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">Feedback</span>
          </motion.button>

          {/* User Profile / Logout Dropdown */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-200" title={user?.name || user?.email}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

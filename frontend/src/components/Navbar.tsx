import React from 'react';
import { Sun, Moon, LogIn, LogOut, Search, LayoutGrid, List } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  bookmarkCount: number;
  isBackendOffline: boolean;
  onOpenAuth: () => void;
  onOpenChat?: () => void;
  onOpenCommandPalette?: () => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: (mode: 'grid' | 'list') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  isBackendOffline,
  onOpenAuth,
  onOpenCommandPalette,
  viewMode = 'grid',
  onToggleViewMode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <header className="w-full px-4 sm:px-6 h-14 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-t-[28px] select-none">
      {/* Window Controls & Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 mr-1" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-xs" />
        </div>

        <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
          CV
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
            ClipVault
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            {bookmarkCount}
          </span>
          {isBackendOffline && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Quick Search Pill (Desktop) */}
      {onOpenCommandPalette && (
        <div className="hidden sm:flex flex-1 max-w-sm justify-center px-2">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-1.5 text-xs rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search clips or tags...</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open search"
            className="sm:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {onToggleViewMode && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => onToggleViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('list')}
              title="List view"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Sunny Day' : 'Switch to Midnight'}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-white/10">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {username?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import { Sun, Moon, LogIn, LogOut, Sparkles, WifiOff, Search, LayoutGrid, List } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  bookmarkCount: number;
  isBackendOffline: boolean;
  onOpenAuth: () => void;
  onOpenChat: () => void;
  onOpenCommandPalette?: () => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: (mode: 'grid' | 'list') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  isBackendOffline,
  onOpenAuth,
  onOpenChat,
  onOpenCommandPalette,
  viewMode = 'grid',
  onToggleViewMode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Monogram & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-100 shadow-xs font-mono font-bold text-xs">
            CV
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              ClipVault
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              {bookmarkCount}
            </span>
          </div>

          {/* Backend Offline Indicator */}
          {isBackendOffline && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </span>
          )}
        </div>

        {/* Search Command Palette Trigger (Center) */}
        {onOpenCommandPalette && (
          <div className="hidden md:flex flex-1 max-w-sm justify-center">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
                <span>Search bookmarks or tags...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-300/80 dark:border-zinc-700/80">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Action Controls (Right) */}
        <div className="flex items-center gap-2">
          {/* Mobile search trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Open search"
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* View Mode Switcher (Grid vs List) */}
          {onToggleViewMode && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => onToggleViewMode('grid')}
                title="Grid view"
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('list')}
                title="List view"
                aria-label="List view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Ask AI Pill Button */}
          <button
            type="button"
            onClick={onOpenChat}
            aria-label="Ask AI Assistant"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer border border-zinc-800 dark:border-zinc-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-600" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {username}
              </span>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
                className="p-1 rounded-md text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

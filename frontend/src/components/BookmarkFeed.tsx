import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark as BookmarkIcon, WifiOff } from 'lucide-react';
import { Bookmark } from '../types';
import { BookmarkCard } from './BookmarkCard';

interface BookmarkFeedProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  isBackendOffline: boolean;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
}

export const BookmarkFeed: React.FC<BookmarkFeedProps> = ({
  bookmarks,
  isLoading,
  isBackendOffline,
  onDelete,
  onTagClick,
  onClearFilters,
  hasFilters,
}) => {
  if (isBackendOffline) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/50 dark:border-rose-900/50 flex items-center justify-center text-rose-500">
          <WifiOff className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Backend Disconnected
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Unable to connect to the ClipVault server. Please make sure the backend is running on port 3100.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && bookmarks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-200/60 dark:bg-zinc-800/40 animate-pulse border border-slate-200/50 dark:border-zinc-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center text-indigo-500">
          <BookmarkIcon className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {hasFilters ? 'No bookmarks match your search' : 'No bookmarks saved yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {hasFilters
              ? 'Try searching with different keywords or clearing your active filters.'
              : 'Paste your first link in the box above to let the AI agent organize it!'}
          </p>
        </div>
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {bookmarks.map((bookmark) => (
            <motion.div
              layout
              key={bookmark._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <BookmarkCard
                bookmark={bookmark}
                onDelete={onDelete}
                onTagClick={onTagClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark as BookmarkIcon, WifiOff } from 'lucide-react';
import { Bookmark } from '../types';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkListItem } from './BookmarkListItem';

interface BookmarkFeedProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  isBackendOffline: boolean;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
  viewMode?: 'grid' | 'list';
}

export const BookmarkFeed: React.FC<BookmarkFeedProps> = ({
  bookmarks,
  isLoading,
  isBackendOffline,
  onDelete,
  onTagClick,
  onClearFilters,
  hasFilters,
  viewMode = 'grid',
}) => {
  if (isBackendOffline) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-14 w-14 mx-auto rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <WifiOff className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Backend Disconnected
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Unable to connect to the ClipVault server. Make sure the backend is running on port 3100.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && bookmarks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/40 animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-14 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/40 animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-14 w-14 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
          <BookmarkIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {hasFilters ? 'No bookmarks match your search' : 'No bookmarks saved yet'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {hasFilters
              ? 'Try searching with different keywords or clearing your active filters.'
              : 'Paste your first link in the quick-save bar above to start your collection.'}
          </p>
        </div>
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity cursor-pointer border border-zinc-800 dark:border-zinc-200"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {viewMode === 'grid' ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {bookmarks.map((bookmark) => (
              <motion.div
                layout
                key={bookmark._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
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
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {bookmarks.map((bookmark) => (
              <motion.div
                layout
                key={bookmark._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <BookmarkListItem
                  bookmark={bookmark}
                  onDelete={onDelete}
                  onTagClick={onTagClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark as BookmarkIcon, WifiOff, Plus } from 'lucide-react';
import { Bookmark } from '../types';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkListItem } from './BookmarkListItem';

export interface BookmarkFeedProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  isBackendOffline: boolean;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
  viewMode?: 'grid' | 'list';
  starredIds?: string[];
  onToggleStar?: (id: string) => void;
  onAddClip?: () => void;
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
  starredIds = [],
  onToggleStar,
  onAddClip,
}) => {
  if (isBackendOffline) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <WifiOff className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Backend Disconnected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Make sure the ClipVault backend is running on port 3100.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && bookmarks.length === 0) {
    return (
      <div className="px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 animate-pulse border border-slate-200/60 dark:border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <BookmarkIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {hasFilters ? 'No bookmarks match your filter' : 'No clips in your vault yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {hasFilters
              ? 'Try searching with different keywords or clearing your active filters.'
              : 'Paste a link above or click "Add Clip" to save your first notecard.'}
          </p>
        </div>
        {hasFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pb-20">
      {viewMode === 'grid' ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Dashed Add Clip Card (First item in grid view) */}
          {onAddClip && (
            <motion.button
              type="button"
              onClick={onAddClip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-500/40 bg-white/60 dark:bg-slate-800/30 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 p-6 flex flex-col items-center justify-center text-center min-h-[170px] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Add New Clip
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Click to paste link in quick-save bar
              </p>
            </motion.button>
          )}

          <AnimatePresence>
            {bookmarks.map((bookmark, i) => (
              <motion.div
                layout
                key={bookmark._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <BookmarkCard
                  bookmark={bookmark}
                  index={i}
                  isStarred={starredIds.includes(bookmark._id)}
                  onToggleStar={onToggleStar}
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
                  isStarred={starredIds.includes(bookmark._id)}
                  onToggleStar={onToggleStar}
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

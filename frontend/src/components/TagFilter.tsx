import React from 'react';
import { Search, Tag, X } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 space-y-3">
      {/* Search Input & Active Filter Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            aria-label="Search bookmarks"
            placeholder="Filter title or summary..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selectedTag && (
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="text-xs text-zinc-600 dark:text-zinc-400 font-mono hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 cursor-pointer bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <span>Tag: #{selectedTag}</span>
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Persistent Tag Filter Pills */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center text-[11px] font-mono text-zinc-400 gap-1 pr-1 shrink-0">
            <Tag className="h-3 w-3" />
            <span>Tags:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`text-[11px] font-mono px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer border ${
              selectedTag === null
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            All
          </button>

          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                type="button"
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-medium'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

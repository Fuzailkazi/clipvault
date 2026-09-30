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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mb-5 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            aria-label="Filter title or summary"
            placeholder="Filter title or summary..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {selectedTag && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 text-xs font-medium">
            <span>Tag: {selectedTag}</span>
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="p-0.5 hover:text-sky-950 rounded-full cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center text-[11px] font-medium text-slate-400 gap-1 pr-1 shrink-0">
            <Tag className="h-3 w-3" />
            <span>Pills:</span>
          </div>

          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
              selectedTag === null
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent font-medium shadow-xs'
                : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border-slate-200/80 dark:border-white/10'
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
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-500 text-white border-transparent font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border-slate-200/80 dark:border-white/10'
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

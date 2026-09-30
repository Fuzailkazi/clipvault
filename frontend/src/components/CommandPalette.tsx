import React, { useState, useEffect, useRef } from 'react';
import { Search, ExternalLink, Tag, Globe, CornerDownLeft, X } from 'lucide-react';
import { Bookmark } from '../types';


interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  tags: string[];
  onSelectTag: (tag: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  bookmarks,
  tags,
  onSelectTag,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter bookmarks based on query
  const filtered = query.trim()
    ? bookmarks.filter((b) => {
        const q = query.toLowerCase();
        return (
          b.title?.toLowerCase().includes(q) ||
          b.summary?.toLowerCase().includes(q) ||
          b.url?.toLowerCase().includes(q) ||
          b.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 8)
    : bookmarks.slice(0, 6);

  // Filter tags matching query
  const matchingTags = query.trim()
    ? tags.filter((t) => t.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : tags.slice(0, 5);

  const totalItems = filtered.length;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (totalItems > 0 ? (prev + 1) % totalItems : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (totalItems > 0 ? (prev - 1 + totalItems) % totalItems : 0));
    } else if (e.key === 'Enter') {
      if (filtered[selectedIndex]) {
        window.open(filtered[selectedIndex].url, '_blank', 'noopener,noreferrer');
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/80 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100 flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3 border-b border-slate-200/80 dark:border-white/10">
          <Search className="h-4 w-4 text-sky-500 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search clips..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded ml-2">
            ESC
          </kbd>
        </div>

        {/* Quick Tag Suggestions */}
        {matchingTags.length > 0 && (
          <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="h-3 w-3" />
              Tags:
            </span>
            {matchingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  onSelectTag(tag);
                  onClose();
                }}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching bookmarks found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const domain = (() => {
                try {
                  return new URL(item.url).hostname.replace('www.', '');
                } catch {
                  return item.url;
                }
              })();
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

              return (
                <div
                  key={item._id}
                  onClick={() => {
                    window.open(item.url, '_blank', 'noopener,noreferrer');
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-100/70 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                      : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <img
                      src={faviconUrl}
                      alt=""
                      className="h-4 w-4 rounded shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <Globe className="h-4 w-4 text-slate-400 shrink-0 hidden" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium truncate">{item.title}</span>
                        {item.category && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {domain} • {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-slate-400 text-xs">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                        Open <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 font-mono text-[9px] bg-slate-200/60 dark:bg-slate-800 border border-slate-300/80 dark:border-white/10 rounded">↑</kbd>
              <kbd className="px-1 py-0.5 font-mono text-[9px] bg-slate-200/60 dark:bg-slate-800 border border-slate-300/80 dark:border-white/10 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 font-mono text-[9px] bg-slate-200/60 dark:bg-slate-800 border border-slate-300/80 dark:border-white/10 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>{totalItems} results</span>
        </div>
      </div>
    </div>
  );
};

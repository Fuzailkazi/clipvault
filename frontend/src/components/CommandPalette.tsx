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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 gap-3">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, tag, or search bookmarks..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded">
            ESC
          </kbd>
        </div>

        {/* Quick Tag Suggestions */}
        {matchingTags.length > 0 && (
          <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1 mr-1">
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
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 hover:bg-indigo-600 hover:text-white border border-zinc-700/50 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
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
                    <Globe className="h-4 w-4 text-zinc-500 shrink-0 hidden" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium truncate">{item.title}</span>
                        {item.category && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {domain} • {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-zinc-500 text-xs">
                    {isSelected && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400">
                        Open <CornerDownLeft className="h-3 w-3" />
                      </span>
                    )}
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 font-mono text-[9px] bg-zinc-800 border border-zinc-700/80 rounded">↑</kbd>
              <kbd className="px-1 py-0.5 font-mono text-[9px] bg-zinc-800 border border-zinc-700/80 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 font-mono text-[9px] bg-zinc-800 border border-zinc-700/80 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>{totalItems} results</span>
        </div>
      </div>
    </div>
  );
};

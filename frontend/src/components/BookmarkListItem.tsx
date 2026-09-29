import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Trash2, Globe } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}

export const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  onDelete,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      return bookmark.url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(bookmark.url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = bookmark.url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this bookmark?')) return;
    try {
      setIsDeleting(true);
      await onDelete(bookmark._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = (() => {
    const d = new Date(bookmark.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  })();

  return (
    <div className="group flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-150 gap-4">
      {/* Left: Favicon & Main Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {!faviconError ? (
          <img
            src={faviconUrl}
            alt=""
            className="h-4 w-4 rounded shrink-0 object-contain"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors flex items-center gap-1.5"
            >
              <span>{bookmark.title}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0" />
            </a>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 hidden md:inline truncate">
              {domain}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {bookmark.summary}
          </p>
        </div>
      </div>

      {/* Middle/Right: Category & Tags */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {bookmark.category && (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
            {bookmark.category}
          </span>
        )}

        {bookmark.tags && bookmark.tags.slice(0, 2).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick(tag);
            }}
            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Date & Action Controls */}
      <div className="flex items-center gap-3 shrink-0 text-xs">
        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
          {formattedDate}
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            aria-label="Copy URL"
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete bookmark"
            aria-label="Delete bookmark"
            className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

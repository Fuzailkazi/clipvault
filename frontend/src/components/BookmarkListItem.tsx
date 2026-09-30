import React, { useState } from 'react';
import { Copy, Check, Trash2, Globe, Star } from 'lucide-react';
import { Bookmark } from '../types';

export interface BookmarkListItemProps {
  bookmark: Bookmark;
  isStarred?: boolean;
  onToggleStar?: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}

export const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  isStarred = false,
  onToggleStar,
  onDelete,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, '');
    } catch {
      return bookmark.url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookmark.url);
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

  return (
    <div className="group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500/40 hover:shadow-xs transition-all">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onToggleStar && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(bookmark._id);
            }}
            title={isStarred ? 'Remove from Starred' : 'Add to Starred'}
            aria-label="Star bookmark"
            className="p-1 rounded-full text-slate-400 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
          >
            <Star className={`h-4 w-4 ${isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        )}

        {!faviconError ? (
          <img
            src={faviconUrl}
            alt=""
            className="h-4 w-4 rounded shrink-0 object-contain"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <Globe className="h-4 w-4 shrink-0 text-slate-400" />
        )}

        <div className="min-w-0 flex-1">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:underline truncate block"
          >
            {bookmark.title}
          </a>
          <span className="text-[11px] text-slate-400 font-mono truncate block">{domain}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1">
          {bookmark.tags?.slice(0, 2).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          title="Copy URL"
          aria-label="Copy URL"
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete bookmark"
          aria-label="Delete bookmark"
          className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

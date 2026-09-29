import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Trash2, Calendar, Globe } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onDelete,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

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
      // Ignore copy error
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this bookmark?')) return;
    try {
      setIsDeleting(true);
      await onDelete(bookmark._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      return bookmark.url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

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
    <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Top Banner / Image */}
      {bookmark.ogImage && !hasImgError ? (
        <div className="h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative border-b border-zinc-100 dark:border-zinc-800/60">
          <img
            src={bookmark.ogImage}
            alt={bookmark.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasImgError(true)}
          />
          {bookmark.category && (
            <div className="absolute top-2.5 right-2.5 bg-zinc-950/80 backdrop-blur-md text-zinc-300 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700/60">
              {bookmark.category}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 py-3 bg-zinc-50/50 dark:bg-zinc-950/30 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            {!faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                className="h-4 w-4 rounded shrink-0 object-contain"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            <span className="truncate max-w-[180px] font-mono text-[11px]">{domain}</span>
          </div>
          {bookmark.category && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
              {bookmark.category}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex items-start justify-between gap-2 font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
          >
            <span className="line-clamp-2 leading-snug">{bookmark.title}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity text-zinc-400 mt-1" />
          </a>

          {/* 2-Sentence AI Summary */}
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
            {bookmark.summary}
          </p>

          {/* Optional User Note */}
          {bookmark.userNotes && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/50 border-l-2 border-indigo-500 text-[11px] text-zinc-600 dark:text-zinc-400 italic">
              "{bookmark.userNotes}"
            </div>
          )}
        </div>

        {/* Tags & Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2.5">
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bookmark.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer border border-zinc-200/50 dark:border-zinc-700/40"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                title="Copy URL"
                aria-label="Copy bookmark URL"
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete bookmark"
                aria-label="Delete bookmark"
                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

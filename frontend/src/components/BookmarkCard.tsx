import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Trash2, Calendar, Globe } from 'lucide-react';
import { Bookmark } from '../types';
import { HoverCard } from './ui/card-hover';

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

  const formattedDate = new Date(bookmark.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <HoverCard className="h-full">
      {/* Top Banner / Image */}
      {bookmark.ogImage && !hasImgError ? (
        <div className="h-40 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
          <img
            src={bookmark.ogImage}
            alt={bookmark.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasImgError(true)}
          />
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {bookmark.category || 'link'}
          </div>
        </div>
      ) : (
        <div className="h-16 w-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-transparent p-3 flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
            <Globe className="h-3.5 w-3.5" />
            <span className="truncate max-w-[180px]">{domain}</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            {bookmark.category || 'link'}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex items-start justify-between gap-2 font-semibold text-sm sm:text-base text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span className="line-clamp-2">{bookmark.title}</span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity text-slate-400" />
          </a>

          {/* 2-Sentence AI Summary */}
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
            {bookmark.summary}
          </p>

          {/* Optional User Note */}
          {bookmark.userNotes && (
            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 italic">
              "{bookmark.userNotes}"
            </div>
          )}
        </div>

        {/* Tags & Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 space-y-2">
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bookmark.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick(tag);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 dark:text-zinc-500">
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
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete bookmark"
                aria-label="Delete bookmark"
                className="p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </HoverCard>
  );
};

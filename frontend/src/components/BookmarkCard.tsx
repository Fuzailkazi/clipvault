import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Trash2, Calendar, Globe, Star } from 'lucide-react';
import { Bookmark } from '../types';

export interface BookmarkCardProps {
  bookmark: Bookmark;
  index?: number;
  isStarred?: boolean;
  onToggleStar?: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}

const PASTEL_THEMES = [
  // 0: Peach
  {
    card: 'bg-[#fff8f3] border-[#fed7aa] text-amber-950 dark:bg-orange-950/20 dark:border-orange-500/30 dark:text-orange-100 shadow-orange-500/5',
    badge: 'bg-[#fed7aa] text-[#9a3412] dark:bg-orange-900/60 dark:text-orange-200',
    tag: 'bg-[#ffedd5] text-[#9a3412] hover:bg-[#fed7aa] dark:bg-orange-900/40 dark:text-orange-300',
  },
  // 1: Lilac
  {
    card: 'bg-[#fbf7ff] border-[#e9d5ff] text-purple-950 dark:bg-purple-950/20 dark:border-purple-500/30 dark:text-purple-100 shadow-purple-500/5',
    badge: 'bg-[#e9d5ff] text-[#6b21a8] dark:bg-purple-900/60 dark:text-purple-200',
    tag: 'bg-[#f3e8ff] text-[#6b21a8] hover:bg-[#e9d5ff] dark:bg-purple-900/40 dark:text-purple-300',
  },
  // 2: Sky Cyan
  {
    card: 'bg-[#f0f9ff] border-[#bae6fd] text-sky-950 dark:bg-sky-950/20 dark:border-sky-500/30 dark:text-sky-100 shadow-sky-500/5',
    badge: 'bg-[#bae6fd] text-[#0369a1] dark:bg-sky-900/60 dark:text-sky-200',
    tag: 'bg-[#e0f2fe] text-[#0369a1] hover:bg-[#bae6fd] dark:bg-sky-900/40 dark:text-sky-300',
  },
  // 3: Mint
  {
    card: 'bg-[#f0fdf4] border-[#bbf7d0] text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-100 shadow-emerald-500/5',
    badge: 'bg-[#bbf7d0] text-[#15803d] dark:bg-emerald-900/60 dark:text-emerald-200',
    tag: 'bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] dark:bg-emerald-900/40 dark:text-emerald-300',
  },
];

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  index = 0,
  isStarred = false,
  onToggleStar,
  onDelete,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [imgError, setImgError] = useState(false);

  const theme = PASTEL_THEMES[Math.abs(index) % PASTEL_THEMES.length];

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

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, '');
    } catch {
      return bookmark.url;
    }
  })();

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

  const formattedDate = (() => {
    const d = new Date(bookmark.createdAt);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  })();

  return (
    <div
      className={`group relative rounded-2xl border p-4.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-full ${theme.card}`}
    >
      <div>
        {/* Top Header: Favicon, Domain, Category & Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            {!faviconError ? (
              <img
                src={faviconUrl}
                alt=""
                className="h-4 w-4 rounded shrink-0 object-contain"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" />
            )}
            <span className="text-[11px] font-medium opacity-75 truncate">{domain}</span>
            {bookmark.category && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${theme.badge}`}>
                {bookmark.category}
              </span>
            )}
          </div>

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
              <Star
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  isStarred ? 'fill-amber-400 text-amber-500' : 'hover:fill-amber-400/20'
                }`}
              />
            </button>
          )}
        </div>

        {/* Title & Inset Thumbnail */}
        <div className="flex items-start gap-3">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex-1 font-bold text-sm sm:text-base leading-snug hover:underline line-clamp-2 break-words inline-flex items-baseline gap-1"
          >
            <span>{bookmark.title}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0 translate-y-0.5" />
          </a>

          {bookmark.ogImage && !imgError && (
            <img
              src={bookmark.ogImage}
              alt=""
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-black/5 dark:border-white/10 shadow-xs"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        {/* AI Summary */}
        <p className="mt-2 text-xs leading-relaxed opacity-85 line-clamp-3">
          {bookmark.summary}
        </p>

        {/* Optional User Note */}
        {bookmark.userNotes && (
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 text-[11px] italic">
            "{bookmark.userNotes}"
          </div>
        )}
      </div>

      {/* Footer: Tags, Date, Copy & Delete */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {bookmark.tags?.slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${theme.tag}`}
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-500 dark:text-slate-400">
          {formattedDate && (
            <span className="text-[10px] font-medium mr-1 flex items-center gap-1 opacity-70">
              <Calendar className="h-2.5 w-2.5" />
              {formattedDate}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy URL"
            className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete bookmark"
            className="p-1 rounded-full hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Folder, Star, Tag, Sparkles } from 'lucide-react';

interface SidebarProps {
  totalCount: number;
  starredCount: number;
  activeFilter: 'all' | 'starred';
  onSelectFilter: (filter: 'all' | 'starred') => void;
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onOpenChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  totalCount,
  starredCount,
  activeFilter,
  onSelectFilter,
  tags,
  selectedTag,
  onSelectTag,
  onOpenChat,
}) => {
  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-slate-200/80 dark:border-white/10 p-3.5 space-y-6 bg-slate-50/50 dark:bg-slate-950/20 select-none">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2">
            Library
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectFilter('all');
                onSelectTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeFilter === 'all' && selectedTag === null
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-3.5 w-3.5 text-sky-500" />
                <span>All Clips</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectFilter('starred');
                onSelectTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeFilter === 'starred'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-white/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                <span>Starred</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                {starredCount}
              </span>
            </button>
          </div>
        </div>

        {/* Top Tags Shortcut */}
        {tags.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-2 flex items-center justify-between">
              <span>Tags</span>
              <Tag className="h-3 w-3" />
            </div>
            <div className="space-y-0.5">
              {tags.slice(0, 5).map((t) => {
                const isSelected = selectedTag === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onSelectTag(isSelected ? null : t)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs truncate transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-slate-400 font-mono text-[10px]">#</span>
                    <span className="truncate">{t.replace(/^#/, '')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ask AI Trigger */}
        <div className="pt-2 mt-auto">
          <button
            type="button"
            onClick={onOpenChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </aside>

      {/* Mobile Horizontal Pill Rail */}
      <div className="md:hidden flex items-center gap-1.5 px-4 py-2 border-b border-slate-200/80 dark:border-white/10 overflow-x-auto scrollbar-none bg-slate-50/60 dark:bg-slate-900/40">
        <button
          type="button"
          onClick={() => {
            onSelectFilter('all');
            onSelectTag(null);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeFilter === 'all' && selectedTag === null
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectFilter('starred');
            onSelectTag(null);
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeFilter === 'starred'
              ? 'bg-amber-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'
          }`}
        >
          <Star className="h-3 w-3 fill-current" />
          <span>Starred ({starredCount})</span>
        </button>
      </div>
    </>
  );
};

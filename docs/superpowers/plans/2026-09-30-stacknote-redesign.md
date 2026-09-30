# StackNote Aesthetic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul ClipVault's frontend into the StackNote digital notecard aesthetic (dreamy sky-blue cloud canvas, floating macOS window frame with mini-sidebar, deterministic mosaic pastel cards, and Day/Midnight dual-mode theming) while preserving all existing functionality.

**Architecture:** A full-bleed responsive canvas with animated cloud blurs wraps a floating macOS window container. Inside, `Navbar.tsx` provides the top window toolbar with decorative traffic lights, `Sidebar.tsx` provides macro filtering (All, Starred, Tags, AI) with responsive desktop vertical / mobile horizontal layout, and `BookmarkFeed.tsx` renders an interactive dashed `[ ＋ Add Clip ]` card alongside digital notecards cycling through 4 signature pastel themes (`index % 4`). Starred state is maintained in `localStorage`.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 3.4, Framer Motion 12, Lucide React icons, Vite 6.

---

### Task 1: Theme Default & Cloud Backdrop Canvas

**Files:**
- Modify: `frontend/src/context/ThemeContext.tsx:16-20`
- Modify: `frontend/src/components/ui/background-grid.tsx:1-25`

- [ ] **Step 1: Update `ThemeContext.tsx` default to `'light'` (Day mode)**

In `frontend/src/context/ThemeContext.tsx`, ensure the initial theme fallback is `'light'` when `clipvault_theme` in `localStorage` is not present:
```typescript
const [theme, setTheme] = useState<Theme>(() => {
  const stored = localStorage.getItem('clipvault_theme') as Theme | null;
  if (stored) return stored;
  return 'light';
});
```

- [ ] **Step 2: Update `background-grid.tsx` with Day/Midnight Cloud Canvas**

In `frontend/src/components/ui/background-grid.tsx`, replace the dark zinc background with the dreamy sky-blue cloud gradient for Day mode and midnight cosmic indigo for Night mode:
```tsx
import React from 'react';
import { cn } from '../../lib/utils';

export function BackgroundGrid({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full transition-colors duration-500 overflow-x-hidden flex flex-col',
        'bg-gradient-to-b from-sky-200 via-sky-100 to-blue-50 text-slate-900',
        'dark:bg-gradient-to-b dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-slate-100',
        className
      )}
    >
      {/* Ambient Floating Cloud Elements (Day Mode) */}
      <div className="absolute -top-12 -left-12 w-96 h-56 bg-white/70 rounded-full blur-3xl pointer-events-none dark:opacity-10 animate-pulse duration-1000" />
      <div className="absolute top-20 -right-16 w-80 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none dark:opacity-10" />
      <div className="absolute top-96 left-1/4 w-72 h-40 bg-sky-100/50 rounded-full blur-2xl pointer-events-none dark:opacity-5" />

      {/* Ambient Cosmic Star Elements (Night Mode) */}
      <div className="hidden dark:block absolute top-16 right-24 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#fef08a] pointer-events-none" />
      <div className="hidden dark:block absolute top-36 left-20 w-1 h-1 rounded-full bg-blue-200 shadow-[0_0_6px_#93c5fd] pointer-events-none" />
      <div className="hidden dark:block absolute top-72 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-200 shadow-[0_0_8px_#c7d2fe] pointer-events-none" />

      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0 with no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/context/ThemeContext.tsx frontend/src/components/ui/background-grid.tsx
git commit -m "feat(frontend): set light theme default and add dreamy cloud backdrop canvas"
```

---

### Task 2: Top Window Toolbar & macOS Chrome (`Navbar.tsx`)

**Files:**
- Modify: `frontend/src/components/Navbar.tsx:1-171`

- [ ] **Step 1: Update `Navbar.tsx` to macOS Window Toolbar**

Transform `Navbar.tsx` to act as the integrated header toolbar for the floating window:
- Left: Decorative macOS traffic light dots (🔴 `#ef4444`, 🟡 `#f59e0b`, 🟢 `#10b981`), followed by the rounded `ClipVault` monogram logo (`bg-sky-500 text-white rounded-xl`).
- Center: Quick search pill button (`[ 🔍 Search clips... ⌘K ]`) with cloud-tinted hover state.
- Right: Grid/List view switcher in rounded pill style, Day/Night toggle button with ☀️/🌙 icon, and user avatar / Login button.

```tsx
import React from 'react';
import { Sun, Moon, LogIn, LogOut, Search, LayoutGrid, List } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  bookmarkCount: number;
  isBackendOffline: boolean;
  onOpenAuth: () => void;
  onOpenChat: () => void;
  onOpenCommandPalette?: () => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: (mode: 'grid' | 'list') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  isBackendOffline,
  onOpenAuth,
  onOpenCommandPalette,
  viewMode = 'grid',
  onToggleViewMode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <header className="w-full px-4 sm:px-6 h-14 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-t-[28px] select-none">
      {/* Window Controls & Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 mr-1" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-xs" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-xs" />
        </div>

        <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
          CV
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
            ClipVault
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
            {bookmarkCount}
          </span>
          {isBackendOffline && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Quick Search Pill (Desktop) */}
      {onOpenCommandPalette && (
        <div className="hidden sm:flex flex-1 max-w-sm justify-center px-2">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between gap-2 px-3.5 py-1.5 text-xs rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search clips or tags...</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open search"
            className="sm:hidden p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        {onToggleViewMode && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => onToggleViewMode('grid')}
              title="Grid view"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('list')}
              title="List view"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Sunny Day' : 'Switch to Midnight'}
          className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-white/10">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {username?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar.tsx
git commit -m "feat(frontend): style Navbar as macOS window toolbar with traffic light controls"
```

---

### Task 3: Left Mini-Sidebar (`Sidebar.tsx`)

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: Create `Sidebar.tsx` Component**

Implement the left navigation mini-sidebar matching StackNote:
- Desktop: `hidden md:flex flex-col w-52 shrink-0 border-r border-slate-200/80 dark:border-white/10 p-4 space-y-1`
- Mobile: Horizontal scrollable rail of pill buttons below window header.
- Items:
  - `📁 All Clips` (shows total count)
  - `⭐ Starred` (shows starred count)
  - `🏷️ Tags` (quick list of top 4 tags)
  - `✨ Ask AI` (triggers chat drawer)

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat(frontend): create Sidebar component with responsive desktop and mobile layouts"
```

---

### Task 4: QuickPaste Input Ref & Styling (`QuickPaste.tsx`)

**Files:**
- Modify: `frontend/src/components/QuickPaste.tsx:1-90`

- [ ] **Step 1: Update `QuickPaste.tsx` with Ref Forwarding & Pill Styling**

Update `QuickPaste.tsx` to accept `inputRef?: React.RefObject<HTMLInputElement | null>`, and style it as a clean pill input with an integrated dark `Clip` button:
```tsx
import React, { useState } from 'react';
import { Link2, Loader2, ArrowRight } from 'lucide-react';

interface QuickPasteProps {
  onSave: (url: string, notes?: string) => Promise<void>;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const QuickPaste: React.FC<QuickPasteProps> = ({ onSave, isLoading, inputRef }) => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    try {
      await onSave(url.trim(), notes.trim() || undefined);
      setUrl('');
      setNotes('');
      setShowNotes(false);
    } catch {
      // Handled by parent
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative flex items-center bg-white dark:bg-slate-800/90 rounded-full border border-slate-200/90 dark:border-white/10 shadow-sm hover:border-sky-300 dark:hover:border-sky-500/40 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all p-1.5 pl-4">
          <Link2 className="h-4 w-4 text-sky-500 shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="url"
            required
            placeholder="Paste URL to clip and summarize with AI..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none pr-2"
          />

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-full transition-colors shrink-0"
          >
            {showNotes ? 'Hide Note' : '+ Note'}
          </button>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>Clip</span>
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {showNotes && (
          <div className="px-4">
            <input
              type="text"
              placeholder="Add an optional personal note or insight..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 outline-none focus:border-sky-400"
            />
          </div>
        )}
      </form>
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/QuickPaste.tsx
git commit -m "feat(frontend): add inputRef support and pill styling to QuickPaste"
```

---

### Task 5: TagFilter Stationery Palette (`TagFilter.tsx`)

**Files:**
- Modify: `frontend/src/components/TagFilter.tsx:1-99`

- [ ] **Step 1: Restyle `TagFilter.tsx` to Pastel Stationery Tokens**

Update `TagFilter.tsx` to use rounded pill tags and search bar with soft cloud/pastel colors:
```tsx
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
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
              className="p-0.5 hover:text-sky-950 rounded-full"
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TagFilter.tsx
git commit -m "feat(frontend): restyle TagFilter with pastel pill buttons and rounded search"
```

---

### Task 6: Digital Notecard with Deterministic Mosaic Pastels & Star Action (`BookmarkCard.tsx` & `BookmarkListItem.tsx`)

**Files:**
- Modify: `frontend/src/components/BookmarkCard.tsx:1-192`
- Modify: `frontend/src/components/BookmarkListItem.tsx:1-140`

- [ ] **Step 1: Update `BookmarkCard.tsx` with Mosaic Pastels & Star Toggle**

Define the 4 deterministic pastel themes (`index % 4`):
- `0`: Peach (`bg-[#fff8f3] border-[#fed7aa] text-amber-950 dark:bg-orange-950/20 dark:border-orange-500/30 dark:text-orange-100`)
- `1`: Lilac (`bg-[#fbf7ff] border-[#e9d5ff] text-purple-950 dark:bg-purple-950/20 dark:border-purple-500/30 dark:text-purple-100`)
- `2`: Sky Cyan (`bg-[#f0f9ff] border-[#bae6fd] text-sky-950 dark:bg-sky-950/20 dark:border-sky-500/30 dark:text-sky-100`)
- `3`: Mint (`bg-[#f0fdf4] border-[#bbf7d0] text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-100`)

Include star toggle button in header, compact inset thumbnail for `ogImage`, and clean typography:

```tsx
import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Trash2, Calendar, Globe, Star } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  index: number;
  isStarred: boolean;
  onToggleStar: (id: string) => void;
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
  index,
  isStarred,
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
        </div>

        {/* Title & Inset Thumbnail */}
        <div className="flex items-start gap-3">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link flex-1 font-bold text-sm sm:text-base leading-snug hover:underline inline-flex items-baseline gap-1"
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
```

- [ ] **Step 2: Update `BookmarkListItem.tsx` with Star Toggle & Soft Styling**

Update `BookmarkListItem.tsx` with `isStarred`, `onToggleStar`, and clean rounded styling:
```tsx
import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Trash2, Globe, Star } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarkListItemProps {
  bookmark: Bookmark;
  isStarred: boolean;
  onToggleStar: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
}

export const BookmarkListItem: React.FC<BookmarkListItemProps> = ({
  bookmark,
  isStarred,
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
        <button
          type="button"
          onClick={() => onToggleStar(bookmark._id)}
          className="p-1 rounded-full text-slate-400 hover:text-amber-500 transition-colors shrink-0"
        >
          <Star className={`h-4 w-4 ${isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
        </button>

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
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/BookmarkCard.tsx frontend/src/components/BookmarkListItem.tsx
git commit -m "feat(frontend): apply deterministic mosaic pastels, star toggle, and inset images to cards"
```

---

### Task 7: Dashed `[ ＋ Add Clip ]` Card & Feed Integration (`BookmarkFeed.tsx`)

**Files:**
- Modify: `frontend/src/components/BookmarkFeed.tsx:1-149`

- [ ] **Step 1: Update `BookmarkFeed.tsx` with Dashed Add Card and Prop Flow**

Update `BookmarkFeed.tsx` to:
- Accept `starredIds: string[]`, `onToggleStar: (id: string) => void`, and `onAddClip: () => void`.
- In Grid view, render the interactive dashed `[ ＋ Add Clip ]` card as the first item.
- Pass `index={i}` to `BookmarkCard` so colors alternate predictably.
- Style empty and offline states in friendly StackNote stationery style.

```tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark as BookmarkIcon, WifiOff, Plus } from 'lucide-react';
import { Bookmark } from '../types';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkListItem } from './BookmarkListItem';

interface BookmarkFeedProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  isBackendOffline: boolean;
  onDelete: (id: string) => Promise<void>;
  onTagClick: (tag: string) => void;
  onClearFilters?: () => void;
  hasFilters: boolean;
  viewMode?: 'grid' | 'list';
  starredIds: string[];
  onToggleStar: (id: string) => void;
  onAddClip: () => void;
}

export const BookmarkFeed: React.FC<BookmarkFeedProps> = ({
  bookmarks,
  isLoading,
  isBackendOffline,
  onDelete,
  onTagClick,
  onClearFilters,
  hasFilters,
  viewMode = 'grid',
  starredIds,
  onToggleStar,
  onAddClip,
}) => {
  if (isBackendOffline) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <WifiOff className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Backend Disconnected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Make sure the ClipVault backend is running on port 3100.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && bookmarks.length === 0) {
    return (
      <div className="px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 animate-pulse border border-slate-200/60 dark:border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-3">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <BookmarkIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {hasFilters ? 'No bookmarks match your filter' : 'No clips in your vault yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {hasFilters
              ? 'Try searching with different keywords or clearing your active filters.'
              : 'Paste a link above or click "Add Clip" to save your first notecard.'}
          </p>
        </div>
        {hasFilters && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pb-20">
      {viewMode === 'grid' ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {/* Dashed Add Clip Card (First item in grid view) */}
          <motion.button
            type="button"
            onClick={onAddClip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-500/40 bg-white/60 dark:bg-slate-800/30 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 p-6 flex flex-col items-center justify-center text-center min-h-[170px] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
              Add New Clip
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Click to paste link in quick-save bar
            </p>
          </motion.button>

          <AnimatePresence>
            {bookmarks.map((bookmark, i) => (
              <motion.div
                layout
                key={bookmark._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <BookmarkCard
                  bookmark={bookmark}
                  index={i}
                  isStarred={starredIds.includes(bookmark._id)}
                  onToggleStar={onToggleStar}
                  onDelete={onDelete}
                  onTagClick={onTagClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {bookmarks.map((bookmark) => (
              <motion.div
                layout
                key={bookmark._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <BookmarkListItem
                  bookmark={bookmark}
                  isStarred={starredIds.includes(bookmark._id)}
                  onToggleStar={onToggleStar}
                  onDelete={onDelete}
                  onTagClick={onTagClick}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/BookmarkFeed.tsx
git commit -m "feat(frontend): add dashed Add Clip card and pass mosaic index and star state"
```

---

### Task 8: App Orchestrator, Starred State, & Frosted Window Frame (`App.tsx`)

**Files:**
- Modify: `frontend/src/App.tsx:1-226`

- [ ] **Step 1: Update `App.tsx` with Window Layout, Starred State & Focus Ref**

Update `App.tsx`:
- Centered floating window container (`rounded-[28px]`, `border border-white/80 dark:border-white/10`, `bg-white/95 dark:bg-slate-900/90`, `shadow-2xl shadow-sky-500/10`).
- Manage `starredIds: string[]` in `localStorage` under `clipvault_starred_ids`.
- Manage `activeFilter: 'all' | 'starred'`. Filter bookmarks accordingly.
- Create `quickPasteRef = useRef<HTMLInputElement>(null)`.
- Clicking dashed `[ ＋ Add Clip ]` card calls `quickPasteRef.current?.focus()`.
- Two-column window body: Left `Sidebar.tsx`, Right main workspace (`QuickPaste`, `TagFilter`, `BookmarkFeed`).
- In-window header: `"My Vault & Clips"` with subtitle and clean layout.

```tsx
import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { BackgroundGrid } from './components/ui/background-grid';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuickPaste } from './components/QuickPaste';
import { TagFilter } from './components/TagFilter';
import { BookmarkFeed } from './components/BookmarkFeed';
import { ChatDrawer } from './components/ChatDrawer';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import { Bookmark } from './types';

export function App() {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [masterTags, setMasterTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('clipvault_view_mode') as 'grid' | 'list') || 'grid';
    } catch {
      return 'grid';
    }
  });

  const [starredIds, setStarredIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('clipvault_starred_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const quickPasteRef = useRef<HTMLInputElement | null>(null);

  const handleToggleStar = (id: string) => {
    setStarredIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('clipvault_starred_ids', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleAddClip = () => {
    quickPasteRef.current?.focus();
    quickPasteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('clipvault_view_mode', mode);
    } catch {
      // Ignore
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load bookmarks
  useEffect(() => {
    let isCurrent = true;
    const loadBookmarks = async () => {
      setIsLoading(true);
      try {
        const res = await api.getBookmarks(
          selectedTag || undefined,
          debouncedSearch || undefined
        );
        if (!isCurrent) return;

        setBookmarks(res.bookmarks || []);

        if (!selectedTag && !debouncedSearch) {
          const allTags = (res.bookmarks || []).flatMap((b) => b.tags || []);
          setMasterTags(Array.from(new Set(allTags)).sort());
        }
        setIsBackendOffline(false);
      } catch (err) {
        if (!isCurrent) return;
        console.error('Error fetching bookmarks:', err);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadBookmarks();

    return () => {
      isCurrent = false;
    };
  }, [isAuthenticated, selectedTag, debouncedSearch]);

  const handleSave = async (url: string, notes?: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.createBookmark(url, notes);
      setBookmarks((prev) => [res.bookmark, ...prev]);

      if (res.bookmark.tags) {
        setMasterTags((prev) => Array.from(new Set([...prev, ...res.bookmark.tags])).sort());
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
    } else {
      setIsChatOpen(true);
    }
  };

  // Filter displayed bookmarks based on activeFilter
  const displayedBookmarks =
    activeFilter === 'starred'
      ? bookmarks.filter((b) => starredIds.includes(b._id))
      : bookmarks;

  const starredCount = bookmarks.filter((b) => starredIds.includes(b._id)).length;

  return (
    <BackgroundGrid>
      <div className="min-h-screen py-4 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full flex flex-col">
        {/* Floating macOS-Styled Window Frame */}
        <div className="flex-1 flex flex-col rounded-[28px] border border-white/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-sky-500/10 dark:shadow-indigo-950/60 overflow-hidden">
          {/* Top Window Header */}
          <Navbar
            bookmarkCount={bookmarks.length}
            isBackendOffline={isBackendOffline}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenChat={handleOpenChat}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            viewMode={viewMode}
            onToggleViewMode={handleToggleViewMode}
          />

          {/* Window Body: Sidebar + Main Workspace */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Left Mini-Sidebar */}
            <Sidebar
              totalCount={bookmarks.length}
              starredCount={starredCount}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              tags={masterTags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              onOpenChat={handleOpenChat}
            />

            {/* Main Content Workspace */}
            <main className="flex-1 flex flex-col pt-5 overflow-y-auto">
              {/* StackNote In-App Header */}
              <div className="px-4 sm:px-6 mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    {activeFilter === 'starred' ? '⭐ Starred Clips' : 'My Vault & Clips'}
                  </h1>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {activeFilter === 'starred'
                      ? 'Your curated favorite bookmarks'
                      : 'Personal digital stationery workspace for your links and ideas'}
                  </p>
                </div>
              </div>

              {/* Persistent QuickPaste Bar */}
              <QuickPaste
                onSave={handleSave}
                isLoading={isSaving}
                inputRef={quickPasteRef}
              />

              {/* Workspace Filter Rail */}
              <TagFilter
                tags={masterTags}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* Mosaic Card Feed */}
              <BookmarkFeed
                bookmarks={displayedBookmarks}
                isLoading={isLoading}
                isBackendOffline={isBackendOffline}
                onDelete={handleDelete}
                onTagClick={(tag) => setSelectedTag(tag)}
                onClearFilters={() => {
                  setSelectedTag(null);
                  setActiveFilter('all');
                  setSearchQuery('');
                }}
                hasFilters={!!selectedTag || !!searchQuery || activeFilter === 'starred'}
                viewMode={viewMode}
                starredIds={starredIds}
                onToggleStar={handleToggleStar}
                onAddClip={handleAddClip}
              />
            </main>
          </div>
        </div>
      </div>

      {/* Floating "Ask AI" Trigger (Retained on mobile only) */}
      <div className="md:hidden fixed bottom-5 right-5 z-30">
        <button
          type="button"
          onClick={handleOpenChat}
          aria-label="Ask AI Assistant"
          className="px-4 py-2 font-semibold text-xs rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI</span>
        </button>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        bookmarks={bookmarks}
        tags={masterTags}
        onSelectTag={(tag) => setSelectedTag(tag)}
      />

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </BackgroundGrid>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat(frontend): orchestrate App with floating macOS window, sidebar layout, and starred persistence"
```

---

### Task 9: ChatDrawer, CommandPalette, & AuthModal Pastel Polish

**Files:**
- Modify: `frontend/src/components/ChatDrawer.tsx`
- Modify: `frontend/src/components/CommandPalette.tsx`
- Modify: `frontend/src/components/AuthModal.tsx`

- [ ] **Step 1: Polish `ChatDrawer.tsx` with Frosted Pastel Glass**

Ensure `ChatDrawer.tsx` uses frosted glass styling (`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-white/10`), rounded message bubbles, and soft lilac/sky assistant accent pills.

- [ ] **Step 2: Polish `CommandPalette.tsx` and `AuthModal.tsx`**

Ensure `CommandPalette.tsx` and `AuthModal.tsx` use `rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl` matching the window aesthetic.

- [ ] **Step 3: Verify build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ChatDrawer.tsx frontend/src/components/CommandPalette.tsx frontend/src/components/AuthModal.tsx
git commit -m "feat(frontend): polish ChatDrawer, CommandPalette, and AuthModal with frosted glass pastel styling"
```

---

### Task 10: End-to-End Build & Functional Verification

**Files:**
- Verify: Full frontend build and interaction flow

- [ ] **Step 1: Execute full TypeScript and Vite build**

Run: `npm run build --prefix frontend`  
Expected: Exit 0 with bundle generation and 0 errors.

- [ ] **Step 2: Verify Theme, Layout & Card Color Alternation**

Verify:
- Day mode displays sky-blue gradient with soft ambient clouds.
- Window container renders macOS red/amber/green controls and left mini-sidebar.
- Cards cycle smoothly through Peach, Lilac, Sky Cyan, and Mint.
- Clicking the dashed `[ ＋ Add Clip ]` card focuses the QuickPaste input.
- Star toggle button works and persists in localStorage.
- Dark mode toggle transitions to midnight cosmic theme.

- [ ] **Step 3: Commit final verification**

```bash
git add -A
git commit -m "chore(frontend): complete StackNote aesthetic redesign verification"
```

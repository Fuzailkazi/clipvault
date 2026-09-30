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

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodic health check every 15 seconds
  useEffect(() => {
    let isMounted = true;
    const checkServerHealth = async () => {
      const isOnline = await api.checkHealth();
      if (isMounted) setIsBackendOffline(!isOnline);
    };

    checkServerHealth();
    const interval = setInterval(checkServerHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Unauthorized session listener
  useEffect(() => {
    const handleUnauthorized = () => {
      setBookmarks([]);
      setSelectedTag(null);
      setSearchQuery('');
      setIsAuthOpen(true);
    };
    window.addEventListener('clipvault:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('clipvault:unauthorized', handleUnauthorized);
  }, []);

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
      if (!isAuthenticated) {
        setBookmarks([]);
        setIsLoading(false);
        return;
      }

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
        setIsBackendOffline(true);
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

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { BackgroundGrid } from './components/ui/background-grid';
import { Navbar } from './components/Navbar';
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

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('clipvault_view_mode', mode);
    } catch {
      // Ignore
    }
  };

  // Global ⌘K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search query by 250ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Check backend health periodically
  useEffect(() => {
    const checkServer = async () => {
      const online = await api.checkHealth();
      setIsBackendOffline(!online);
    };
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch bookmarks with race-condition guard & clean logout reset
  useEffect(() => {
    let isCurrent = true;

    if (!isAuthenticated) {
      setBookmarks([]);
      setMasterTags([]);
      setSelectedTag(null);
      setSearchQuery('');
      return;
    }

    const loadBookmarks = async () => {
      try {
        setIsLoading(true);
        const res = await api.getBookmarks(selectedTag || undefined, debouncedSearch || undefined);
        if (!isCurrent) return;

        setBookmarks(res.bookmarks || []);

        // If unfiltered, update master persistent tags
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

      // Add newly generated tags to masterTags
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

  return (
    <BackgroundGrid>
      <Navbar
        bookmarkCount={bookmarks.length}
        isBackendOffline={isBackendOffline}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChat={handleOpenChat}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
      />

      <main className="flex-1">
        {/* Subtle, modern headline */}
        <div className="text-center pt-8 pb-2 px-4 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Intelligent Bookmark Vault
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Autonomous ingestion, smart 2-sentence summaries, and instant semantic search.
          </p>
        </div>

        <QuickPaste onSave={handleSave} isLoading={isSaving} />

        <TagFilter
          tags={masterTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <BookmarkFeed
          bookmarks={bookmarks}
          isLoading={isLoading}
          isBackendOffline={isBackendOffline}
          onDelete={handleDelete}
          onTagClick={(tag) => setSelectedTag(tag)}
          onClearFilters={() => {
            setSelectedTag(null);
            setSearchQuery('');
          }}
          hasFilters={!!selectedTag || !!searchQuery}
          viewMode={viewMode}
        />
      </main>

      {/* Floating "Ask AI" Trigger */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          type="button"
          onClick={handleOpenChat}
          aria-label="Ask AI Assistant"
          className="px-3.5 py-2 font-medium text-xs rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 shadow-xl shadow-black/20 flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-600" />
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

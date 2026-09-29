import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { BackgroundGrid } from './components/ui/background-grid';
import { Button } from './components/ui/moving-border';
import { Navbar } from './components/Navbar';
import { QuickPaste } from './components/QuickPaste';
import { TagFilter } from './components/TagFilter';
import { BookmarkFeed } from './components/BookmarkFeed';
import { ChatDrawer } from './components/ChatDrawer';
import { AuthModal } from './components/AuthModal';
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

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    if (!isAuthenticated) {
      setBookmarks([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getBookmarks(selectedTag || undefined, debouncedSearch || undefined);
      setBookmarks(res.bookmarks || []);

      // If unfiltered, update master persistent tags
      if (!selectedTag && !debouncedSearch) {
        const allTags = res.bookmarks.flatMap((b) => b.tags || []);
        setMasterTags(Array.from(new Set(allTags)).sort());
      }
      setIsBackendOffline(false);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
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
    await api.deleteBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b._id !== id));
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
      />

      <main className="flex-1">
        <div className="text-center pt-8 px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-zinc-300 bg-clip-text text-transparent">
            Your Intelligent Bookmark Vault
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto">
            Paste any link. Our Google ADK agent scrapes, summarizes in 2 sentences, and auto-tags your library.
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
        />
      </main>

      {/* Floating "Ask AI" Trigger (Spec 3.2 item 2 & Spec 4.6) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleOpenChat}
          borderRadius="1rem"
          aria-label="Ask AI Assistant"
          className="px-4 py-2.5 font-semibold text-xs shadow-xl shadow-indigo-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Ask AI Assistant</span>
        </Button>
      </div>

      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </BackgroundGrid>
  );
}

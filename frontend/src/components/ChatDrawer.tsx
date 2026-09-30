import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, Bot, User as UserIcon, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { Bookmark } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  bookmarks?: Bookmark[];
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks?: Bookmark[];
}

export function generateDynamicRecommendations(bookmarks: Bookmark[] = []): string[] {
  if (!bookmarks || bookmarks.length === 0) {
    return [
      'How do I clip and organize links?',
      'What categories can I organize with?',
      'How does AI knowledge search work?',
    ];
  }

  const queries: string[] = [];

  // 1. Tag frequency analysis
  const tagCounts: Record<string, number> = {};
  for (const b of bookmarks) {
    for (const t of b.tags || []) {
      const clean = t.replace(/^#/, '').trim().toLowerCase();
      if (clean && clean !== 'link' && clean !== 'clipvault' && clean !== 'read') {
        tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      }
    }
  }

  const topTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

  if (topTags.length > 0) {
    queries.push(`What did I save about #${topTags[0]}?`);
    if (topTags.length > 1) {
      queries.push(`Show me bookmarks tagged #${topTags[1]}`);
    }
  }

  // 2. Category suggestions (if non-general)
  const categories = Array.from(
    new Set(
      bookmarks
        .map((b) => b.category?.trim().toLowerCase())
        .filter((c): c is string => !!c && c !== 'general')
    )
  );

  if (categories.length > 0 && queries.length < 3) {
    queries.push(`Summarize my ${categories[0]} links`);
  }

  // 3. Domain or title from recent clips
  for (const b of bookmarks) {
    if (queries.length >= 3) break;
    try {
      const domain = new URL(b.url).hostname.replace(/^www\./, '');
      const domainQuery = `Find clips from ${domain}`;
      if (domain && !queries.includes(domainQuery)) {
        queries.push(domainQuery);
      }
    } catch {
      // Ignore URL parse error
    }
  }

  // 4. Fallback if still under 3
  if (queries.length < 3) {
    queries.push('What are the key insights across my latest clips?');
  }

  return queries.slice(0, 3);
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose, bookmarks = [] }) => {
  const dynamicSuggestions = useMemo(() => generateDynamicRecommendations(bookmarks), [bookmarks]);

  const welcomeText = useMemo(() => {
    if (bookmarks.length === 0) {
      return "Hello! I'm your ClipVault Assistant. Once you clip some links, you can ask me to search, summarize, or connect insights across your vault.";
    }
    const topTag = bookmarks.flatMap((b) => b.tags || [])[0]?.replace(/^#/, '');
    const topicHint = topTag ? ` (like your clips on #${topTag})` : '';
    return `Hello! I'm your ClipVault Assistant. Ask me anything about your ${bookmarks.length} saved clip${bookmarks.length > 1 ? 's' : ''}${topicHint}.`;
  }, [bookmarks]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: welcomeText,
    },
  ]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], text: welcomeText }];
      }
      return prev;
    });
  }, [welcomeText]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const result = await api.chat(userMessage.text);
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: result.response,
        bookmarks: result.bookmarks,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: err.message || "I couldn't reach the agent. Please make sure you are logged in.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-label="ClipVault AI Assistant"
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-white/10 shadow-2xl flex flex-col h-full z-10 text-slate-900 dark:text-slate-100"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    AI Assistant
                  </h2>
                  <p className="text-[11px] text-slate-400">Gemini knowledge exploration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 text-xs sm:text-sm ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="space-y-2 max-w-[85%]">
                    <div
                      className={`p-3 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white rounded-2xl rounded-tr-sm shadow-xs'
                          : 'bg-sky-50/80 dark:bg-slate-800/80 border border-sky-100 dark:border-white/5 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Attached Bookmarks List */}
                    {msg.bookmarks && msg.bookmarks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                          Referenced items:
                        </span>
                        {msg.bookmarks.map((b) => (
                          <a
                            key={b._id}
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-700 transition-colors group/card shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                                {b.title}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-400 group-hover/card:text-sky-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {b.summary}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 text-xs text-slate-400 items-center">
                  <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <span className="text-xs">Querying vault knowledge base...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-white/10 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    {bookmarks.length > 0 ? 'Suggestions from your clips:' : 'Getting Started:'}
                  </span>
                  {bookmarks.length > 0 && (
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                      Based on your vault
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {dynamicSuggestions.map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-sky-400 dark:hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer shadow-xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2 bg-white/70 dark:bg-slate-900/70"
            >
              <input
                type="text"
                aria-label="Ask about your bookmarks"
                placeholder="Ask about your bookmarks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none border border-transparent focus:border-sky-400 transition-colors"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

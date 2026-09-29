import React, { useState, useRef, useEffect } from 'react';
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
}

const SUGGESTED_QUERIES = [
  'What Docker bookmarks do I have saved?',
  'Show me tools I saved for frontend development',
  'Find bookmarks about AI and LLMs',
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your ClipVault Assistant. Ask me anything about your saved bookmarks, like 'What articles did I save last week about Docker?'",
    },
  ]);
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            aria-label="ClipVault AI Assistant"
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ClipVault AI Assistant
                  </h3>
                  <p className="text-[11px] text-slate-400">Powered by Google ADK</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs sm:text-sm ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%]`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-tl-none leading-relaxed'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Attached Bookmarks List */}
                    {msg.bookmarks && msg.bookmarks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                          Referenced Bookmarks:
                        </span>
                        {msg.bookmarks.map((b) => (
                          <a
                            key={b._id}
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 hover:border-indigo-400 transition-colors group/card"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                {b.title}
                              </span>
                              <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover/card:text-indigo-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {b.summary}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 text-xs text-slate-500 dark:text-zinc-400 items-center">
                  <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                  <span>Searching your bookmarks...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800/60 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Suggestions:
                </span>
                <div className="flex flex-col gap-1">
                  {SUGGESTED_QUERIES.map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
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
              className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900"
            >
              <input
                type="text"
                aria-label="Ask about your bookmarks"
                placeholder="Ask about your bookmarks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

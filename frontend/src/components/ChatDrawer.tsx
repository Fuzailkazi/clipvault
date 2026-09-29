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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-label="ClipVault AI Assistant"
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 text-zinc-900 dark:text-zinc-100"
          >
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-500">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    ClipVault Assistant
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">Semantic RAG Agent</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat drawer"
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
                    <div className="h-6 w-6 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div className="space-y-2 max-w-[85%]">
                    <div
                      className={`p-3 rounded-xl text-xs sm:text-sm ${
                        msg.sender === 'user'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 leading-relaxed'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Attached Bookmarks List */}
                    {msg.bookmarks && msg.bookmarks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                          Referenced items:
                        </span>
                        {msg.bookmarks.map((b) => (
                          <a
                            key={b._id}
                            href={b.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors group/card"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                {b.title}
                              </span>
                              <ExternalLink className="h-3 w-3 text-zinc-400 group-hover/card:text-zinc-200 shrink-0" />
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                              {b.summary}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="h-6 w-6 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 text-xs text-zinc-400 items-center">
                  <div className="h-6 w-6 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-indigo-500 flex items-center justify-center shrink-0">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <span className="text-xs font-mono">Querying vault knowledge base...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length === 1 && (
              <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-950">
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                  Suggestions:
                </span>
                <div className="flex flex-col gap-1">
                  {SUGGESTED_QUERIES.map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs px-2.5 py-1.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
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
              className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-950"
            >
              <input
                type="text"
                aria-label="Ask about your bookmarks"
                placeholder="Ask about your bookmarks..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer border border-zinc-800 dark:border-zinc-200"
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

import React, { useState } from 'react';
import { Link2, Sparkles, Loader2, StickyNote } from 'lucide-react';
import { Button } from './ui/moving-border';

interface QuickPasteProps {
  onSave: (url: string, notes?: string) => Promise<void>;
  isLoading: boolean;
}

export const QuickPaste: React.FC<QuickPasteProps> = ({ onSave, isLoading }) => {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let target = url.trim();
    if (!target) return;

    // Automatically prepend https:// if missing
    if (!/^https?:\/\//i.test(target)) {
      target = `https://${target}`;
    }

    try {
      setError(null);
      await onSave(target, notes.trim() || undefined);
      setUrl('');
      setNotes('');
      setShowNotes(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save bookmark');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-xl shadow-indigo-500/5 rounded-2xl p-2 transition-all duration-300 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <div className="flex items-center gap-3 px-3 py-1">
            <Link2 className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Paste any URL (article, GitHub repo, tweet, tool)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
            
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              title="Add quick note"
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                showNotes || notes
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <StickyNote className="h-4 w-4" />
            </button>

            <Button
              as="button"
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">AI Ingesting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Save</span>
                </div>
              )}
            </Button>
          </div>

          {/* Expandable note input */}
          {showNotes && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 px-3 pb-1">
              <input
                type="text"
                placeholder="Optional quick note (e.g. check this for our next release)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent text-xs text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-xs text-rose-500 font-medium text-center">{error}</p>
        )}
      </form>
    </div>
  );
};

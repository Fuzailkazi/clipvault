import React, { useState } from 'react';
import { Link2, Loader2, StickyNote, Plus } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto my-6 px-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-xs transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
          <div className="flex items-center gap-2.5 px-2.5 py-1">
            <Link2 className="h-4 w-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Paste any link to ingest (article, GitHub repo, tweet, tool)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-transparent text-xs sm:text-sm outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />

            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              title="Add note"
              aria-label="Add note"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                showNotes || notes
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <StickyNote className="h-3.5 w-3.5" />
            </button>

            {/* Tactile Save Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 border border-zinc-800 dark:border-zinc-200 flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Ingesting...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable note input */}
          {showNotes && (
            <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 px-2.5 pb-1">
              <input
                type="text"
                placeholder="Optional personal note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                className="w-full bg-transparent text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
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

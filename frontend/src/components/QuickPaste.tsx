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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let target = url.trim();
    if (!target || isLoading) return;

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
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative flex items-center bg-white dark:bg-slate-800/90 rounded-full border border-slate-200/90 dark:border-white/10 shadow-sm hover:border-sky-300 dark:hover:border-sky-500/40 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all p-1.5 pl-4">
          <Link2 className="h-4 w-4 text-sky-500 shrink-0 mr-2.5" />
          <input
            ref={inputRef}
            type="text"
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
            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-full transition-colors shrink-0 cursor-pointer"
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

        {error && (
          <p className="mt-1 px-4 text-xs text-rose-500 font-medium text-center">{error}</p>
        )}
      </form>
    </div>
  );
};

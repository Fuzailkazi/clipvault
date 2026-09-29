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
        'relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-400',
        className
      )}
    >
      {/* Subtle top ambient sheen */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/[0.03] to-transparent dark:from-indigo-500/[0.04] pointer-events-none" />
      {children}
    </div>
  );
}


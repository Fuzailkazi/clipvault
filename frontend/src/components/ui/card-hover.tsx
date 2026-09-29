import React from 'react';
import { cn } from '../../lib/utils';

export function HoverCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative group rounded-2xl p-[1px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5',
        className
      )}
    >
      {/* Glowing Gradient Border on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Card Content Shell */}
      <div className="relative h-full w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

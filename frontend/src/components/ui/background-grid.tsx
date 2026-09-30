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
        'relative min-h-screen w-full transition-colors duration-500 overflow-x-hidden flex flex-col',
        'bg-gradient-to-b from-sky-200 via-sky-100 to-blue-50 text-slate-900',
        'dark:bg-gradient-to-b dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900 dark:text-slate-100',
        className
      )}
    >
      {/* Ambient Floating Cloud Elements (Day Mode) */}
      <div className="absolute -top-12 -left-12 w-96 h-56 bg-white/70 rounded-full blur-3xl pointer-events-none dark:opacity-10 animate-pulse duration-1000" />
      <div className="absolute top-20 -right-16 w-80 h-48 bg-white/60 rounded-full blur-2xl pointer-events-none dark:opacity-10" />
      <div className="absolute top-96 left-1/4 w-72 h-40 bg-sky-100/50 rounded-full blur-2xl pointer-events-none dark:opacity-5" />

      {/* Ambient Cosmic Star Elements (Night Mode) */}
      <div className="hidden dark:block absolute top-16 right-24 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#fef08a] pointer-events-none" />
      <div className="hidden dark:block absolute top-36 left-20 w-1 h-1 rounded-full bg-blue-200 shadow-[0_0_6px_#93c5fd] pointer-events-none" />
      <div className="hidden dark:block absolute top-72 right-1/3 w-1.5 h-1.5 rounded-full bg-indigo-200 shadow-[0_0_8px_#c7d2fe] pointer-events-none" />

      {children}
    </div>
  );
}

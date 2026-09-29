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
        'relative min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col',
        className
      )}
    >
      {/* Radial Masked Ambient Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      {children}
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function Button({
  borderRadius = '0.75rem',
  children,
  as: Component = 'button',
  containerClassName,
  borderClassName,
  duration = 3000,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn(
        'bg-transparent relative text-xl p-[1px] overflow-hidden cursor-pointer inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed',
        containerClassName
      )}
      style={{ borderRadius }}
      {...otherProps}
    >
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="absolute h-full w-full"
          width="100%"
          height="100%"
        >
          <rect
            fill="none"
            width="100%"
            height="100%"
            rx="12"
            ry="12"
          />
          <motion.rect
            fill="none"
            width="100%"
            height="100%"
            rx="12"
            ry="12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="40 140"
            className={cn('text-indigo-500 dark:text-indigo-400', borderClassName)}
            animate={{ strokeDashoffset: [0, -360] }}
            transition={{ duration: duration / 1000, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
      </div>

      <div
        className={cn(
          'relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 backdrop-blur-xl text-slate-900 dark:text-white flex items-center justify-center w-full h-full text-sm antialiased shadow-sm',
          className
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </Component>
  );
}

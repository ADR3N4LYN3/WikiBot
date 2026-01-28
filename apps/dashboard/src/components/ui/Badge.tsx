'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'premium';
  glow?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  glow = false,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-500/20 text-green-500 dark:bg-green-500/10',
    warning: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 dark:bg-yellow-500/10',
    error: 'bg-red-500/20 text-red-500 dark:bg-red-500/10',
    premium: 'bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 text-primary',
  };

  const glowColors = {
    default: '',
    success: 'shadow-green-500/30',
    warning: 'shadow-yellow-500/30',
    error: 'shadow-red-500/30',
    premium: 'shadow-primary/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'px-2.5 py-0.5 rounded-full',
        'text-xs font-medium',
        'transition-all duration-300',
        variants[variant],
        glow && ['shadow-lg', glowColors[variant]],
        className
      )}
    >
      {variant === 'premium' && (
        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse" />
      )}
      {children}
    </span>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export function GradientText({
  children,
  className,
  animate = true,
  as: Component = 'span',
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        'bg-gradient-to-r from-primary via-secondary to-accent',
        'bg-clip-text text-transparent',
        animate && 'bg-[length:200%_auto] animate-gradient',
        className
      )}
    >
      {children}
    </Component>
  );
}

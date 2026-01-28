'use client';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, hover = true, glow = false, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'bg-card/60 backdrop-blur-xl',
          'border border-border/50',
          'shadow-lg shadow-black/5 dark:shadow-primary/5',
          hover && [
            'transition-all duration-300',
            'hover:bg-card/80 hover:border-primary/30',
            'hover:shadow-xl hover:shadow-primary/10',
            'hover:-translate-y-0.5',
          ],
          glow && 'glow-hover',
          className
        )}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

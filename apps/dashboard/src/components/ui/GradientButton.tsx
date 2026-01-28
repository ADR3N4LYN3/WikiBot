'use client';

import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface GradientButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    const variants = {
      primary: [
        'bg-gradient-to-r from-primary via-secondary to-accent',
        'bg-[length:200%_200%] animate-gradient',
        'text-white',
        'shadow-lg shadow-primary/25',
        'hover:shadow-xl hover:shadow-primary/40',
      ],
      secondary: [
        'bg-muted/50 hover:bg-muted',
        'text-foreground',
        'border border-border hover:border-primary/30',
      ],
      outline: [
        'bg-transparent',
        'text-primary',
        'border-2 border-primary/50 hover:border-primary',
        'hover:bg-primary/10',
      ],
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden rounded-xl font-semibold',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          sizes[size],
          variants[variant],
          variant === 'primary' && !disabled && 'hover:scale-[1.02]',
          className
        )}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        {...props}
      >
        {/* Shine effect on hover */}
        {variant === 'primary' && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
          </div>
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : icon ? (
            <span className="w-5 h-5">{icon}</span>
          ) : null}
          {children}
        </span>
      </motion.button>
    );
  }
);

GradientButton.displayName = 'GradientButton';

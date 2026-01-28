'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'relative w-9 h-9 rounded-lg',
        'flex items-center justify-center',
        'bg-muted/50 hover:bg-muted',
        'border border-border/50 hover:border-primary/30',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/10',
        'group'
      )}
      title={`Theme: ${theme} (click to cycle)`}
    >
      {theme === 'system' ? (
        <Monitor className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="w-4 h-4 text-primary group-hover:text-primary transition-colors" />
      ) : (
        <Sun className="w-4 h-4 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
      )}

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-colors" />
    </button>
  );
}

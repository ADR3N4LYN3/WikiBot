'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { LogOut, ChevronDown, Settings, User as UserIcon, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ServerSelector } from './ServerSelector';
import { ThemeToggle } from './ThemeToggle';
import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toggle } = useSidebar();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 glass border-b border-border/50 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggle}
          className={cn(
            'lg:hidden p-2 rounded-lg',
            'bg-muted/50 hover:bg-muted',
            'text-muted-foreground hover:text-foreground',
            'transition-colors duration-200'
          )}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <ServerSelector />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <motion.button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl',
              'hover:bg-muted/50 transition-colors duration-300',
              'border border-transparent hover:border-border/50',
              menuOpen && 'bg-muted/50 border-border/50'
            )}
            whileTap={{ scale: 0.98 }}
          >
            {/* Avatar with gradient ring */}
            <div className="relative">
              <div
                className={cn(
                  'absolute -inset-0.5 rounded-full',
                  'bg-gradient-to-r from-primary via-secondary to-accent',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'blur-sm'
                )}
              />
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User'}
                  width={36}
                  height={36}
                  className="relative rounded-full ring-2 ring-border"
                />
              ) : (
                <div
                  className={cn(
                    'relative w-9 h-9 rounded-full',
                    'bg-gradient-to-br from-primary to-secondary',
                    'flex items-center justify-center',
                    'text-white text-sm font-semibold',
                    'ring-2 ring-border'
                  )}
                >
                  {user?.name?.[0] || 'U'}
                </div>
              )}

              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>

            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform duration-300',
                menuOpen && 'rotate-180'
              )}
            />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'absolute right-0 top-full mt-2 w-56',
                  'glass rounded-xl border border-border/50',
                  'shadow-xl shadow-black/10 dark:shadow-primary/5',
                  'overflow-hidden'
                )}
              >
                {/* User info section */}
                <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5',
                      'text-sm text-muted-foreground',
                      'hover:bg-muted/50 hover:text-foreground',
                      'transition-colors duration-200'
                    )}
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5',
                      'text-sm text-muted-foreground',
                      'hover:bg-muted/50 hover:text-foreground',
                      'transition-colors duration-200'
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                {/* Sign out */}
                <div className="py-1 border-t border-border/50">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5',
                      'text-sm text-destructive',
                      'hover:bg-destructive/10',
                      'transition-colors duration-200'
                    )}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  FolderOpen,
  BarChart3,
  Settings,
  Home,
  Sparkles,
  Crown,
  X,
  ToggleRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { useSidebar } from './SidebarContext';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Articles', href: '/dashboard/articles', icon: BookOpen },
  { name: 'Categories', href: '/dashboard/categories', icon: FolderOpen },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Modules', href: '/dashboard/modules', icon: ToggleRight },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onNavClick}>
          <motion.div
            className={cn(
              'w-10 h-10 rounded-xl',
              'bg-gradient-to-br from-primary via-secondary to-accent',
              'flex items-center justify-center',
              'shadow-lg shadow-primary/25',
              'group-hover:shadow-xl group-hover:shadow-primary/40',
              'transition-shadow duration-300'
            )}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-lg gradient-text">WikiBot</span>
            <span className="text-[10px] text-muted-foreground -mt-1">Dashboard</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navigation.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={onNavClick}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {/* Active background with gradient */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-primary/80 to-secondary shadow-lg shadow-primary/25"
                    layoutId="activeNav"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon with glow effect */}
                <span
                  className={cn(
                    'relative z-10 p-1.5 rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-white/20'
                      : 'group-hover:bg-primary/10 group-hover:text-primary'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </span>

                <span className="relative z-10">{item.name}</span>

                {/* Hover indicator */}
                {!isActive && (
                  <span className="absolute left-0 w-0.5 h-0 bg-primary rounded-r-full transition-all duration-300 group-hover:h-6" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer - Plan indicator */}
      <div className="p-4 border-t border-border/50">
        <motion.div
          className={cn(
            'relative overflow-hidden rounded-xl p-4',
            'bg-gradient-to-br from-muted/50 via-muted/30 to-transparent',
            'border border-border/50'
          )}
          whileHover={{ scale: 1.02 }}
        >
          {/* Sparkle decoration */}
          <Sparkles className="absolute top-2 right-2 w-4 h-4 text-primary/30" />

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">Free Plan</Badge>
          </div>

          <p className="text-sm font-medium mb-1">50 articles remaining</p>
          <p className="text-xs text-muted-foreground mb-3">
            Upgrade for unlimited articles
          </p>

          <Link
            href="/dashboard/settings/billing"
            onClick={onNavClick}
            className={cn(
              'flex items-center justify-center gap-2 w-full',
              'px-3 py-2 rounded-lg',
              'bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20',
              'hover:from-primary/30 hover:via-secondary/30 hover:to-accent/30',
              'text-sm font-medium text-primary',
              'border border-primary/20 hover:border-primary/40',
              'transition-all duration-300'
            )}
          >
            <Crown className="w-4 h-4" />
            Upgrade to Premium
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { isOpen, setIsOpen } = useSidebar();

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Desktop Sidebar - Fixed, always visible on lg+ */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 glass border-r border-border/50 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Drawer with overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
            />

            {/* Drawer */}
            <motion.aside
              className="lg:hidden fixed inset-y-0 left-0 w-72 glass border-r border-border/50 z-50"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Close button */}
              <button
                onClick={closeSidebar}
                className={cn(
                  'absolute top-4 right-4 p-2 rounded-lg z-10',
                  'bg-muted/50 hover:bg-muted',
                  'text-muted-foreground hover:text-foreground',
                  'transition-colors duration-200'
                )}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>

              <SidebarContent onNavClick={closeSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

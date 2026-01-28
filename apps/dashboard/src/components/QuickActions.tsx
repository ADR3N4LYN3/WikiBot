'use client';

import Link from 'next/link';
import { Plus, FolderPlus, Search, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { GlassCard } from './ui/GlassCard';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  gradient: string;
  iconBg: string;
}

interface QuickActionsProps {
  onNewCategory?: () => void;
  onSearch?: () => void;
}

export function QuickActions({ onNewCategory, onSearch }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'new-article',
      label: 'New Article',
      description: 'Create a wiki article',
      icon: Plus,
      href: '/dashboard/articles/new',
      gradient: 'from-primary to-secondary',
      iconBg: 'bg-primary/10',
    },
    {
      id: 'new-category',
      label: 'New Category',
      description: 'Organize your content',
      icon: FolderPlus,
      onClick: onNewCategory,
      gradient: 'from-secondary to-accent',
      iconBg: 'bg-secondary/10',
    },
    {
      id: 'search',
      label: 'Quick Search',
      description: 'Find articles fast',
      icon: Search,
      onClick: onSearch,
      gradient: 'from-accent to-primary',
      iconBg: 'bg-accent/10',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure your wiki',
      icon: Settings,
      href: '/dashboard/settings',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const ActionIcon = action.icon;
        const content = (
          <GlassCard
            className="p-4 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  action.iconBg,
                  'group-hover:scale-110'
                )}
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 5 }}
              >
                <ActionIcon
                  className={cn(
                    'w-5 h-5 transition-colors duration-300',
                    'text-foreground group-hover:text-primary'
                  )}
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{action.label}</p>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">
                  {action.description}
                </p>
              </div>
            </div>
            {/* Gradient line at bottom */}
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl',
                'bg-gradient-to-r opacity-0 group-hover:opacity-100',
                'transition-opacity duration-300',
                action.gradient
              )}
            />
          </GlassCard>
        );

        if (action.href) {
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={action.href}>{content}</Link>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={action.onClick}
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}

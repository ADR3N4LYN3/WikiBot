'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, Search, BarChart3, LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
        <div className="relative p-4 bg-muted/50 rounded-full border border-border">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {action.label}
          </button>
        )
      )}

      {children}
    </motion.div>
  );
}

// Pre-configured empty states for common use cases
export function EmptyArticles() {
  return (
    <EmptyState
      icon={FileText}
      title="No articles yet"
      description="Create your first article to start building your knowledge base."
      action={{
        label: 'Create Article',
        href: '/dashboard/articles/new',
      }}
    />
  );
}

export function EmptyCategories() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No categories yet"
      description="Organize your articles by creating categories."
      action={{
        label: 'Create Category',
        href: '/dashboard/categories',
      }}
    />
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No articles match "${query}". Try a different search term.`}
    />
  );
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No data yet"
      description="Analytics will appear here once your articles start getting views."
    />
  );
}

'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.map((item, index) => (
        <Fragment key={index}>
          <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

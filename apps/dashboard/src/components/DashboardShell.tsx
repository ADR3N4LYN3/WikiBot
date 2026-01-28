'use client';

import { useEffect } from 'react';

import { CommandPaletteProvider, useCommandPalette } from '@/hooks/useCommandPalette';
import { CommandPalette } from './CommandPalette';

interface DashboardShellProps {
  children: React.ReactNode;
}

function DashboardShellContent({ children }: DashboardShellProps) {
  const { open, toggle } = useCommandPalette();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
        return;
      }

      // Ctrl + N for new article (when not in input)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'n' &&
        !e.shiftKey &&
        !isInputFocused()
      ) {
        e.preventDefault();
        window.location.href = '/dashboard/articles/new';
        return;
      }

      // Ctrl + , for settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        window.location.href = '/dashboard/settings';
        return;
      }

      // / to focus search (when not in input)
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        open();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, toggle]);

  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <CommandPaletteProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </CommandPaletteProvider>
  );
}

// Helper to check if an input element is focused
function isInputFocused(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea') return true;
  if (activeElement.getAttribute('contenteditable') === 'true') return true;

  return false;
}

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command as CommandIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { createCommands, filterCommands } from '@/lib/commands';

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const sections = createCommands(
    (path) => {
      router.push(path);
      close();
    },
    {
      openSearch: () => {
        close();
        // Could trigger a search modal
      },
      openCategoryModal: () => {
        close();
        router.push('/dashboard/categories');
      },
    }
  );

  const filteredSections = filterCommands(sections, query);
  const allCommands = filteredSections.flatMap((s) => s.commands);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, allCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (allCommands[selectedIndex]) {
            allCommands[selectedIndex].action();
            close();
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [allCommands, selectedIndex, close]
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            className="fixed top-[20%] left-1/2 w-full max-w-lg z-50"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className={cn(
                'mx-4 overflow-hidden rounded-2xl',
                'bg-card/95 backdrop-blur-xl',
                'border border-border/50',
                'shadow-2xl shadow-black/20'
              )}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className={cn(
                    'flex-1 bg-transparent outline-none',
                    'text-foreground placeholder:text-muted-foreground'
                  )}
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-muted-foreground">
                  <CommandIcon className="w-3 h-3" />K
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredSections.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No commands found
                  </div>
                ) : (
                  filteredSections.map((section) => (
                    <div key={section.id} className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {section.title}
                      </div>
                      {section.commands.map((command) => {
                        const globalIndex = allCommands.findIndex(
                          (c) => c.id === command.id
                        );
                        const isSelected = globalIndex === selectedIndex;
                        const Icon = command.icon;

                        return (
                          <button
                            key={command.id}
                            onClick={() => {
                              command.action();
                              close();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5',
                              'transition-colors duration-150',
                              isSelected
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted/50'
                            )}
                          >
                            <div
                              className={cn(
                                'p-1.5 rounded-lg transition-colors',
                                isSelected ? 'bg-primary/20' : 'bg-muted'
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm">{command.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {command.description}
                              </p>
                            </div>
                            {command.shortcut && (
                              <kbd className="hidden sm:block px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                                {command.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted">esc</kbd>
                    close
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

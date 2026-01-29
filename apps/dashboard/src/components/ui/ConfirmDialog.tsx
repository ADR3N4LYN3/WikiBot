'use client';

import { Fragment, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantStyles = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    button: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    button: 'bg-yellow-500 text-white hover:bg-yellow-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    button: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card border rounded-xl shadow-xl p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={cn('p-3 rounded-full', styles.iconBg)}>
                  <Icon className={cn('w-6 h-6', styles.iconColor)} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50',
                    styles.button
                  )}
                >
                  {isLoading ? 'Loading...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}

// Hook for easier dialog management
interface UseConfirmDialogOptions {
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialog({ onConfirm }: UseConfirmDialogOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const confirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm]);

  return { isOpen, isLoading, open, close, confirm };
}

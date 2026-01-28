'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';

interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  isPremium?: boolean;
  isCore?: boolean;
  status?: string;
  onToggle: (id: string, enabled: boolean) => void;
  disabled?: boolean;
}

export function ModuleCard({
  id,
  name,
  description,
  icon: Icon,
  enabled,
  isPremium = false,
  isCore = false,
  status,
  onToggle,
  disabled = false,
}: ModuleCardProps) {
  const handleToggle = () => {
    if (!disabled && !isCore) {
      onToggle(id, !enabled);
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <motion.div
          className={cn(
            'p-3 rounded-xl transition-colors duration-300',
            enabled ? 'bg-primary/20' : 'bg-muted/50'
          )}
          animate={{ scale: enabled ? 1 : 0.95 }}
        >
          <Icon
            className={cn(
              'w-6 h-6 transition-colors duration-300',
              enabled ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{name}</h3>
            {isPremium && (
              <Badge variant="premium" glow>
                Premium
              </Badge>
            )}
            {isCore && (
              <Badge variant="success">Core</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {status && (
            <p className="text-xs text-muted-foreground/70">
              Status: {status}
            </p>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={disabled || isCore}
          className={cn(
            'relative w-14 h-7 rounded-full transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary/50',
            enabled
              ? 'bg-gradient-to-r from-primary to-secondary'
              : 'bg-muted',
            (disabled || isCore) && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={`Toggle ${name}`}
        >
          <motion.div
            className={cn(
              'absolute top-1 w-5 h-5 rounded-full',
              'bg-white shadow-lg'
            )}
            animate={{
              left: enabled ? 'calc(100% - 24px)' : '4px',
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
          {/* Glow effect when enabled */}
          {enabled && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/30 blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </button>
      </div>
    </GlassCard>
  );
}

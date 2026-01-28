'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, ArrowRight, ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

interface CategoryStepProps {
  onNext: (category: { name: string; emoji: string }) => void;
  onBack: () => void;
}

const suggestedEmojis = ['📚', '📖', '💡', '🎮', '🛠️', '❓', '📋', '🚀'];

export function CategoryStep({ onNext, onBack }: CategoryStepProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📚');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext({ name: name.trim(), emoji });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-secondary/20 flex items-center justify-center">
          <FolderPlus className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold">Create Your First Category</h2>
        <p className="text-muted-foreground mt-1">
          Categories help organize your wiki articles
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-4">
          <label className="block text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Getting Started, FAQ, Commands"
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'bg-muted/50 border border-border',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'placeholder:text-muted-foreground'
            )}
            autoFocus
          />
        </GlassCard>

        <GlassCard className="p-4">
          <label className="block text-sm font-medium mb-2">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {suggestedEmojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'w-10 h-10 rounded-lg text-xl flex items-center justify-center',
                  'transition-all duration-200',
                  emoji === e
                    ? 'bg-primary/20 ring-2 ring-primary scale-110'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Preview */}
        {name && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <GlassCard className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <span className="font-semibold">{name}</span>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold',
              'transition-all duration-200',
              name.trim()
                ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.form>
    </div>
  );
}

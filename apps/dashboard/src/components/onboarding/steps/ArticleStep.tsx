'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, ArrowLeft, SkipForward } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

interface ArticleStepProps {
  categoryName: string;
  onNext: (article: { title: string; content: string } | null) => void;
  onBack: () => void;
}

export function ArticleStep({ categoryName, onNext, onBack }: ArticleStepProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onNext({ title: title.trim(), content: content.trim() });
    }
  };

  const handleSkip = () => {
    onNext(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center">
          <FileText className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold">Create Your First Article</h2>
        <p className="text-muted-foreground mt-1">
          Add an article to your &quot;{categoryName}&quot; category
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
          <label className="block text-sm font-medium mb-2">Article Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Welcome to our Wiki"
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
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article content here... (Markdown supported)"
            rows={6}
            className={cn(
              'w-full px-4 py-3 rounded-xl resize-none',
              'bg-muted/50 border border-border',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'placeholder:text-muted-foreground'
            )}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Tip: You can use Markdown for formatting
          </p>
        </GlassCard>

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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold',
                'transition-all duration-200',
                title.trim() && content.trim()
                  ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

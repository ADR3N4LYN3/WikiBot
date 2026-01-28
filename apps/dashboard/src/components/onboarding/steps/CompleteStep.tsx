'use client';

import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

import { GradientText } from '@/components/ui/GradientText';
import { GlassCard } from '@/components/ui/GlassCard';

interface CompleteStepProps {
  categoryName: string;
  articleTitle: string | null;
  onComplete: () => void;
}

export function CompleteStep({
  categoryName,
  articleTitle,
  onComplete,
}: CompleteStepProps) {
  return (
    <div className="text-center space-y-8">
      {/* Success Icon with Animation */}
      <motion.div
        className="relative w-24 h-24 mx-auto"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Icon container */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        {/* Sparkles */}
        <motion.div
          className="absolute -top-2 -right-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-2">
          <GradientText>You're All Set!</GradientText>
        </h2>
        <p className="text-muted-foreground">
          Your wiki is ready to go
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div
        className="space-y-3 max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-left">
              <p className="font-medium">Category Created</p>
              <p className="text-sm text-muted-foreground">{categoryName}</p>
            </div>
          </div>
        </GlassCard>

        {articleTitle && (
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-medium">First Article</p>
                <p className="text-sm text-muted-foreground">{articleTitle}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onComplete}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Zap } from 'lucide-react';

import { GradientText } from '@/components/ui/GradientText';
import { GlassCard } from '@/components/ui/GlassCard';

interface WelcomeStepProps {
  onNext: () => void;
}

const features = [
  {
    icon: BookOpen,
    title: 'Create Articles',
    description: 'Build a knowledge base for your community',
  },
  {
    icon: Sparkles,
    title: 'AI Search',
    description: 'Intelligent answers powered by AI',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant search results in Discord',
  },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8">
      {/* Logo */}
      <motion.div
        className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl shadow-primary/30"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <BookOpen className="w-10 h-10 text-white" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome to <GradientText>WikiBot</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Let's set up your knowledge base in just a few steps
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <GlassCard className="p-4 h-full">
              <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {feature.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onNext}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Get Started
      </motion.button>
    </div>
  );
}

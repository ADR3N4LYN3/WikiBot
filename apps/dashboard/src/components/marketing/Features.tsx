'use client';

import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  BarChart3,
  Shield,
  Zap,
  Users,
  Globe,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard } from '../ui/GlassCard';
import { GradientText } from '../ui/GradientText';

const features = [
  {
    icon: Search,
    title: 'Instant Search',
    description:
      'Find any article in seconds with powerful slash commands. Fuzzy search and autocomplete included.',
    gradient: 'from-primary to-secondary',
  },
  {
    icon: BookOpen,
    title: 'Rich Articles',
    description:
      'Create beautiful articles with markdown support, code blocks, images, and more.',
    gradient: 'from-secondary to-accent',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description:
      'Track views, searches, and engagement. Know what your community needs.',
    gradient: 'from-accent to-primary',
  },
  {
    icon: Shield,
    title: 'Permissions',
    description:
      'Control who can create, edit, and delete articles with role-based permissions.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Responses in milliseconds. No loading, no waiting. Just answers.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Users,
    title: 'Multi-Server',
    description:
      'Manage multiple Discord servers from a single dashboard. Sync articles across servers.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Globe,
    title: 'Public Wiki',
    description:
      'Optionally make your wiki public on the web. SEO-friendly and shareable.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description:
      'Coming soon: AI-powered article suggestions and automatic answers.',
    gradient: 'from-purple-500 to-violet-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <br />
            <GradientText>Build a Great Wiki</GradientText>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for Discord communities.
            No coding required.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <GlassCard className="h-full p-6 group">
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl mb-4',
                    'bg-gradient-to-br',
                    feature.gradient,
                    'flex items-center justify-center',
                    'shadow-lg',
                    'group-hover:scale-110 transition-transform duration-300'
                  )}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

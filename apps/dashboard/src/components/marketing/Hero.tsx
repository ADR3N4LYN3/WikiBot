'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Users, BookOpen, Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GradientButton } from '../ui/GradientButton';
import { GradientText } from '../ui/GradientText';
import { Badge } from '../ui/Badge';

const stats = [
  { label: 'Discord Servers', value: '1,000+', icon: Users },
  { label: 'Articles Created', value: '50,000+', icon: BookOpen },
  { label: 'Searches/Month', value: '500K+', icon: Search },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-accent/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="premium" glow className="mb-6">
            <Sparkles className="w-3 h-3" />
            The #1 Wiki Bot for Discord
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl mx-auto leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Build Your
          <br />
          <GradientText>Knowledge Base</GradientText>
          <br />
          on Discord
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Create, organize, and share articles with your community.
          Instant search, beautiful dashboard, and powerful moderation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/invite">
            <GradientButton size="lg" className="group">
              Add to Discord
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </Link>
          <Link href="/login">
            <button
              className={cn(
                'px-8 py-4 rounded-xl text-base font-semibold',
                'bg-muted/50 hover:bg-muted',
                'border border-border hover:border-primary/30',
                'transition-all duration-300',
                'flex items-center gap-2'
              )}
            >
              View Dashboard
            </button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
                <span className="text-3xl sm:text-4xl font-bold">
                  <GradientText>{stat.value}</GradientText>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

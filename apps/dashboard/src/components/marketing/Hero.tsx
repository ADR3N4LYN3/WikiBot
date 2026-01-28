'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Users, BookOpen, Search } from 'lucide-react';
import useSWR from 'swr';

import { cn } from '@/lib/utils';
import { GradientButton } from '../ui/GradientButton';
import { GradientText } from '../ui/GradientText';
import { Badge } from '../ui/Badge';

// Format number with K/M suffix
function formatStat(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K+`;
  }
  return `${num}+`;
}

// Fetcher for public stats
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PublicStats {
  servers: number;
  articles: number;
  searches: number;
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  // Fetch live stats from API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const { data: liveStats } = useSWR<PublicStats>(
    `${apiUrl}/api/public/stats`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  const stats = [
    {
      label: 'Discord Servers',
      value: liveStats ? formatStat(liveStats.servers) : '...',
      icon: Users
    },
    {
      label: 'Articles Created',
      value: liveStats ? formatStat(liveStats.articles) : '...',
      icon: BookOpen
    },
    {
      label: 'Searches/Month',
      value: liveStats ? formatStat(liveStats.searches) : '...',
      icon: Search
    },
  ];

  // Simplified animations for reduced motion or mobile
  const orbAnimation = prefersReducedMotion
    ? {}
    : {
        animate: {
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        },
        transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' as const },
      };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Floating orbs - hidden on mobile for performance, reduced on tablet */}
      <motion.div
        className="hidden md:block absolute top-1/4 left-1/4 w-64 lg:w-96 h-64 lg:h-96 rounded-full bg-primary/20 blur-2xl lg:blur-3xl"
        {...orbAnimation}
      />
      <motion.div
        className="hidden md:block absolute bottom-1/4 right-1/4 w-80 lg:w-[500px] h-80 lg:h-[500px] rounded-full bg-secondary/20 blur-2xl lg:blur-3xl"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, -30, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <motion.div
        className="hidden lg:block absolute top-1/2 right-1/3 w-48 lg:w-64 h-48 lg:h-64 rounded-full bg-accent/20 blur-2xl lg:blur-3xl"
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 20, 0],
                y: [0, 40, 0],
              }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' as const }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="premium" glow className="mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3" />
            The #1 Wiki Bot for Discord
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold max-w-4xl mx-auto leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Build Your
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          <GradientText>Knowledge Base</GradientText>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          on Discord
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Create, organize, and share articles with your community.
          Instant search, beautiful dashboard, and powerful moderation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/invite" className="w-full sm:w-auto">
            <GradientButton size="lg" className="group w-full sm:w-auto">
              Add to Discord
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </GradientButton>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <button
              className={cn(
                'w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold',
                'bg-muted/50 hover:bg-muted',
                'border border-border hover:border-primary/30',
                'transition-all duration-300',
                'flex items-center justify-center gap-2'
              )}
            >
              View Dashboard
            </button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4"
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
                <stat.icon className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  <GradientText>{stat.value}</GradientText>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

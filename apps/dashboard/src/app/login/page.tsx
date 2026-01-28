'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn('discord', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated background */}
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Floating orbs - hidden on mobile for performance */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="hidden md:block absolute top-1/4 left-1/4 w-48 lg:w-64 h-48 lg:h-64 rounded-full bg-primary/20 blur-2xl lg:blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="hidden md:block absolute bottom-1/4 right-1/4 w-64 lg:w-96 h-64 lg:h-96 rounded-full bg-secondary/20 blur-2xl lg:blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="hidden lg:block absolute top-1/2 right-1/3 w-36 lg:w-48 h-36 lg:h-48 rounded-full bg-accent/20 blur-2xl lg:blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-md p-4 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and title */}
        <motion.div
          className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className={cn(
              'mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
              'bg-gradient-to-br from-primary via-secondary to-accent',
              'flex items-center justify-center',
              'shadow-2xl shadow-primary/30'
            )}
            whileHover={{ scale: 1.05, rotate: 5 }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    boxShadow: [
                      '0 0 20px rgba(var(--primary), 0.3)',
                      '0 0 40px rgba(var(--primary), 0.5)',
                      '0 0 20px rgba(var(--primary), 0.3)',
                    ],
                  }
            }
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <GradientText>WikiBot</GradientText>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Manage your Discord knowledge base
            </p>
          </div>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 sm:p-8">
            <div className="space-y-5 sm:space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">Welcome back</h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sign in with Discord to access your dashboard
                </p>
              </div>

              {/* Discord login button */}
              <motion.button
                onClick={handleLogin}
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-3',
                  'px-4 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base',
                  'bg-[#5865F2] text-white',
                  'hover:bg-[#4752C4]',
                  'shadow-lg shadow-[#5865F2]/25',
                  'hover:shadow-xl hover:shadow-[#5865F2]/40',
                  'transition-all duration-300',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'group'
                )}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                )}
                <span className="group-hover:translate-x-0.5 transition-transform">
                  {isLoading ? 'Signing in...' : 'Sign in with Discord'}
                </span>
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">
                    Secure authentication
                  </span>
                </div>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>No password needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Instant setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Server sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Secure & private</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-4 sm:mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

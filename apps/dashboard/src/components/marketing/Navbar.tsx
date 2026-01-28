'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '../ThemeToggle';
import { GradientButton } from '../ui/GradientButton';
import { GradientText } from '../ui/GradientText';

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'FAQ', href: '/#faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-300',
          scrolled
            ? 'glass border-b border-border/50 py-3'
            : 'bg-transparent py-5'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-xl',
                  'bg-gradient-to-br from-primary via-secondary to-accent',
                  'flex items-center justify-center',
                  'shadow-lg shadow-primary/25',
                  'group-hover:shadow-xl group-hover:shadow-primary/40',
                  'transition-shadow duration-300'
                )}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-bold text-xl">
                <GradientText>WikiBot</GradientText>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors duration-300',
                    'relative group'
                  )}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <Link href="/login" className="hidden sm:block">
                <button
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors duration-300'
                  )}
                >
                  Sign in
                </button>
              </Link>

              <Link href="/invite" className="hidden sm:block">
                <GradientButton size="sm">Add to Discord</GradientButton>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute top-20 left-4 right-4 glass rounded-2xl p-6 border border-border/50"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-border/50" />
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-lg font-medium hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
                <Link href="/invite" onClick={() => setMobileMenuOpen(false)}>
                  <GradientButton className="w-full">
                    Add to Discord
                  </GradientButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

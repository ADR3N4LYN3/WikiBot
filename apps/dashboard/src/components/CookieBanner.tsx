'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/GradientButton';

const COOKIE_CONSENT_KEY = 'wikibot-cookie-consent';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed bottom-4 left-4 right-4 z-50',
            'md:left-auto md:right-6 md:bottom-6 md:max-w-md'
          )}
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl',
              'bg-card/90 backdrop-blur-xl',
              'border border-border/50',
              'shadow-2xl shadow-black/20 dark:shadow-primary/10',
              'p-4 sm:p-5'
            )}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />

            {/* Close button */}
            <button
              onClick={handleDecline}
              className={cn(
                'absolute top-3 right-3',
                'p-1.5 rounded-lg',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-muted/50 transition-colors'
              )}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-4 pr-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    We use cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to improve your experience and analyze site usage.{' '}
                    <Link
                      href="/cookies"
                      className="text-primary hover:underline"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GradientButton
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 sm:flex-none"
                >
                  Accept all
                </GradientButton>
                <button
                  onClick={handleDecline}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-xl',
                    'text-muted-foreground hover:text-foreground',
                    'hover:bg-muted/50 transition-colors'
                  )}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

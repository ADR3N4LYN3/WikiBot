'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GlassCard } from '../ui/GlassCard';
import { GradientButton } from '../ui/GradientButton';
import { GradientText } from '../ui/GradientText';
import { Badge } from '../ui/Badge';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for getting started',
    features: [
      'Up to 25 articles',
      '3 categories',
      'Basic search',
      '500 searches/month',
      'Community support',
    ],
    cta: 'Get started',
    href: '/invite',
    popular: false,
  },
  {
    name: 'Starter',
    price: '9',
    description: 'For active communities',
    features: [
      'Up to 200 articles',
      '10 categories',
      'AI-powered search',
      '5,000 searches/month',
      'Export & import',
      'Email support',
    ],
    cta: 'Start free trial',
    href: '/dashboard/settings/billing',
    popular: false,
  },
  {
    name: 'Pro',
    price: '25',
    description: 'For large communities',
    features: [
      'Unlimited articles',
      'Unlimited categories',
      'AI search + RAG answers',
      'Custom branding',
      'Advanced analytics',
      'API access',
      'Priority support',
    ],
    cta: 'Upgrade now',
    href: '/dashboard/settings/billing',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    description: 'For organizations',
    features: [
      'Everything in Pro',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Audit logs',
    ],
    cta: 'Contact sales',
    href: 'mailto:contact@wikibot-app.xyz',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Simple, transparent
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            <GradientText>pricing</GradientText>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(plan.popular && 'md:-mt-4 md:mb-4')}
            >
              <GlassCard
                className={cn(
                  'h-full p-5 sm:p-8 relative',
                  plan.popular && 'border-primary/50 shadow-xl shadow-primary/10'
                )}
                hover={!plan.popular}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="premium" glow className="px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap">
                      <Crown className="w-3 h-3" />
                      Most popular
                    </Badge>
                  </div>
                )}

                {/* Plan header */}
                <div className={cn("text-center mb-6 sm:mb-8", plan.popular && "pt-4")}>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground text-sm sm:text-base">$</span>
                    )}
                    <span className="text-3xl sm:text-4xl font-bold">
                      {plan.popular ? (
                        <GradientText>{plan.price}</GradientText>
                      ) : (
                        plan.price
                      )}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground text-sm sm:text-base">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 sm:gap-3">
                      <Check
                        className={cn(
                          'w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0',
                          plan.popular ? 'text-primary' : 'text-green-500'
                        )}
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.href} className="block">
                  {plan.popular ? (
                    <GradientButton className="w-full text-sm sm:text-base">
                      {plan.cta}
                    </GradientButton>
                  ) : (
                    <button
                      className={cn(
                        'w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base',
                        'bg-muted/50 hover:bg-muted',
                        'border border-border hover:border-primary/30',
                        'transition-all duration-300'
                      )}
                    >
                      {plan.cta}
                    </button>
                  )}
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

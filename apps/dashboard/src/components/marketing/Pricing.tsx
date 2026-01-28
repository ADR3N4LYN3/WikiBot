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
    description: 'Perfect for small communities',
    features: [
      'Up to 50 articles',
      '1 Discord server',
      'Basic search',
      'Community support',
      '7-day analytics',
    ],
    cta: 'Get Started',
    href: '/invite',
    popular: false,
  },
  {
    name: 'Premium',
    price: '9.99',
    description: 'For growing communities',
    features: [
      'Unlimited articles',
      'Unlimited servers',
      'Advanced search & filters',
      'Priority support',
      '90-day analytics',
      'Public web wiki',
      'Custom branding',
      'API access',
    ],
    cta: 'Upgrade Now',
    href: '/dashboard/settings/billing',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Premium',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'SSO / SAML',
      'Audit logs',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    href: 'mailto:contact@wikibot-app.xyz',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-30" />

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
            Simple, Transparent
            <br />
            <GradientText>Pricing</GradientText>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  'h-full p-8 relative',
                  plan.popular && 'border-primary/50 shadow-xl shadow-primary/10'
                )}
                hover={!plan.popular}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="premium" glow className="px-4 py-1.5">
                      <Crown className="w-3 h-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground">$</span>
                    )}
                    <span className="text-4xl font-bold">
                      {plan.popular ? (
                        <GradientText>{plan.price}</GradientText>
                      ) : (
                        plan.price
                      )}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={cn(
                          'w-5 h-5 mt-0.5 flex-shrink-0',
                          plan.popular ? 'text-primary' : 'text-green-500'
                        )}
                      />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.href} className="block">
                  {plan.popular ? (
                    <GradientButton className="w-full">
                      {plan.cta}
                    </GradientButton>
                  ) : (
                    <button
                      className={cn(
                        'w-full px-6 py-3 rounded-xl font-semibold',
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

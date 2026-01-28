'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  CreditCard,
  Check,
  Crown,
  Zap,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { subscriptionsApi } from '@/lib/api';

interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'pro';
  isActive: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

interface UsageStats {
  articles: { current: number; max: number; percentage: number };
  searches: { current: number; max: number; percentage: number };
  tier: 'free' | 'premium' | 'pro';
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const { data: status } = useSWR<SubscriptionStatus>('subscription-status', () =>
    subscriptionsApi.getStatus().then((res) => res.data)
  );

  const { data: usage } = useSWR<UsageStats>('subscription-usage', () =>
    subscriptionsApi.getUsage().then((res) => res.data)
  );

  const { data: plansData } = useSWR<{ plans: Plan[] }>('subscription-plans', () =>
    subscriptionsApi.getPlans().then((res) => res.data)
  );

  const plans = plansData?.plans || [];

  const handleUpgrade = async (tier: 'premium' | 'pro') => {
    setLoading(tier);
    try {
      const response = await subscriptionsApi.createCheckout({
        tier,
        successUrl: `${window.location.origin}/dashboard/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/settings/billing?canceled=true`,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to create checkout session');
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading('portal');
    try {
      const response = await subscriptionsApi.createPortal({
        returnUrl: `${window.location.origin}/dashboard/settings/billing`,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to open customer portal');
      setLoading(null);
    }
  };

  // Check for success/canceled query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('Subscription activated successfully!');
      window.history.replaceState({}, '', '/dashboard/settings/billing');
    } else if (urlParams.get('canceled') === 'true') {
      toast('Checkout was canceled', { icon: 'info' });
      window.history.replaceState({}, '', '/dashboard/settings/billing');
    }
  }, []);

  const currentTier = status?.tier || 'free';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-card p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {currentTier === 'pro' ? (
              <Crown className="w-8 h-8 text-yellow-500" />
            ) : currentTier === 'premium' ? (
              <Zap className="w-8 h-8 text-primary" />
            ) : (
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            )}
            <div>
              <h2 className="text-lg font-semibold capitalize">{currentTier} Plan</h2>
              {status?.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  {status.cancelAtPeriodEnd
                    ? 'Cancels on'
                    : 'Renews on'}{' '}
                  {new Date(status.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {currentTier !== 'free' && (
            <button
              onClick={handleManageSubscription}
              disabled={loading === 'portal'}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
            >
              {loading === 'portal' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Manage Subscription
            </button>
          )}
        </div>

        {status?.cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 p-4 bg-yellow-500/10 text-yellow-600 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">
              Your subscription will be canceled at the end of the billing period.
            </p>
          </div>
        )}

        {/* Usage Stats */}
        {usage && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Articles</span>
                <span className="text-sm text-muted-foreground">
                  {usage.articles.current} / {usage.articles.max === -1 ? 'Unlimited' : usage.articles.max}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${usage.articles.max === -1 ? 0 : Math.min(usage.articles.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Searches this month</span>
                <span className="text-sm text-muted-foreground">
                  {usage.searches.current} / {usage.searches.max === -1 ? 'Unlimited' : usage.searches.max}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${usage.searches.max === -1 ? 0 : Math.min(usage.searches.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentTier;
          const isUpgrade =
            (currentTier === 'free' && (plan.id === 'premium' || plan.id === 'pro')) ||
            (currentTier === 'premium' && plan.id === 'pro');

          return (
            <div
              key={plan.id}
              className={`relative bg-card p-6 rounded-xl border transition-all ${
                isCurrentPlan
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'hover:border-primary/50'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Current Plan
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Free' : `${plan.price}${plan.currency === 'EUR' ? '€' : '$'}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : isUpgrade ? (
                <button
                  onClick={() => handleUpgrade(plan.id as 'premium' | 'pro')}
                  disabled={loading === plan.id}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Upgrade
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full px-4 py-2 border rounded-lg text-muted-foreground cursor-not-allowed"
                >
                  Downgrade via portal
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="bg-card p-6 rounded-xl border space-y-4">
        <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Can I change plans at any time?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Yes, you can upgrade or downgrade your plan at any time. When upgrading,
              you'll be charged the prorated amount for the remainder of your billing period.
            </p>
          </div>

          <div>
            <h3 className="font-medium">What happens when I cancel?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your subscription will remain active until the end of the current billing period.
              After that, you'll be moved to the Free plan but won't lose any data.
            </p>
          </div>

          <div>
            <h3 className="font-medium">What payment methods are accepted?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We accept all major credit cards (Visa, Mastercard, American Express) and
              support various local payment methods through Stripe.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Is there a refund policy?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We offer a 14-day money-back guarantee. If you're not satisfied with the
              service, contact us and we'll process a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

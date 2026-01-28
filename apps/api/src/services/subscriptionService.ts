import { prisma } from '@wikibot/database';
import { TIER_LIMITS, SubscriptionTier } from '@wikibot/shared';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Price IDs from Stripe Dashboard
const PRICE_IDS = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
};

/**
 * Create or retrieve Stripe customer for a server
 */
export async function getOrCreateCustomer(
  serverId: string,
  serverName: string,
  email?: string
): Promise<string> {
  // Check if customer already exists
  const settings = await prisma.serverSettings.findUnique({
    where: { serverId },
    select: { stripeCustomerId: true },
  });

  if (settings?.stripeCustomerId) {
    return settings.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    name: serverName,
    email: email || undefined,
    metadata: {
      serverId,
    },
  });

  // Save customer ID to database
  await prisma.serverSettings.upsert({
    where: { serverId },
    update: { stripeCustomerId: customer.id },
    create: {
      serverId,
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  serverId: string,
  serverName: string,
  tier: 'premium' | 'pro',
  successUrl: string,
  cancelUrl: string,
  email?: string
): Promise<string> {
  const customerId = await getOrCreateCustomer(serverId, serverName, email);
  const priceId = PRICE_IDS[tier];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      serverId,
      tier,
    },
    subscription_data: {
      metadata: {
        serverId,
        tier,
      },
    },
  });

  return session.url || '';
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createPortalSession(
  serverId: string,
  returnUrl: string
): Promise<string> {
  const settings = await prisma.serverSettings.findUnique({
    where: { serverId },
    select: { stripeCustomerId: true },
  });

  if (!settings?.stripeCustomerId) {
    throw new Error('No Stripe customer found for this server');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: settings.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Get subscription status for a server
 */
export async function getSubscriptionStatus(serverId: string): Promise<{
  tier: SubscriptionTier;
  isActive: boolean;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}> {
  const settings = await prisma.serverSettings.findUnique({
    where: { serverId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { premiumTier: true },
  });

  if (!settings?.stripeSubscriptionId) {
    return {
      tier: (server?.premiumTier as SubscriptionTier) || 'free',
      isActive: server?.premiumTier !== 'free',
    };
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(
      settings.stripeSubscriptionId
    );

    return {
      tier: (server?.premiumTier as SubscriptionTier) || 'free',
      isActive: subscription.status === 'active',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error('Failed to retrieve subscription:', error);
    return {
      tier: (server?.premiumTier as SubscriptionTier) || 'free',
      isActive: false,
    };
  }
}

/**
 * Cancel subscription for a server
 */
export async function cancelSubscription(
  serverId: string,
  immediate: boolean = false
): Promise<void> {
  const settings = await prisma.serverSettings.findUnique({
    where: { serverId },
    select: { stripeSubscriptionId: true },
  });

  if (!settings?.stripeSubscriptionId) {
    throw new Error('No active subscription found');
  }

  if (immediate) {
    await stripe.subscriptions.cancel(settings.stripeSubscriptionId);
    await updateServerTier(serverId, 'free');
  } else {
    await stripe.subscriptions.update(settings.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Update server tier after subscription change
 */
export async function updateServerTier(
  serverId: string,
  tier: SubscriptionTier,
  subscriptionId?: string
): Promise<void> {
  const limits = TIER_LIMITS[tier];

  await prisma.$transaction([
    prisma.server.update({
      where: { id: serverId },
      data: {
        premium: tier !== 'free',
        premiumTier: tier,
      },
    }),
    prisma.serverSettings.upsert({
      where: { serverId },
      update: {
        maxArticles: limits.maxArticles,
        maxSearchesPerMonth: limits.maxSearchesPerMonth,
        aiSearchEnabled: limits.aiSearchEnabled,
        stripeSubscriptionId: subscriptionId,
      },
      create: {
        serverId,
        maxArticles: limits.maxArticles,
        maxSearchesPerMonth: limits.maxSearchesPerMonth,
        aiSearchEnabled: limits.aiSearchEnabled,
        stripeSubscriptionId: subscriptionId,
      },
    }),
  ]);

  console.log(`✅ Updated server ${serverId} to tier: ${tier}`);
}

/**
 * Check if server has reached article limit
 */
export async function checkArticleLimit(serverId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number;
}> {
  const [articleCount, settings] = await Promise.all([
    prisma.article.count({
      where: { serverId, published: true },
    }),
    prisma.serverSettings.findUnique({
      where: { serverId },
      select: { maxArticles: true },
    }),
  ]);

  const maxArticles = settings?.maxArticles || TIER_LIMITS.free.maxArticles;

  return {
    allowed: articleCount < maxArticles,
    current: articleCount,
    max: maxArticles,
  };
}

/**
 * Check if server has reached search limit for the month
 */
export async function checkSearchLimit(serverId: string): Promise<{
  allowed: boolean;
  current: number;
  max: number;
}> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [searchCount, settings] = await Promise.all([
    prisma.searchLog.count({
      where: {
        serverId,
        timestamp: { gte: startOfMonth },
      },
    }),
    prisma.serverSettings.findUnique({
      where: { serverId },
      select: { maxSearchesPerMonth: true },
    }),
  ]);

  const maxSearches =
    settings?.maxSearchesPerMonth || TIER_LIMITS.free.maxSearchesPerMonth;

  return {
    allowed: searchCount < maxSearches,
    current: searchCount,
    max: maxSearches,
  };
}

/**
 * Get usage statistics for a server
 */
export async function getUsageStats(serverId: string): Promise<{
  articles: { current: number; max: number; percentage: number };
  searches: { current: number; max: number; percentage: number };
  tier: SubscriptionTier;
}> {
  const [articleLimit, searchLimit, server] = await Promise.all([
    checkArticleLimit(serverId),
    checkSearchLimit(serverId),
    prisma.server.findUnique({
      where: { id: serverId },
      select: { premiumTier: true },
    }),
  ]);

  return {
    articles: {
      current: articleLimit.current,
      max: articleLimit.max,
      percentage: Math.round((articleLimit.current / articleLimit.max) * 100),
    },
    searches: {
      current: searchLimit.current,
      max: searchLimit.max,
      percentage: Math.round((searchLimit.current / searchLimit.max) * 100),
    },
    tier: (server?.premiumTier as SubscriptionTier) || 'free',
  };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Handle Stripe webhook event
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const serverId = session.metadata?.serverId;
      const tier = session.metadata?.tier as 'premium' | 'pro';

      if (serverId && tier) {
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        await updateServerTier(serverId, tier, subscriptionId);
        console.log(`✅ Subscription activated for server ${serverId}: ${tier}`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const serverId = subscription.metadata?.serverId;

      if (serverId) {
        if (subscription.status === 'active') {
          const tier = subscription.metadata?.tier as SubscriptionTier;
          if (tier) {
            await updateServerTier(serverId, tier, subscription.id);
          }
        } else if (
          subscription.status === 'canceled' ||
          subscription.status === 'unpaid'
        ) {
          await updateServerTier(serverId, 'free');
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const serverId = subscription.metadata?.serverId;

      if (serverId) {
        await updateServerTier(serverId, 'free');
        console.log(`⚠️ Subscription canceled for server ${serverId}`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;

      if (customerId) {
        const settings = await prisma.serverSettings.findFirst({
          where: { stripeCustomerId: customerId },
          select: { serverId: true },
        });

        if (settings) {
          console.log(
            `⚠️ Payment failed for server ${settings.serverId}, subscription may be at risk`
          );
          // Optionally: Send notification to server admins
        }
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}

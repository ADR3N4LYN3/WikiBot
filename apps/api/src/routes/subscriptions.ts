import { prisma } from '@wikibot/database';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { extractServerId } from '../middleware/auth';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  cancelSubscription,
  getUsageStats,
} from '../services/subscriptionService';

export const subscriptionsRouter = Router();

// Apply serverId extraction to all routes
subscriptionsRouter.use(extractServerId);

// Validation schema
const checkoutSchema = z.object({
  tier: z.enum(['premium', 'pro']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  email: z.string().email().optional(),
});

/**
 * Create checkout session for subscription
 * POST /api/subscriptions/checkout
 */
subscriptionsRouter.post(
  '/checkout',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: parsed.error.errors,
        });
      }

      const { tier, successUrl, cancelUrl, email } = parsed.data;

      // Get server name
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { name: true },
      });

      if (!server) {
        return res.status(404).json({ error: 'Server not found' });
      }

      const checkoutUrl = await createCheckoutSession(
        serverId,
        server.name,
        tier,
        successUrl,
        cancelUrl,
        email
      );

      res.json({ url: checkoutUrl });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create customer portal session
 * POST /api/subscriptions/portal
 */
subscriptionsRouter.post(
  '/portal',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const { returnUrl } = req.body;
      if (!returnUrl || typeof returnUrl !== 'string') {
        return res.status(400).json({ error: 'Return URL required' });
      }

      const portalUrl = await createPortalSession(serverId, returnUrl);
      res.json({ url: portalUrl });
    } catch (error) {
      if (error instanceof Error && error.message.includes('No Stripe customer')) {
        return res.status(404).json({ error: 'No subscription found' });
      }
      next(error);
    }
  }
);

/**
 * Get subscription status
 * GET /api/subscriptions/status
 */
subscriptionsRouter.get(
  '/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const status = await getSubscriptionStatus(serverId);
      res.json(status);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get usage statistics
 * GET /api/subscriptions/usage
 */
subscriptionsRouter.get(
  '/usage',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const usage = await getUsageStats(serverId);
      res.json(usage);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Cancel subscription
 * POST /api/subscriptions/cancel
 */
subscriptionsRouter.post(
  '/cancel',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const { immediate } = req.body;

      await cancelSubscription(serverId, immediate === true);

      res.json({
        success: true,
        message: immediate
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at end of billing period',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('No active subscription')) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      next(error);
    }
  }
);

/**
 * Get available plans
 * GET /api/subscriptions/plans
 */
subscriptionsRouter.get('/plans', async (_req: Request, res: Response) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'EUR',
        interval: 'month',
        features: [
          '50 articles',
          '1,000 searches/month',
          '3 categories',
          'Basic search',
        ],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 4.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Unlimited articles',
          '10,000 searches/month',
          'Unlimited categories',
          'AI-powered search',
          'Custom branding',
          'Advanced analytics',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        currency: 'EUR',
        interval: 'month',
        features: [
          'Everything in Premium',
          'Unlimited searches',
          'API access',
          'Multi-server sync',
          'Priority support',
          'Custom integrations',
        ],
      },
    ],
  });
});

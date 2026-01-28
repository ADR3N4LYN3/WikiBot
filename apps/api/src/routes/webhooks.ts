import { Router, Request, Response, raw } from 'express';

import {
  verifyWebhookSignature,
  handleWebhookEvent,
} from '../services/subscriptionService';

export const webhooksRouter = Router();

/**
 * Stripe webhook endpoint
 * POST /webhooks/stripe
 *
 * Note: This endpoint uses raw body parser for signature verification
 */
webhooksRouter.post(
  '/stripe',
  raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      console.error('No Stripe signature found in request');
      return res.status(400).json({ error: 'Missing signature' });
    }

    try {
      // Verify webhook signature
      const event = verifyWebhookSignature(req.body, signature);

      // Handle the event
      await handleWebhookEvent(event);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);

      if (error instanceof Error) {
        if (error.message.includes('signature')) {
          return res.status(400).json({ error: 'Invalid signature' });
        }
      }

      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

/**
 * Discord webhook for bot events (optional)
 * POST /webhooks/discord
 */
webhooksRouter.post('/discord', async (_req: Request, res: Response) => {
  // Handle Discord interaction webhooks if needed
  // This can be used for serverless deployments
  res.json({ type: 1 }); // ACK
});

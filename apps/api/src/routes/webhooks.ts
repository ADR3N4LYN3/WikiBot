import { Router } from 'express';

export const webhooksRouter = Router();

// Stripe webhook handler (for premium subscriptions)
webhooksRouter.post('/stripe', async (req, res, next) => {
  try {
    // TODO: Verify Stripe signature
    // TODO: Handle subscription events (checkout.session.completed, customer.subscription.updated, etc.)

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

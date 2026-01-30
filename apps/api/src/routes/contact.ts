import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const contactRouter = Router();

// Wrapper to handle async middleware with proper typing
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
  category: z.enum(['general', 'support', 'billing', 'partnership', 'other']).default('general'),
});

// Rate limiting map (simple in-memory, use Redis in production)
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3; // Max 3 submissions per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = contactRateLimit.get(identifier);

  if (!entry || now > entry.resetAt) {
    contactRateLimit.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Optional auth - logged in users get better rate limits
contactRouter.use(optionalAuth as (req: Request, res: Response, next: NextFunction) => void);

// Submit contact form
contactRouter.post('/', asyncHandler(async (req, res, _next) => {
  // Rate limit by IP or user ID
  const identifier = req.user?.id || req.ip || 'unknown';

  if (!checkRateLimit(identifier)) {
    throw new AppError(429, 'Too Many Requests', 'You have submitted too many messages. Please try again later.');
  }

  // Validate input
  const input = contactSchema.parse(req.body);

  // In production, you would:
  // 1. Save to database
  // 2. Send email notification to support team
  // 3. Send confirmation email to user
  // 4. Integrate with ticketing system (e.g., Zendesk, Freshdesk)

  // For now, log and return success
  console.log('📧 Contact form submission:', {
    ...input,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  });

  // TODO: Implement email sending
  // await sendEmail({
  //   to: process.env.SUPPORT_EMAIL,
  //   subject: `[${input.category}] ${input.subject}`,
  //   body: `From: ${input.name} <${input.email}>\n\n${input.message}`,
  // });

  res.status(201).json({
    success: true,
    message: 'Your message has been received. We will get back to you within 24-48 hours.',
    ticketId: `WB-${Date.now().toString(36).toUpperCase()}`,
  });
}));

// Get contact form categories
contactRouter.get('/categories', (_req, res) => {
  res.json([
    { id: 'general', label: 'General Inquiry', description: 'Questions about WikiBot' },
    { id: 'support', label: 'Technical Support', description: 'Issues with bot or dashboard' },
    { id: 'billing', label: 'Billing & Subscriptions', description: 'Payment or plan questions' },
    { id: 'partnership', label: 'Partnership', description: 'Business or integration proposals' },
    { id: 'other', label: 'Other', description: 'Anything else' },
  ]);
});

import { RATE_LIMITS } from '@wikibot/shared';
import rateLimit from 'express-rate-limit';


// General rate limiter for all routes
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMITS.REQUESTS_PER_MINUTE_IP,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for search endpoints
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMITS.SEARCH_REQUESTS_PER_MINUTE,
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the search rate limit. Please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

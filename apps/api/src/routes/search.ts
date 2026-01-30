import { searchQuerySchema } from '@wikibot/shared';
import { Router } from 'express';

import { requireAuth, requireServerId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { searchRateLimiter } from '../middleware/rateLimiter';
import * as searchService from '../services/searchService';
import * as subscriptionService from '../services/subscriptionService';

export const searchRouter = Router();

// Apply middleware
searchRouter.use(requireAuth);
searchRouter.use(requireServerId);
searchRouter.use(searchRateLimiter);

// Search articles
searchRouter.get('/', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const userId = req.user?.id || 'anonymous';

    // Check search limit for subscription tier
    const limit = await subscriptionService.checkSearchLimit(serverId);
    if (!limit.allowed && limit.max !== -1) {
      throw new AppError(429, 'Monthly search limit reached', {
        current: limit.current,
        max: limit.max,
        message: `You have reached your limit of ${limit.max} searches this month. Upgrade for more.`,
      });
    }

    const input = searchQuerySchema.parse({
      query: req.query.q || req.query.query,
      type: req.query.type || 'fulltext',
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    });

    const results = await searchService.searchArticles({
      ...input,
      serverId,
      userId,
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

import { Router } from 'express';

import { searchQuerySchema } from '@wikibot/shared';

import { requireAuth, requireServerId } from '../middleware/auth';
import { searchRateLimiter } from '../middleware/rateLimiter';
import * as searchService from '../services/searchService';

export const searchRouter = Router();

// Apply middleware
searchRouter.use(requireAuth);
searchRouter.use(requireServerId);
searchRouter.use(searchRateLimiter);

// Search articles
searchRouter.get('/', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;
    const userId = (req as any).user?.id || 'anonymous';

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

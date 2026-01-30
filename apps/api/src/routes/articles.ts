import { articleCreateSchema, articleUpdateSchema } from '@wikibot/shared';
import { Router, Request, Response, NextFunction } from 'express';

import { requireAuth, requireServerId, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import * as articleService from '../services/articleService';

export const articlesRouter = Router();

// Wrapper to handle async middleware with proper typing
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

// Apply auth and serverId middleware to all routes
articlesRouter.use(requireAuth as (req: Request, res: Response, next: NextFunction) => void);
articlesRouter.use(requireServerId);

// Get all articles for a server
articlesRouter.get('/', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { categoryId, published, limit = 20, offset = 0 } = req.query;

    const articles = await articleService.getArticles({
      serverId,
      categoryId: categoryId as string,
      published: published === 'true' ? true : undefined,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json(articles);
  } catch (error) {
    next(error);
  }
});

// Get article by slug
articlesRouter.get('/:slug', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;

    const article = await articleService.getArticleBySlug(serverId, slug);

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// Create article
articlesRouter.post('/', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  // Require authenticated user (not bot) for creating articles
  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required to create articles');
  }

  const input = articleCreateSchema.parse(req.body);

  const article = await articleService.createArticle({
    serverId,
    authorId: user.id,
    ...input,
  });

  res.status(201).json(article);
}));

// Update article
articlesRouter.put('/:slug', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const { slug } = req.params;
  const user = req.user;

  // Require authenticated user (not bot) for updating articles
  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required to update articles');
  }

  const input = articleUpdateSchema.parse(req.body);

  const article = await articleService.updateArticle(serverId, slug, user.id, input);

  res.json(article);
}));

// Delete article
articlesRouter.delete('/:slug', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;

    await articleService.deleteArticle(serverId, slug);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Increment article views
articlesRouter.post('/:slug/view', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;

    await articleService.incrementViews(serverId, slug);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Vote on article helpfulness
articlesRouter.post('/:slug/vote', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;
    const { helpful } = req.body;

    await articleService.voteArticle(serverId, slug, helpful);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

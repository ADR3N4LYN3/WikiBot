import { articleCreateSchema, articleUpdateSchema } from '@wikibot/shared';
import { Router } from 'express';


import { requireAuth, requireServerId } from '../middleware/auth';
import * as articleService from '../services/articleService';

export const articlesRouter = Router();

// Apply auth and serverId middleware to all routes
articlesRouter.use(requireAuth);
articlesRouter.use(requireServerId);

// Get all articles for a server
articlesRouter.get('/', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;
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
    const serverId = (req as any).serverId;
    const { slug } = req.params;

    const article = await articleService.getArticleBySlug(serverId, slug);

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// Create article
articlesRouter.post('/', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;
    const userId = (req as any).user?.id || 'system'; // TODO: Get from JWT

    const input = articleCreateSchema.parse(req.body);

    const article = await articleService.createArticle({
      serverId,
      authorId: userId,
      ...input,
    });

    res.status(201).json(article);
  } catch (error) {
    next(error);
  }
});

// Update article
articlesRouter.put('/:slug', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;
    const { slug } = req.params;
    const userId = (req as any).user?.id || 'system';

    const input = articleUpdateSchema.parse(req.body);

    const article = await articleService.updateArticle(serverId, slug, userId, input);

    res.json(article);
  } catch (error) {
    next(error);
  }
});

// Delete article
articlesRouter.delete('/:slug', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;
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
    const serverId = (req as any).serverId;
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
    const serverId = (req as any).serverId;
    const { slug } = req.params;
    const { helpful } = req.body;

    await articleService.voteArticle(serverId, slug, helpful);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

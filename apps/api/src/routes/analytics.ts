import { Router } from 'express';

import { requireAuth, requireServerId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import * as analyticsService from '../services/analyticsService';
import * as articleAnalyticsService from '../services/articleAnalyticsService';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.use(requireServerId);

// Get overview stats
analyticsRouter.get('/overview', async (req, res, next) => {
  try {
    const serverId = req.serverId!;

    const overview = await analyticsService.getOverview(serverId);

    res.json(overview);
  } catch (error) {
    next(error);
  }
});

// Get top articles
analyticsRouter.get('/top-articles', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { limit = 10 } = req.query;

    const topArticles = await analyticsService.getTopArticles(serverId, Number(limit));

    res.json(topArticles);
  } catch (error) {
    next(error);
  }
});

// Get top searches
analyticsRouter.get('/top-searches', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { limit = 10 } = req.query;

    const topSearches = await analyticsService.getTopSearches(serverId, Number(limit));

    res.json(topSearches);
  } catch (error) {
    next(error);
  }
});

// Get activity data
analyticsRouter.get('/activity', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { days = 30 } = req.query;

    const activity = await analyticsService.getActivity(serverId, Number(days));

    res.json(activity);
  } catch (error) {
    next(error);
  }
});

// Get analytics for a specific article
analyticsRouter.get('/articles/:slug', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;
    const { days = 30 } = req.query;

    const analytics = await articleAnalyticsService.getArticleAnalytics(
      serverId,
      slug,
      Number(days)
    );

    if (!analytics) {
      throw new AppError(404, 'Article not found');
    }

    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// Get server-wide analytics summary
analyticsRouter.get('/summary', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { days = 30 } = req.query;

    const summary = await articleAnalyticsService.getServerAnalytics(
      serverId,
      Number(days)
    );

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

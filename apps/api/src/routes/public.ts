import { prisma } from '@wikibot/database';
import { Router } from 'express';

export const publicRouter = Router();

/**
 * GET /api/public/stats
 * Public endpoint (no auth required) for landing page statistics
 */
publicRouter.get('/stats', async (_req, res) => {
  try {
    // Get current month's date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for performance
    const [servers, articles, searchesThisMonth] = await Promise.all([
      prisma.server.count(),
      prisma.article.count({
        where: { published: true },
      }),
      prisma.searchLog.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    res.json({
      servers,
      articles,
      searches: searchesThisMonth,
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({
      servers: 0,
      articles: 0,
      searches: 0,
    });
  }
});

import { prisma } from '@wikibot/database';
import { Router } from 'express';

export const statsRouter = Router();

/**
 * GET /api/v1/stats
 * Returns global statistics for the bot status display
 * Requires bot authentication
 */
statsRouter.get('/', async (req, res, next) => {
  try {
    // Verify bot token
    const botToken = req.headers['x-bot-token'];
    const expectedToken = process.env.BOT_API_SECRET;

    if (!expectedToken || botToken !== expectedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get counts in parallel for performance
    const [serverCount, articleCount, searchCount] = await Promise.all([
      prisma.server.count(),
      prisma.article.count({ where: { published: true } }),
      prisma.searchLog.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    res.json({
      servers: serverCount,
      articles: articleCount,
      searches: searchCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/stats/server/:serverId
 * Returns statistics for a specific server
 * Requires bot authentication
 */
statsRouter.get('/server/:serverId', async (req, res, next) => {
  try {
    const { serverId } = req.params;

    // Verify bot token
    const botToken = req.headers['x-bot-token'];
    const expectedToken = process.env.BOT_API_SECRET;

    if (!expectedToken || botToken !== expectedToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get server-specific counts in parallel
    const [articleCount, categoryCount, searchCount, totalViews] = await Promise.all([
      prisma.article.count({ where: { serverId, published: true } }),
      prisma.category.count({ where: { serverId } }),
      prisma.searchLog.count({
        where: {
          serverId,
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.article.aggregate({
        where: { serverId },
        _sum: { views: true },
      }),
    ]);

    res.json({
      serverId,
      articles: articleCount,
      categories: categoryCount,
      searches: searchCount,
      totalViews: totalViews._sum.views || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

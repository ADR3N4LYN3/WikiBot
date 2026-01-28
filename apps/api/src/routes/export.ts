import { Router, Request, Response, NextFunction } from 'express';
import archiver from 'archiver';
import { z } from 'zod';
import { prisma } from '@wikibot/database';
import { TIER_LIMITS, PremiumTier } from '@wikibot/shared';

import { extractServerId } from '../middleware/auth';
import {
  exportServerData,
  importServerData,
  exportToMarkdown,
  ExportData,
} from '../services/exportService';

export const exportRouter = Router();

// Apply serverId extraction to all routes
exportRouter.use(extractServerId);

/**
 * Export articles as JSON
 * GET /api/export/json
 */
exportRouter.get(
  '/json',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const data = await exportServerData(serverId);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="wikibot-export-${serverId}.json"`
      );

      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Export articles as Markdown (ZIP)
 * GET /api/export/markdown
 */
exportRouter.get(
  '/markdown',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      // Check if premium feature
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { premiumTier: true },
      });

      const tier = (server?.premiumTier as PremiumTier) || 'free';
      if (tier === 'free') {
        return res.status(403).json({
          error: 'Markdown export is a premium feature',
        });
      }

      const files = await exportToMarkdown(serverId);

      // Create ZIP archive
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="wikibot-markdown-${serverId}.zip"`
      );

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      for (const [filename, content] of files) {
        archive.append(content, { name: filename });
      }

      await archive.finalize();
    } catch (error) {
      next(error);
    }
  }
);

// Import validation schema
const importSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  server: z.object({
    id: z.string(),
    name: z.string(),
  }),
  categories: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().optional(),
      emoji: z.string().optional(),
      position: z.number(),
    })
  ),
  articles: z.array(
    z.object({
      title: z.string(),
      slug: z.string(),
      content: z.string(),
      categorySlug: z.string().optional(),
      categoryName: z.string().optional(),
      views: z.number().optional(),
      helpful: z.number().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
  ),
});

/**
 * Import articles from JSON
 * POST /api/export/import
 */
exportRouter.post(
  '/import',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      const userId = req.headers['x-user-id'] as string;

      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Check if premium feature
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { premiumTier: true },
      });

      const tier = (server?.premiumTier as PremiumTier) || 'free';
      if (tier === 'free') {
        return res.status(403).json({
          error: 'Import is a premium feature',
        });
      }

      // Validate import data
      const parsed = importSchema.safeParse(req.body.data);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Invalid import data',
          details: parsed.error.errors,
        });
      }

      const options = {
        overwriteExisting: req.body.overwriteExisting === true,
        importCategories: req.body.importCategories !== false,
      };

      const result = await importServerData(
        serverId,
        userId,
        parsed.data as ExportData,
        options
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Validate import data without importing
 * POST /api/export/validate
 */
exportRouter.post(
  '/validate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const parsed = importSchema.safeParse(req.body.data);
      if (!parsed.success) {
        return res.status(400).json({
          valid: false,
          errors: parsed.error.errors,
        });
      }

      const data = parsed.data as ExportData;

      // Check limits
      const [settings, existingArticles] = await Promise.all([
        prisma.serverSettings.findUnique({
          where: { serverId },
          select: { maxArticles: true },
        }),
        prisma.article.count({
          where: { serverId, published: true },
        }),
      ]);

      const maxArticles = settings?.maxArticles || TIER_LIMITS.free.maxArticles;
      const totalAfterImport = existingArticles + data.articles.length;

      const warnings: string[] = [];

      if (maxArticles !== -1 && totalAfterImport > maxArticles) {
        warnings.push(
          `Import would exceed article limit (${totalAfterImport}/${maxArticles})`
        );
      }

      // Check for duplicate slugs
      const existingSlugs = await prisma.article.findMany({
        where: { serverId },
        select: { slug: true },
      });
      const slugSet = new Set(existingSlugs.map((a) => a.slug));
      const duplicates = data.articles.filter((a) => slugSet.has(a.slug));

      if (duplicates.length > 0) {
        warnings.push(
          `${duplicates.length} article(s) have duplicate slugs and will be skipped`
        );
      }

      res.json({
        valid: true,
        summary: {
          categories: data.categories.length,
          articles: data.articles.length,
          duplicates: duplicates.length,
        },
        warnings,
      });
    } catch (error) {
      next(error);
    }
  }
);

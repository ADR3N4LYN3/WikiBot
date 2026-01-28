import { prisma } from '@wikibot/database';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { extractServerId } from '../middleware/auth';

export const settingsRouter = Router();

// Apply serverId extraction to all routes
settingsRouter.use(extractServerId);

// Validation schema
const updateSettingsSchema = z.object({
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  logoUrl: z.string().url().optional().nullable(),
  publicWebview: z.boolean().optional(),
});

/**
 * Get server settings
 * GET /api/settings
 */
settingsRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      let settings = await prisma.serverSettings.findUnique({
        where: { serverId },
      });

      // Create default settings if not exists
      if (!settings) {
        settings = await prisma.serverSettings.create({
          data: { serverId },
        });
      }

      res.json({
        brandColor: settings.brandColor,
        logoUrl: settings.logoUrl,
        publicWebview: settings.publicWebview,
        aiSearchEnabled: settings.aiSearchEnabled,
        maxArticles: settings.maxArticles,
        maxSearchesPerMonth: settings.maxSearchesPerMonth,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update server settings
 * PUT /api/settings
 */
settingsRouter.put(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: parsed.error.errors,
        });
      }

      const { brandColor, logoUrl, publicWebview } = parsed.data;

      // Check if server exists and has premium for logo
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { premiumTier: true },
      });

      if (logoUrl && server?.premiumTier === 'free') {
        return res.status(403).json({
          error: 'Custom logo is a premium feature',
        });
      }

      const settings = await prisma.serverSettings.upsert({
        where: { serverId },
        update: {
          ...(brandColor && { brandColor }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(publicWebview !== undefined && { publicWebview }),
        },
        create: {
          serverId,
          ...(brandColor && { brandColor }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(publicWebview !== undefined && { publicWebview }),
        },
      });

      res.json({
        brandColor: settings.brandColor,
        logoUrl: settings.logoUrl,
        publicWebview: settings.publicWebview,
        aiSearchEnabled: settings.aiSearchEnabled,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Upload logo (presigned URL for S3/R2)
 * POST /api/settings/logo/upload-url
 */
settingsRouter.post(
  '/logo/upload-url',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      // Check premium status
      const server = await prisma.server.findUnique({
        where: { id: serverId },
        select: { premiumTier: true },
      });

      if (server?.premiumTier === 'free') {
        return res.status(403).json({
          error: 'Custom logo is a premium feature',
        });
      }

      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({
          error: 'Filename and content type required',
        });
      }

      // In a real implementation, you would generate a presigned URL for S3/R2 here
      // For now, we'll return a placeholder
      res.json({
        uploadUrl: `https://storage.example.com/upload/${serverId}/${filename}`,
        publicUrl: `https://cdn.example.com/logos/${serverId}/${filename}`,
        message: 'Configure S3/R2 for actual file uploads',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete logo
 * DELETE /api/settings/logo
 */
settingsRouter.delete(
  '/logo',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.serverId;
      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      await prisma.serverSettings.update({
        where: { serverId },
        data: { logoUrl: null },
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

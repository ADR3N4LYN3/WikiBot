import { prisma } from '@wikibot/database';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { requireAuth, extractServerId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import * as auditLogService from '../services/auditLogService';
import * as memberService from '../services/memberService';
import * as uploadService from '../services/uploadService';
import { asyncHandler } from '../utils/asyncHandler';

export const settingsRouter = Router();

// Apply auth and serverId extraction to all routes
settingsRouter.use(requireAuth as (req: Request, res: Response, next: NextFunction) => void);
settingsRouter.use(extractServerId);

// Validation schema
const updateSettingsSchema = z.object({
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  logoUrl: z.string().url().optional().nullable(),
  publicWebview: z.boolean().optional(),
  aiSearchEnabled: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
  searchLoggingEnabled: z.boolean().optional(),
  moderationEnabled: z.boolean().optional(),
  fastIndexingEnabled: z.boolean().optional(),
});

const uploadUrlSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
});

/**
 * Get server settings
 * GET /api/v1/settings
 */
settingsRouter.get('/', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;

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
    analyticsEnabled: settings.analyticsEnabled,
    searchLoggingEnabled: settings.searchLoggingEnabled,
    moderationEnabled: settings.moderationEnabled,
    fastIndexingEnabled: settings.fastIndexingEnabled,
    maxArticles: settings.maxArticles,
    maxSearchesPerMonth: settings.maxSearchesPerMonth,
  });
}));

/**
 * Update server settings
 * PUT /api/v1/settings
 */
settingsRouter.put('/', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  // Require authenticated user with at least admin role
  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  const hasPermission = await memberService.hasRole(serverId, user.id, 'admin');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Admin role required to update settings');
  }

  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'Invalid request', parsed.error.errors);
  }

  const {
    brandColor,
    logoUrl,
    publicWebview,
    aiSearchEnabled,
    analyticsEnabled,
    searchLoggingEnabled,
    moderationEnabled,
    fastIndexingEnabled,
  } = parsed.data;

  // Check if server exists and has premium for logo
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { premiumTier: true },
  });

  if (logoUrl && server?.premiumTier === 'free') {
    throw new AppError(403, 'Forbidden', 'Custom logo is a premium feature');
  }

  // Get old settings for audit log
  const oldSettings = await prisma.serverSettings.findUnique({
    where: { serverId },
  });

  const settings = await prisma.serverSettings.upsert({
    where: { serverId },
    update: {
      ...(brandColor && { brandColor }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(publicWebview !== undefined && { publicWebview }),
      ...(aiSearchEnabled !== undefined && { aiSearchEnabled }),
      ...(analyticsEnabled !== undefined && { analyticsEnabled }),
      ...(searchLoggingEnabled !== undefined && { searchLoggingEnabled }),
      ...(moderationEnabled !== undefined && { moderationEnabled }),
      ...(fastIndexingEnabled !== undefined && { fastIndexingEnabled }),
    },
    create: {
      serverId,
      ...(brandColor && { brandColor }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(publicWebview !== undefined && { publicWebview }),
      ...(aiSearchEnabled !== undefined && { aiSearchEnabled }),
      ...(analyticsEnabled !== undefined && { analyticsEnabled }),
      ...(searchLoggingEnabled !== undefined && { searchLoggingEnabled }),
      ...(moderationEnabled !== undefined && { moderationEnabled }),
      ...(fastIndexingEnabled !== undefined && { fastIndexingEnabled }),
    },
  });

  // Log settings change
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  if (brandColor && brandColor !== oldSettings?.brandColor) {
    changes.brandColor = { old: oldSettings?.brandColor, new: brandColor };
  }
  if (logoUrl !== undefined && logoUrl !== oldSettings?.logoUrl) {
    changes.logoUrl = { old: oldSettings?.logoUrl, new: logoUrl };
  }
  if (publicWebview !== undefined && publicWebview !== oldSettings?.publicWebview) {
    changes.publicWebview = { old: oldSettings?.publicWebview, new: publicWebview };
  }
  if (aiSearchEnabled !== undefined && aiSearchEnabled !== oldSettings?.aiSearchEnabled) {
    changes.aiSearchEnabled = { old: oldSettings?.aiSearchEnabled, new: aiSearchEnabled };
  }
  if (analyticsEnabled !== undefined && analyticsEnabled !== oldSettings?.analyticsEnabled) {
    changes.analyticsEnabled = { old: oldSettings?.analyticsEnabled, new: analyticsEnabled };
  }
  if (searchLoggingEnabled !== undefined && searchLoggingEnabled !== oldSettings?.searchLoggingEnabled) {
    changes.searchLoggingEnabled = { old: oldSettings?.searchLoggingEnabled, new: searchLoggingEnabled };
  }
  if (moderationEnabled !== undefined && moderationEnabled !== oldSettings?.moderationEnabled) {
    changes.moderationEnabled = { old: oldSettings?.moderationEnabled, new: moderationEnabled };
  }
  if (fastIndexingEnabled !== undefined && fastIndexingEnabled !== oldSettings?.fastIndexingEnabled) {
    changes.fastIndexingEnabled = { old: oldSettings?.fastIndexingEnabled, new: fastIndexingEnabled };
  }

  if (Object.keys(changes).length > 0) {
    await auditLogService.logSettingsChange(serverId, user.id, changes, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  res.json({
    brandColor: settings.brandColor,
    logoUrl: settings.logoUrl,
    publicWebview: settings.publicWebview,
    aiSearchEnabled: settings.aiSearchEnabled,
    analyticsEnabled: settings.analyticsEnabled,
    searchLoggingEnabled: settings.searchLoggingEnabled,
    moderationEnabled: settings.moderationEnabled,
    fastIndexingEnabled: settings.fastIndexingEnabled,
  });
}));

/**
 * Upload logo (presigned URL for S3/R2)
 * POST /api/v1/settings/logo/upload-url
 */
settingsRouter.post('/logo/upload-url', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  // Require authenticated user with at least admin role
  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  const hasPermission = await memberService.hasRole(serverId, user.id, 'admin');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Admin role required to upload logo');
  }

  // Check premium status
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    select: { premiumTier: true },
  });

  if (server?.premiumTier === 'free') {
    throw new AppError(403, 'Forbidden', 'Custom logo is a premium feature. Upgrade to Premium or Pro.');
  }

  // Validate input
  const parsed = uploadUrlSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'Filename and content type required', parsed.error.errors);
  }

  const { filename, contentType } = parsed.data;

  // Validate content type
  if (!uploadService.validateContentType(contentType)) {
    throw new AppError(400, 'Bad Request', 'Invalid file type. Allowed: PNG, JPEG, GIF, WebP, SVG');
  }

  // Check if S3/R2 is configured
  if (!uploadService.isStorageConfigured()) {
    throw new AppError(503, 'Service Unavailable', 'File storage is not configured. Please contact support.');
  }

  // Generate presigned URL
  const result = await uploadService.generateUploadUrl(serverId, filename, contentType);

  if (!result) {
    throw new AppError(500, 'Internal Error', 'Failed to generate upload URL');
  }

  res.json({
    uploadUrl: result.uploadUrl,
    publicUrl: result.publicUrl,
    key: result.key,
    expiresIn: 900, // 15 minutes
    maxSize: 2 * 1024 * 1024, // 2MB
  });
}));

/**
 * Delete logo
 * DELETE /api/v1/settings/logo
 */
settingsRouter.delete('/logo', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  // Require authenticated user with at least admin role
  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  const hasPermission = await memberService.hasRole(serverId, user.id, 'admin');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Admin role required to delete logo');
  }

  // Get current logo URL
  const settings = await prisma.serverSettings.findUnique({
    where: { serverId },
    select: { logoUrl: true },
  });

  // Delete from S3/R2 if exists
  if (settings?.logoUrl) {
    await uploadService.deleteLogoByUrl(settings.logoUrl);
  }

  // Update settings
  await prisma.serverSettings.update({
    where: { serverId },
    data: { logoUrl: null },
  });

  // Log the change
  await auditLogService.logSettingsChange(
    serverId,
    user.id,
    { logoUrl: { old: settings?.logoUrl, new: null } },
    { ip: req.ip, userAgent: req.headers['user-agent'] }
  );

  res.json({ success: true });
}));

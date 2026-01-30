import { PERMISSIONS, Permission, isValidPermission } from '@wikibot/shared';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { requireAuth, requireServerId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/requirePermission';
import * as permissionService from '../services/permissionService';
import { asyncHandler } from '../utils/asyncHandler';

export const permissionsRouter = Router();

// Validation schemas
const updatePermissionsSchema = z.object({
  overrides: z.record(z.union([z.boolean(), z.null()])),
});

// Apply auth middleware to all routes
permissionsRouter.use(requireAuth as (req: Request, res: Response, next: NextFunction) => void);
permissionsRouter.use(requireServerId);

// GET /permissions - List all available permissions
permissionsRouter.get('/', (_req, res) => {
  res.json({
    permissions: PERMISSIONS,
    categories: groupPermissionsByCategory(),
  });
});

// GET /permissions/me - Get current user's permissions
permissionsRouter.get('/me', asyncHandler(async (req, res, _next) => {
  const user = req.user;

  if (!user) {
    throw new AppError(401, 'Unauthorized', 'User authentication required');
  }

  // Bot gets all permissions
  if (req.isBot) {
    res.json({
      isMember: true,
      role: 'bot',
      permissions: Object.keys(PERMISSIONS),
      source: 'bot',
      overrides: {},
    });
    return;
  }

  const perms = await permissionService.getMemberPermissions(req.serverId, user.id);

  if (!perms) {
    res.json({
      isMember: false,
      role: null,
      permissions: [],
      source: null,
      overrides: {},
    });
    return;
  }

  res.json({
    isMember: true,
    role: perms.role,
    permissions: perms.permissions,
    source: perms.source,
    overrides: perms.overrides,
  });
}));

// GET /permissions/:userId - Get a member's permissions
permissionsRouter.get('/:userId',
  requirePermission('members:read'),
  asyncHandler(async (req, res, _next) => {
    const { userId } = req.params;
    const perms = await permissionService.getMemberPermissions(req.serverId, userId);

    if (!perms) {
      throw new AppError(404, 'Not Found', 'Member not found');
    }

    res.json(perms);
  })
);

// PUT /permissions/:userId - Update a member's custom permissions
permissionsRouter.put('/:userId',
  requirePermission('members:manage'),
  asyncHandler(async (req, res, _next) => {
    const { userId } = req.params;
    const user = req.user;

    if (!user || req.isBot) {
      throw new AppError(403, 'Forbidden', 'User authentication required');
    }

    const input = updatePermissionsSchema.parse(req.body);

    // Validate all permission keys
    for (const perm of Object.keys(input.overrides)) {
      if (!isValidPermission(perm)) {
        throw new AppError(400, 'Bad Request', `Invalid permission: ${perm}`);
      }
    }

    const updated = await permissionService.updateMemberPermissions(
      req.serverId,
      userId,
      input.overrides as Partial<Record<Permission, boolean | null>>,
      user.id
    );

    res.json(updated);
  })
);

// DELETE /permissions/:userId - Reset a member's permissions to role defaults
permissionsRouter.delete('/:userId',
  requirePermission('members:manage'),
  asyncHandler(async (req, res, _next) => {
    const { userId } = req.params;
    const user = req.user;

    if (!user || req.isBot) {
      throw new AppError(403, 'Forbidden', 'User authentication required');
    }

    await permissionService.resetMemberPermissions(req.serverId, userId, user.id);

    // Return updated (reset) permissions
    const updated = await permissionService.getMemberPermissions(req.serverId, userId);
    res.json(updated);
  })
);

// Helper function to group permissions by category
function groupPermissionsByCategory(): Record<string, { key: string; label: string }[]> {
  const categories: Record<string, { key: string; label: string }[]> = {};

  for (const [key, label] of Object.entries(PERMISSIONS)) {
    const category = key.split(':')[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ key, label });
  }

  return categories;
}

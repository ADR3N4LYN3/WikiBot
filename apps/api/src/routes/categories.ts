import { categoryCreateSchema, categoryUpdateSchema } from '@wikibot/shared';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { requireAuth, requireServerId, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import * as categoryService from '../services/categoryService';
import * as memberService from '../services/memberService';
import * as auditLogService from '../services/auditLogService';

export const categoriesRouter = Router();

// Wrapper to handle async middleware with proper typing
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};

// Validation schema for reordering
const reorderSchema = z.object({
  categoryIds: z.array(z.string().min(1)),
});

categoriesRouter.use(requireAuth as (req: Request, res: Response, next: NextFunction) => void);
categoriesRouter.use(requireServerId);

// Get all categories for a server
categoriesRouter.get('/', async (req, res, next) => {
  try {
    const serverId = req.serverId!;

    const categories = await categoryService.getCategories(serverId);

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Create category
categoriesRouter.post('/', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const input = categoryCreateSchema.parse(req.body);

    const category = await categoryService.createCategory(serverId, input);

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// Update category
categoriesRouter.put('/:slug', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;
    const input = categoryUpdateSchema.parse(req.body);

    const category = await categoryService.updateCategory(serverId, slug, input);

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Delete category
categoriesRouter.delete('/:slug', async (req, res, next) => {
  try {
    const serverId = req.serverId!;
    const { slug } = req.params;

    await categoryService.deleteCategory(serverId, slug);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Reorder categories
categoriesRouter.put('/reorder', asyncHandler(async (req, res, _next) => {
  const serverId = req.serverId;
  const user = req.user;

  // Require authenticated user with at least editor role
  if (!user || req.isBot) {
    throw new AppError(403, 'Forbidden', 'User authentication required');
  }

  const hasPermission = await memberService.hasRole(serverId, user.id, 'editor');
  if (!hasPermission) {
    throw new AppError(403, 'Forbidden', 'Editor role required to reorder categories');
  }

  const input = reorderSchema.parse(req.body);

  await categoryService.reorderCategories(serverId, input.categoryIds);

  // Log the reorder action
  await auditLogService.logCategoryAction(
    serverId,
    user.id,
    'category_reorder',
    'bulk',
    { changes: { newOrder: input.categoryIds } },
    { ip: req.ip, userAgent: req.headers['user-agent'] }
  );

  res.json({ success: true });
}));

import { Router } from 'express';

import { categoryCreateSchema, categoryUpdateSchema } from '@wikibot/shared';

import { requireAuth, requireServerId } from '../middleware/auth';
import * as categoryService from '../services/categoryService';

export const categoriesRouter = Router();

categoriesRouter.use(requireAuth);
categoriesRouter.use(requireServerId);

// Get all categories for a server
categoriesRouter.get('/', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;

    const categories = await categoryService.getCategories(serverId);

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Create category
categoriesRouter.post('/', async (req, res, next) => {
  try {
    const serverId = (req as any).serverId;
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
    const serverId = (req as any).serverId;
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
    const serverId = (req as any).serverId;
    const { slug } = req.params;

    await categoryService.deleteCategory(serverId, slug);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

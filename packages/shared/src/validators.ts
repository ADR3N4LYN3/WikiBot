import { z } from 'zod';

import { ARTICLE_LIMITS, SEARCH_LIMITS } from './constants';

// Article validators
export const articleCreateSchema = z.object({
  title: z
    .string()
    .min(ARTICLE_LIMITS.TITLE_MIN_LENGTH, 'Title must be at least 3 characters')
    .max(ARTICLE_LIMITS.TITLE_MAX_LENGTH, 'Title must be at most 200 characters'),
  content: z
    .string()
    .min(ARTICLE_LIMITS.CONTENT_MIN_LENGTH, 'Content must be at least 10 characters')
    .max(ARTICLE_LIMITS.CONTENT_MAX_LENGTH, 'Content must be at most 50000 characters'),
  categorySlug: z.string().optional(),
});

export const articleUpdateSchema = z.object({
  title: z
    .string()
    .min(ARTICLE_LIMITS.TITLE_MIN_LENGTH)
    .max(ARTICLE_LIMITS.TITLE_MAX_LENGTH)
    .optional(),
  content: z
    .string()
    .min(ARTICLE_LIMITS.CONTENT_MIN_LENGTH)
    .max(ARTICLE_LIMITS.CONTENT_MAX_LENGTH)
    .optional(),
  categorySlug: z.string().optional(),
  published: z.boolean().optional(),
});

// Category validators
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be at most 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  emoji: z.string().emoji('Must be a valid emoji').optional(),
  position: z.number().int().min(0).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  emoji: z.string().emoji().optional(),
  position: z.number().int().min(0).optional(),
});

// Search validators
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(SEARCH_LIMITS.QUERY_MIN_LENGTH, 'Query must be at least 2 characters')
    .max(SEARCH_LIMITS.QUERY_MAX_LENGTH, 'Query must be at most 200 characters'),
  type: z.enum(['fulltext', 'semantic']).default('fulltext'),
  limit: z.number().int().min(1).max(SEARCH_LIMITS.MAX_RESULTS).optional(),
  offset: z.number().int().min(0).optional(),
});

// Server settings validators
export const serverSettingsUpdateSchema = z.object({
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Brand color must be a valid hex color')
    .optional(),
  logoUrl: z.string().url('Logo URL must be a valid URL').optional(),
  maxArticles: z.number().int().min(1).optional(),
  maxSearchesPerMonth: z.number().int().min(1).optional(),
  aiSearchEnabled: z.boolean().optional(),
  publicWebview: z.boolean().optional(),
});

// Export validators
export const exportDataSchema = z.object({
  version: z.string(),
  exportedAt: z.string().datetime(),
  server: z.object({
    id: z.string(),
    name: z.string(),
  }),
  categories: z.array(categoryCreateSchema),
  articles: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      categorySlug: z.string().optional(),
      published: z.boolean(),
    })
  ),
});

// User validators
export const discordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
  avatar: z.string().nullable(),
});

// Pagination validators
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Type inference helpers (only for types not already defined in types/index.ts)
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ExportDataInput = z.infer<typeof exportDataSchema>;
export type DiscordUserInput = z.infer<typeof discordUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

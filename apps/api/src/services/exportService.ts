import { prisma } from '@wikibot/database';
import { TIER_LIMITS, PremiumTier } from '@wikibot/shared';

export interface ExportArticle {
  title: string;
  slug: string;
  content: string;
  categorySlug?: string;
  categoryName?: string;
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExportData {
  version: string;
  exportedAt: string;
  server: {
    id: string;
    name: string;
  };
  categories: Array<{
    name: string;
    slug: string;
    description?: string;
    emoji?: string;
    position: number;
  }>;
  articles: ExportArticle[];
}

export interface ImportResult {
  success: boolean;
  imported: {
    categories: number;
    articles: number;
  };
  skipped: {
    categories: number;
    articles: number;
  };
  errors: string[];
}

/**
 * Export all articles and categories from a server
 */
export async function exportServerData(serverId: string): Promise<ExportData> {
  const [server, categories, articles] = await Promise.all([
    prisma.server.findUnique({
      where: { id: serverId },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { serverId },
      orderBy: { position: 'asc' },
    }),
    prisma.article.findMany({
      where: { serverId, published: true },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  if (!server) {
    throw new Error('Server not found');
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    server: {
      id: server.id,
      name: server.name,
    },
    categories: categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || undefined,
      emoji: cat.emoji || undefined,
      position: cat.position,
    })),
    articles: articles.map((article) => ({
      title: article.title,
      slug: article.slug,
      content: article.content,
      categorySlug: article.category?.slug,
      categoryName: article.category?.name,
      views: article.views,
      helpful: article.helpful,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    })),
  };
}

/**
 * Check if import is allowed based on tier limits
 */
async function checkImportLimits(
  serverId: string,
  articleCount: number
): Promise<{ allowed: boolean; reason?: string }> {
  const [server, settings, existingArticles] = await Promise.all([
    prisma.server.findUnique({
      where: { id: serverId },
      select: { premiumTier: true },
    }),
    prisma.serverSettings.findUnique({
      where: { serverId },
      select: { maxArticles: true },
    }),
    prisma.article.count({
      where: { serverId, published: true },
    }),
  ]);

  const tier = (server?.premiumTier as PremiumTier) || 'free';
  const maxArticles = settings?.maxArticles || TIER_LIMITS[tier].maxArticles;

  // Check if unlimited
  if (maxArticles === -1) {
    return { allowed: true };
  }

  // Check if import would exceed limits
  const totalAfterImport = existingArticles + articleCount;
  if (totalAfterImport > maxArticles) {
    return {
      allowed: false,
      reason: `Import would exceed article limit. Current: ${existingArticles}, Importing: ${articleCount}, Max: ${maxArticles}`,
    };
  }

  return { allowed: true };
}

/**
 * Import articles and categories to a server
 */
export async function importServerData(
  serverId: string,
  userId: string,
  data: ExportData,
  options: {
    overwriteExisting?: boolean;
    importCategories?: boolean;
  } = {}
): Promise<ImportResult> {
  const { overwriteExisting = false, importCategories = true } = options;
  const result: ImportResult = {
    success: true,
    imported: { categories: 0, articles: 0 },
    skipped: { categories: 0, articles: 0 },
    errors: [],
  };

  // Check limits
  const limitCheck = await checkImportLimits(serverId, data.articles.length);
  if (!limitCheck.allowed) {
    return {
      success: false,
      imported: { categories: 0, articles: 0 },
      skipped: { categories: data.categories.length, articles: data.articles.length },
      errors: [limitCheck.reason || 'Import limit exceeded'],
    };
  }

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      username: 'Imported',
      discriminator: '0000',
    },
  });

  // Import categories first
  const categoryMap = new Map<string, string>(); // slug -> id

  if (importCategories) {
    for (const cat of data.categories) {
      try {
        const existing = await prisma.category.findUnique({
          where: { serverId_slug: { serverId, slug: cat.slug } },
        });

        if (existing) {
          if (overwriteExisting) {
            await prisma.category.update({
              where: { id: existing.id },
              data: {
                name: cat.name,
                description: cat.description,
                emoji: cat.emoji,
                position: cat.position,
              },
            });
            result.imported.categories++;
          } else {
            result.skipped.categories++;
          }
          categoryMap.set(cat.slug, existing.id);
        } else {
          const created = await prisma.category.create({
            data: {
              serverId,
              name: cat.name,
              slug: cat.slug,
              description: cat.description,
              emoji: cat.emoji,
              position: cat.position,
            },
          });
          categoryMap.set(cat.slug, created.id);
          result.imported.categories++;
        }
      } catch (error) {
        result.errors.push(`Failed to import category "${cat.name}": ${error}`);
      }
    }
  }

  // Import articles
  for (const article of data.articles) {
    try {
      const categoryId = article.categorySlug
        ? categoryMap.get(article.categorySlug)
        : undefined;

      const existing = await prisma.article.findUnique({
        where: { serverId_slug: { serverId, slug: article.slug } },
      });

      if (existing) {
        if (overwriteExisting) {
          await prisma.article.update({
            where: { id: existing.id },
            data: {
              title: article.title,
              content: article.content,
              categoryId,
            },
          });
          result.imported.articles++;
        } else {
          result.skipped.articles++;
        }
      } else {
        await prisma.article.create({
          data: {
            serverId,
            authorId: userId,
            title: article.title,
            slug: article.slug,
            content: article.content,
            categoryId,
            published: true,
          },
        });
        result.imported.articles++;
      }
    } catch (error) {
      result.errors.push(`Failed to import article "${article.title}": ${error}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Generate Markdown export for all articles
 */
export async function exportToMarkdown(serverId: string): Promise<Map<string, string>> {
  const articles = await prisma.article.findMany({
    where: { serverId, published: true },
    include: {
      category: { select: { name: true } },
      author: { select: { username: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const files = new Map<string, string>();

  for (const article of articles) {
    const filename = `${article.category?.name || 'uncategorized'}/${article.slug}.md`;
    const frontmatter = [
      '---',
      `title: "${article.title}"`,
      `slug: ${article.slug}`,
      `author: ${article.author.username}`,
      `category: ${article.category?.name || 'Uncategorized'}`,
      `created: ${article.createdAt.toISOString()}`,
      `updated: ${article.updatedAt.toISOString()}`,
      '---',
      '',
    ].join('\n');

    files.set(filename, frontmatter + article.content);
  }

  return files;
}

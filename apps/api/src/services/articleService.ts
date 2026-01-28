import { prisma } from '@wikibot/database';
import { ArticleCreateInput, ArticleUpdateInput } from '@wikibot/shared';

import { AppError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/slug';

interface GetArticlesOptions {
  serverId: string;
  categoryId?: string;
  published?: boolean;
  limit: number;
  offset: number;
}

export async function getArticles(options: GetArticlesOptions) {
  const { serverId, categoryId, published, limit, offset } = options;

  const where: any = { serverId };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (published !== undefined) {
    where.published = published;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            emoji: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, limit, offset };
}

export async function getArticleBySlug(serverId: string, slug: string) {
  const article = await prisma.article.findUnique({
    where: {
      serverId_slug: { serverId, slug },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          emoji: true,
        },
      },
    },
  });

  if (!article) {
    throw new AppError(404, 'Article not found');
  }

  return article;
}

interface CreateArticleInput extends ArticleCreateInput {
  serverId: string;
  authorId: string;
}

export async function createArticle(input: CreateArticleInput) {
  const { serverId, authorId, title, content, categorySlug } = input;

  // Generate slug from title
  const slug = generateSlug(title);

  // Check if slug already exists
  const existing = await prisma.article.findUnique({
    where: {
      serverId_slug: { serverId, slug },
    },
  });

  if (existing) {
    throw new AppError(409, 'Article with this title already exists');
  }

  // Get category if provided
  let categoryId: string | undefined;
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: {
        serverId_slug: { serverId, slug: categorySlug },
      },
    });

    if (!category) {
      throw new AppError(404, 'Category not found');
    }

    categoryId = category.id;
  }

  // Create article
  const article = await prisma.article.create({
    data: {
      serverId,
      authorId,
      title,
      slug,
      content,
      categoryId,
      published: true,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          emoji: true,
        },
      },
    },
  });

  // TODO: Generate embeddings for AI search
  // await embeddingService.generateAndIndexArticle(article);

  return article;
}

export async function updateArticle(
  serverId: string,
  slug: string,
  editorId: string,
  input: ArticleUpdateInput
) {
  const article = await getArticleBySlug(serverId, slug);

  // Create version history entry
  await prisma.articleEdit.create({
    data: {
      articleId: article.id,
      editorId,
      content: article.content,
      changelog: 'Updated via API',
    },
  });

  // Update article
  const updated = await prisma.article.update({
    where: {
      serverId_slug: { serverId, slug },
    },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.content && { content: input.content }),
      ...(input.published !== undefined && { published: input.published }),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          emoji: true,
        },
      },
    },
  });

  // TODO: Re-generate embeddings if content changed
  // if (input.content) {
  //   await embeddingService.generateAndIndexArticle(updated);
  // }

  return updated;
}

export async function deleteArticle(serverId: string, slug: string) {
  const article = await getArticleBySlug(serverId, slug);

  await prisma.article.delete({
    where: {
      serverId_slug: { serverId, slug },
    },
  });

  // TODO: Remove from Pinecone
  // await embeddingService.removeFromIndex(article.id);
}

export async function incrementViews(serverId: string, slug: string) {
  await prisma.article.update({
    where: {
      serverId_slug: { serverId, slug },
    },
    data: {
      views: { increment: 1 },
    },
  });
}

export async function voteArticle(serverId: string, slug: string, helpful: boolean) {
  await prisma.article.update({
    where: {
      serverId_slug: { serverId, slug },
    },
    data: {
      ...(helpful ? { helpful: { increment: 1 } } : { notHelpful: { increment: 1 } }),
    },
  });
}

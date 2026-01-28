import { prisma } from '@wikibot/database';
import { SearchQuery, SearchResponse, SEARCH_LIMITS } from '@wikibot/shared';

export async function searchArticles(query: SearchQuery): Promise<SearchResponse> {
  const { serverId, userId, query: searchQuery, type, limit = 10, offset = 0 } = query;

  // Log search for analytics
  await prisma.searchLog.create({
    data: {
      serverId,
      userId,
      query: searchQuery,
      resultCount: 0, // Will be updated after search
    },
  });

  if (type === 'semantic') {
    // TODO: Implement semantic search with Pinecone + OpenAI
    // For now, fallback to full-text
    return await fullTextSearch(serverId, searchQuery, limit, offset);
  }

  return await fullTextSearch(serverId, searchQuery, limit, offset);
}

async function fullTextSearch(
  serverId: string,
  query: string,
  limit: number,
  offset: number
): Promise<SearchResponse> {
  // PostgreSQL full-text search using tsvector
  // Simple implementation - can be enhanced with ranking

  const articles = await prisma.article.findMany({
    where: {
      serverId,
      published: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      category: {
        select: {
          name: true,
          emoji: true,
        },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { views: 'desc' },
  });

  const results = articles.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.content.substring(0, SEARCH_LIMITS.RESULTS_PER_PAGE * 20) + '...',
    relevance: 1.0, // Can be calculated based on match quality
    categoryName: article.category?.name,
    categoryEmoji: article.category?.emoji ?? undefined,
    views: article.views,
    helpful: article.helpful,
    updatedAt: article.updatedAt,
  }));

  return {
    results,
    total: results.length,
    query,
    type: 'fulltext',
  };
}

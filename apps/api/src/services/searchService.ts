import { prisma } from '@wikibot/database';
import { SearchQuery, SearchResponse } from '@wikibot/shared';

import { semanticSearch } from './embeddingService';
import { isAISearchEnabled, generateRAGAnswer } from './ragService';

export async function searchArticles(query: SearchQuery): Promise<SearchResponse> {
  const { serverId, userId, query: searchQuery, type, limit = 10, offset = 0 } = query;

  // Log search for analytics
  const searchLog = await prisma.searchLog.create({
    data: {
      serverId,
      userId,
      query: searchQuery,
      resultCount: 0,
    },
  });

  let response: SearchResponse;

  if (type === 'semantic') {
    // Check if AI search is enabled for this server
    const aiEnabled = await isAISearchEnabled(serverId);

    if (aiEnabled) {
      response = await semanticSearchArticles(serverId, searchQuery, limit, searchLog.id);
    } else {
      // Fallback to full-text if AI not enabled
      response = await fullTextSearch(serverId, searchQuery, limit, offset);
    }
  } else {
    response = await fullTextSearch(serverId, searchQuery, limit, offset);
  }

  // Update search log with result count
  await prisma.searchLog.update({
    where: { id: searchLog.id },
    data: { resultCount: response.total },
  });

  return response;
}

async function semanticSearchArticles(
  serverId: string,
  query: string,
  limit: number,
  _searchLogId: string
): Promise<SearchResponse> {
  try {
    // Perform semantic search using Pinecone
    const semanticResults = await semanticSearch(query, serverId, limit);

    if (semanticResults.length === 0) {
      // Fallback to full-text if no semantic results
      return await fullTextSearch(serverId, query, limit, 0);
    }

    // Get full article details for the results
    const articleIds = semanticResults.map((r) => r.id);
    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
        published: true,
      },
      include: {
        category: {
          select: {
            name: true,
            emoji: true,
          },
        },
      },
    });

    // Map results with scores
    const results = semanticResults.map((sr) => {
      const article = articles.find((a: typeof articles[number]) => a.id === sr.id);
      if (!article) return null;

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.content.substring(0, 200) + '...',
        relevance: sr.score,
        categoryName: article.category?.name,
        categoryEmoji: article.category?.emoji ?? undefined,
        views: article.views,
        helpful: article.helpful,
        updatedAt: article.updatedAt,
      };
    }).filter(Boolean) as SearchResponse['results'];

    // Check if we should generate an AI answer
    const topScore = semanticResults[0]?.score || 0;
    let aiAnswer: string | undefined;
    let sources: string[] | undefined;

    // If confidence is low, generate RAG answer
    if (topScore < 0.8) {
      const ragResult = await generateRAGAnswer(query, serverId);
      if (ragResult) {
        aiAnswer = ragResult.answer;
        sources = ragResult.sources.map((s) => s.id);
      }
    }

    return {
      results,
      total: results.length,
      query,
      type: 'semantic',
      aiGenerated: !!aiAnswer,
      aiAnswer,
      sources,
    };
  } catch (error) {
    console.error('Semantic search error:', error);
    // Fallback to full-text on error
    return await fullTextSearch(serverId, query, limit, 0);
  }
}

async function fullTextSearch(
  serverId: string,
  query: string,
  limit: number,
  offset: number
): Promise<SearchResponse> {
  // Split query into words for better matching
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  const articles = await prisma.article.findMany({
    where: {
      serverId,
      published: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        // Also search for individual words
        ...words.map((word) => ({
          title: { contains: word, mode: 'insensitive' as const },
        })),
        ...words.map((word) => ({
          content: { contains: word, mode: 'insensitive' as const },
        })),
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
    orderBy: [{ views: 'desc' }, { helpful: 'desc' }],
  });

  // Calculate relevance based on match quality
  const results = articles.map((article: typeof articles[number]) => {
    let relevance = 0;
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact title match = highest relevance
    if (titleLower === queryLower) {
      relevance = 1.0;
    } else if (titleLower.includes(queryLower)) {
      relevance = 0.9;
    } else if (contentLower.includes(queryLower)) {
      relevance = 0.7;
    } else {
      // Partial word matches
      const matchingWords = words.filter(
        (w) => titleLower.includes(w) || contentLower.includes(w)
      );
      relevance = 0.3 + (matchingWords.length / words.length) * 0.4;
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.content.substring(0, 200) + '...',
      relevance,
      categoryName: article.category?.name,
      categoryEmoji: article.category?.emoji ?? undefined,
      views: article.views,
      helpful: article.helpful,
      updatedAt: article.updatedAt,
    };
  });

  // Sort by relevance
  results.sort((a: { relevance: number }, b: { relevance: number }) => b.relevance - a.relevance);

  return {
    results,
    total: results.length,
    query,
    type: 'fulltext',
  };
}

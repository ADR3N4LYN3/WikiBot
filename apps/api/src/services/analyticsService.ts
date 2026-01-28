import { prisma } from '@wikibot/database';
import { AnalyticsOverview, TopArticle, TopSearch, ActivityData } from '@wikibot/shared';

export async function getOverview(serverId: string): Promise<AnalyticsOverview> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalArticles, totalCategories, totalSearches, totalViews, articlesThisMonth, searchesThisMonth] =
    await Promise.all([
      prisma.article.count({ where: { serverId } }),
      prisma.category.count({ where: { serverId } }),
      prisma.searchLog.count({ where: { serverId } }),
      prisma.article.aggregate({
        where: { serverId },
        _sum: { views: true },
      }),
      prisma.article.count({
        where: {
          serverId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.searchLog.count({
        where: {
          serverId,
          timestamp: { gte: thirtyDaysAgo },
        },
      }),
    ]);

  return {
    totalArticles,
    totalSearches,
    totalViews: totalViews._sum.views || 0,
    totalCategories,
    articlesThisMonth,
    searchesThisMonth,
  };
}

export async function getTopArticles(serverId: string, limit: number): Promise<TopArticle[]> {
  const articles = await prisma.article.findMany({
    where: { serverId, published: true },
    orderBy: { views: 'desc' },
    take: limit,
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  return articles.map((article: typeof articles[number]) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    views: article.views,
    helpful: article.helpful,
    categoryName: article.category?.name,
  }));
}

export async function getTopSearches(serverId: string, limit: number): Promise<TopSearch[]> {
  // Aggregate searches by query
  const searches = await prisma.searchLog.groupBy({
    by: ['query'],
    where: { serverId },
    _count: { query: true },
    _avg: { resultCount: true },
    _max: { timestamp: true },
    orderBy: { _count: { query: 'desc' } },
    take: limit,
  });

  return searches.map((search: typeof searches[number]) => ({
    query: search.query,
    count: search._count.query,
    avgResultCount: Math.round(search._avg.resultCount || 0),
    lastSearched: search._max.timestamp!,
  }));
}

export async function getActivity(serverId: string, days: number): Promise<ActivityData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get activity data grouped by day
  const [searches, articles] = await Promise.all([
    prisma.searchLog.findMany({
      where: {
        serverId,
        timestamp: { gte: startDate },
      },
      select: { timestamp: true },
    }),
    prisma.article.findMany({
      where: {
        serverId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    }),
  ]);

  // Group by date
  const activityMap = new Map<string, ActivityData>();

  searches.forEach((search: { timestamp: Date }) => {
    const date = search.timestamp.toISOString().split('T')[0];
    const existing = activityMap.get(date) || {
      date,
      searches: 0,
      articlesCreated: 0,
      views: 0,
    };
    existing.searches++;
    activityMap.set(date, existing);
  });

  articles.forEach((article: { createdAt: Date }) => {
    const date = article.createdAt.toISOString().split('T')[0];
    const existing = activityMap.get(date) || {
      date,
      searches: 0,
      articlesCreated: 0,
      views: 0,
    };
    existing.articlesCreated++;
    activityMap.set(date, existing);
  });

  return Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

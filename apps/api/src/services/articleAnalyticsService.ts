import { prisma } from '@wikibot/database';

interface DailyAnalytics {
  date: string;
  views: number;
  uniqueViews: number;
  avgTimeSpent: number;
  helpful: number;
  notHelpful: number;
}

interface ArticleAnalyticsResult {
  articleId: string;
  slug: string;
  title: string;
  totalViews: number;
  totalHelpful: number;
  totalNotHelpful: number;
  helpfulPercentage: number;
  dailyData: DailyAnalytics[];
}

/**
 * Record a view for an article (for daily analytics)
 */
export async function recordView(
  articleId: string,
  timeSpent?: number
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.articleAnalytics.upsert({
    where: {
      articleId_date: { articleId, date: today },
    },
    update: {
      views: { increment: 1 },
      // Update average time spent (simple average for now)
      ...(timeSpent && {
        avgTimeSpent: timeSpent,
      }),
    },
    create: {
      articleId,
      date: today,
      views: 1,
      uniqueViews: 1,
      avgTimeSpent: timeSpent || 0,
    },
  });
}

/**
 * Record a vote for an article (for daily analytics)
 */
export async function recordVote(
  articleId: string,
  helpful: boolean
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.articleAnalytics.upsert({
    where: {
      articleId_date: { articleId, date: today },
    },
    update: helpful
      ? { helpful: { increment: 1 } }
      : { notHelpful: { increment: 1 } },
    create: {
      articleId,
      date: today,
      views: 0,
      uniqueViews: 0,
      ...(helpful ? { helpful: 1 } : { notHelpful: 1 }),
    },
  });
}

/**
 * Get analytics for a specific article
 */
export async function getArticleAnalytics(
  serverId: string,
  slug: string,
  days: number = 30
): Promise<ArticleAnalyticsResult | null> {
  const article = await prisma.article.findUnique({
    where: {
      serverId_slug: { serverId, slug },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      views: true,
      helpful: true,
      notHelpful: true,
    },
  });

  if (!article) {
    return null;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const dailyAnalytics = await prisma.articleAnalytics.findMany({
    where: {
      articleId: article.id,
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });

  const totalVotes = article.helpful + article.notHelpful;
  const helpfulPercentage =
    totalVotes > 0 ? Math.round((article.helpful / totalVotes) * 100) : 0;

  return {
    articleId: article.id,
    slug: article.slug,
    title: article.title,
    totalViews: article.views,
    totalHelpful: article.helpful,
    totalNotHelpful: article.notHelpful,
    helpfulPercentage,
    dailyData: dailyAnalytics.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      views: day.views,
      uniqueViews: day.uniqueViews,
      avgTimeSpent: day.avgTimeSpent,
      helpful: day.helpful,
      notHelpful: day.notHelpful,
    })),
  };
}

/**
 * Get top articles by views for a server
 */
export async function getTopArticles(
  serverId: string,
  limit: number = 10,
  days: number = 30
): Promise<
  Array<{
    slug: string;
    title: string;
    views: number;
    helpfulPercentage: number;
  }>
> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const articles = await prisma.article.findMany({
    where: {
      serverId,
      published: true,
    },
    select: {
      slug: true,
      title: true,
      views: true,
      helpful: true,
      notHelpful: true,
    },
    orderBy: { views: 'desc' },
    take: limit,
  });

  return articles.map((article) => {
    const totalVotes = article.helpful + article.notHelpful;
    return {
      slug: article.slug,
      title: article.title,
      views: article.views,
      helpfulPercentage:
        totalVotes > 0 ? Math.round((article.helpful / totalVotes) * 100) : 0,
    };
  });
}

/**
 * Get aggregated analytics for a server
 */
export async function getServerAnalytics(
  serverId: string,
  days: number = 30
): Promise<{
  totalViews: number;
  totalArticles: number;
  averageHelpfulness: number;
  viewsOverTime: Array<{ date: string; views: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const [articles, dailyViews] = await Promise.all([
    prisma.article.findMany({
      where: { serverId, published: true },
      select: {
        views: true,
        helpful: true,
        notHelpful: true,
      },
    }),
    prisma.articleAnalytics.groupBy({
      by: ['date'],
      where: {
        article: { serverId },
        date: { gte: startDate },
      },
      _sum: { views: true },
      orderBy: { date: 'asc' },
    }),
  ]);

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const totalHelpful = articles.reduce((sum, a) => sum + a.helpful, 0);
  const totalVotes = articles.reduce(
    (sum, a) => sum + a.helpful + a.notHelpful,
    0
  );

  return {
    totalViews,
    totalArticles: articles.length,
    averageHelpfulness:
      totalVotes > 0 ? Math.round((totalHelpful / totalVotes) * 100) : 0,
    viewsOverTime: dailyViews.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      views: day._sum.views || 0,
    })),
  };
}

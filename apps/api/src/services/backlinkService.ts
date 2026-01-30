import { prisma } from '@wikibot/database';

/**
 * Extract internal wiki links from article content
 * Supports markdown links like [[article-slug]] or [text](article-slug)
 */
export function extractWikiLinks(content: string): string[] {
  const links: string[] = [];

  // Match [[slug]] style links
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = wikiLinkRegex.exec(content)) !== null) {
    links.push(match[1].trim());
  }

  // Match [text](/wiki/slug) or [text](slug) style links (internal only)
  const mdLinkRegex = /\[([^\]]+)\]\((?:\/wiki\/)?([^)]+)\)/g;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const href = match[2].trim();
    // Skip external links
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
      links.push(href);
    }
  }

  // Remove duplicates
  return [...new Set(links)];
}

/**
 * Update backlinks for an article based on its content
 */
export async function updateBacklinks(
  serverId: string,
  articleId: string,
  content: string
): Promise<void> {
  const slugs = extractWikiLinks(content);

  // Find target articles by slug within the same server
  const targetArticles = await prisma.article.findMany({
    where: {
      serverId,
      slug: { in: slugs },
    },
    select: { id: true, slug: true },
  });

  const targetIds = targetArticles.map((a) => a.id);

  // Delete existing backlinks from this article
  await prisma.backlink.deleteMany({
    where: { sourceArticleId: articleId },
  });

  // Create new backlinks
  if (targetIds.length > 0) {
    await prisma.backlink.createMany({
      data: targetIds.map((targetId) => ({
        sourceArticleId: articleId,
        targetArticleId: targetId,
      })),
      skipDuplicates: true,
    });
  }
}

/**
 * Get articles that link TO a specific article (incoming links)
 */
export async function getIncomingLinks(
  serverId: string,
  articleSlug: string
): Promise<
  Array<{
    id: string;
    title: string;
    slug: string;
  }>
> {
  const article = await prisma.article.findUnique({
    where: {
      serverId_slug: { serverId, slug: articleSlug },
    },
    select: { id: true },
  });

  if (!article) {
    return [];
  }

  const backlinks = await prisma.backlink.findMany({
    where: { targetArticleId: article.id },
    include: {
      sourceArticle: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return backlinks.map((bl) => bl.sourceArticle);
}

/**
 * Get articles that this article links TO (outgoing links)
 */
export async function getOutgoingLinks(
  serverId: string,
  articleSlug: string
): Promise<
  Array<{
    id: string;
    title: string;
    slug: string;
  }>
> {
  const article = await prisma.article.findUnique({
    where: {
      serverId_slug: { serverId, slug: articleSlug },
    },
    select: { id: true },
  });

  if (!article) {
    return [];
  }

  const backlinks = await prisma.backlink.findMany({
    where: { sourceArticleId: article.id },
    include: {
      targetArticle: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return backlinks.map((bl) => bl.targetArticle);
}

/**
 * Get full backlink data for an article (both incoming and outgoing)
 */
export async function getArticleBacklinks(
  serverId: string,
  articleSlug: string
): Promise<{
  incoming: Array<{ id: string; title: string; slug: string }>;
  outgoing: Array<{ id: string; title: string; slug: string }>;
}> {
  const [incoming, outgoing] = await Promise.all([
    getIncomingLinks(serverId, articleSlug),
    getOutgoingLinks(serverId, articleSlug),
  ]);

  return { incoming, outgoing };
}

/**
 * Rebuild all backlinks for a server (useful for migration)
 */
export async function rebuildServerBacklinks(serverId: string): Promise<number> {
  const articles = await prisma.article.findMany({
    where: { serverId },
    select: { id: true, content: true },
  });

  // Delete all existing backlinks for this server
  await prisma.backlink.deleteMany({
    where: {
      sourceArticle: { serverId },
    },
  });

  let totalLinks = 0;
  for (const article of articles) {
    await updateBacklinks(serverId, article.id, article.content);
    totalLinks += extractWikiLinks(article.content).length;
  }

  return totalLinks;
}

import { Pinecone } from '@pinecone-database/pinecone';
import { prisma } from '@wikibot/database';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
});

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'wikibot-articles';

/**
 * Generate embeddings for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // Limit input to avoid token limits
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Index an article in Pinecone for semantic search
 */
export async function indexArticle(article: {
  id: string;
  serverId: string;
  title: string;
  content: string;
  slug: string;
  categoryId?: string | null;
}): Promise<void> {
  try {
    // Generate embedding for the article
    const textToEmbed = `${article.title}\n\n${article.content}`;
    const embedding = await generateEmbedding(textToEmbed);

    // Get Pinecone index
    const index = pinecone.index(PINECONE_INDEX_NAME);

    // Upsert the embedding
    await index.upsert([
      {
        id: article.id,
        values: embedding,
        metadata: {
          serverId: article.serverId,
          title: article.title,
          slug: article.slug,
          categoryId: article.categoryId || '',
        },
      },
    ]);

    // Store embedding in database as well (for backup/debug)
    await prisma.article.update({
      where: { id: article.id },
      data: {
        embedding: JSON.stringify(embedding),
      },
    });

    console.log(`✅ Indexed article: ${article.title}`);
  } catch (error) {
    console.error('Failed to index article:', error);
    // Don't throw - indexing failure shouldn't break article creation
  }
}

/**
 * Remove an article from the Pinecone index
 */
export async function removeFromIndex(articleId: string): Promise<void> {
  try {
    const index = pinecone.index(PINECONE_INDEX_NAME);
    await index.deleteOne(articleId);
    console.log(`🗑️ Removed article from index: ${articleId}`);
  } catch (error) {
    console.error('Failed to remove from index:', error);
  }
}

/**
 * Perform semantic search using Pinecone
 */
export async function semanticSearch(
  query: string,
  serverId: string,
  limit: number = 10
): Promise<{ id: string; score: number; title: string; slug: string }[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search in Pinecone
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const results = await index.query({
      vector: queryEmbedding,
      topK: limit,
      filter: {
        serverId: { $eq: serverId },
      },
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      title: (match.metadata?.title as string) || '',
      slug: (match.metadata?.slug as string) || '',
    }));
  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}

/**
 * Batch index multiple articles
 */
export async function batchIndexArticles(serverId: string): Promise<void> {
  console.log(`📚 Starting batch indexing for server: ${serverId}`);

  const articles = await prisma.article.findMany({
    where: {
      serverId,
      published: true,
      embedding: null, // Only index articles without embeddings
    },
    select: {
      id: true,
      serverId: true,
      title: true,
      content: true,
      slug: true,
      categoryId: true,
    },
  });

  console.log(`Found ${articles.length} articles to index`);

  for (const article of articles) {
    await indexArticle(article);
    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`✅ Batch indexing complete for server: ${serverId}`);
}

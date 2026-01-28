import OpenAI from 'openai';
import { prisma } from '@wikibot/database';

import { semanticSearch } from './embeddingService';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RAGResult {
  answer: string;
  sources: {
    id: string;
    title: string;
    slug: string;
  }[];
  confidence: number;
}

/**
 * Generate an AI answer using RAG (Retrieval Augmented Generation)
 * Uses relevant articles as context for GPT-4
 */
export async function generateRAGAnswer(
  query: string,
  serverId: string
): Promise<RAGResult | null> {
  try {
    // Get relevant articles using semantic search
    const searchResults = await semanticSearch(query, serverId, 5);

    if (searchResults.length === 0) {
      return null;
    }

    // Fetch full article content for top 3 results
    const topResults = searchResults.slice(0, 3);
    const articleIds = topResults.map((r) => r.id);

    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
      },
    });

    // Build context from articles
    const context = articles
      .map(
        (article) =>
          `## ${article.title}\n\n${article.content.slice(0, 2000)}`
      )
      .join('\n\n---\n\n');

    // Generate answer using GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions using ONLY the provided documentation.

Rules:
- Only use information from the provided context
- If the answer is not in the documentation, say "I couldn't find information about this in the documentation."
- Be concise and direct
- Reference the relevant articles when possible
- Use markdown formatting for clarity`,
        },
        {
          role: 'user',
          content: `Documentation:\n\n${context}\n\n---\n\nQuestion: ${query}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content;

    if (!answer) {
      return null;
    }

    // Calculate confidence based on top result scores
    const avgScore =
      topResults.reduce((sum, r) => sum + r.score, 0) / topResults.length;

    return {
      answer,
      sources: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
      })),
      confidence: avgScore,
    };
  } catch (error) {
    console.error('RAG generation failed:', error);
    return null;
  }
}

/**
 * Check if the server has AI search enabled (premium feature)
 */
export async function isAISearchEnabled(serverId: string): Promise<boolean> {
  const settings = await prisma.serverSettings.findUnique({
    where: { serverId },
    select: { aiSearchEnabled: true },
  });

  return settings?.aiSearchEnabled ?? false;
}

/**
 * Enhanced search that combines semantic search with RAG
 */
export async function enhancedSearch(
  query: string,
  serverId: string,
  limit: number = 10
): Promise<{
  results: { id: string; score: number; title: string; slug: string }[];
  aiAnswer?: RAGResult;
}> {
  // Perform semantic search
  const results = await semanticSearch(query, serverId, limit);

  // If we have good results (score > 0.8), return them without AI answer
  const hasGoodResults =
    results.length > 0 && results[0].score > 0.8;

  if (hasGoodResults) {
    return { results };
  }

  // For lower confidence results, generate an AI answer
  const aiAnswer = await generateRAGAnswer(query, serverId);

  return {
    results,
    aiAnswer: aiAnswer || undefined,
  };
}

// Re-export permission types
export * from './permissions';

// Discord-related types
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

// Article types
export interface ArticleCreateInput {
  title: string;
  content: string;
  categorySlug?: string;
}

export interface ArticleUpdateInput {
  title?: string;
  content?: string;
  categorySlug?: string;
  published?: boolean;
}

export interface ArticleSearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  relevance: number;
  categoryName?: string;
  categoryEmoji?: string;
  views: number;
  helpful: number;
  updatedAt: Date;
}

export interface ArticleWithDetails {
  id: string;
  serverId: string;
  title: string;
  slug: string;
  content: string;
  views: number;
  helpful: number;
  notHelpful: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    emoji: string | null;
  };
}

// Category types
export interface CategoryCreateInput {
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
  position?: number;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  emoji?: string;
  position?: number;
}

// Search types
export interface SearchQuery {
  query: string;
  serverId: string;
  userId: string;
  type: 'fulltext' | 'semantic';
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: ArticleSearchResult[];
  total: number;
  query: string;
  type: 'fulltext' | 'semantic';
  aiGenerated?: boolean;
  aiAnswer?: string;
  sources?: string[]; // Article IDs used for RAG
}

// Server settings types
export interface ServerSettingsUpdateInput {
  brandColor?: string;
  logoUrl?: string;
  maxArticles?: number;
  maxSearchesPerMonth?: number;
  aiSearchEnabled?: boolean;
  publicWebview?: boolean;
}

// Analytics types
export interface AnalyticsOverview {
  totalArticles: number;
  totalSearches: number;
  totalViews: number;
  totalCategories: number;
  articlesThisMonth: number;
  searchesThisMonth: number;
}

export interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  helpful: number;
  categoryName?: string;
}

export interface TopSearch {
  query: string;
  count: number;
  avgResultCount: number;
  lastSearched: Date;
}

export interface ActivityData {
  date: string;
  searches: number;
  articlesCreated: number;
  views: number;
}

// Export/Import types
export interface ExportData {
  version: string;
  exportedAt: string;
  server: {
    id: string;
    name: string;
  };
  categories: CategoryCreateInput[];
  articles: {
    title: string;
    content: string;
    categorySlug?: string;
    published: boolean;
  }[];
}

// Webhook types (Stripe)
export interface SubscriptionWebhookPayload {
  serverId: string;
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd?: Date;
}

// Command types
export interface CommandOption {
  name: string;
  description: string;
  type: number; // Discord.js option type enum
  required?: boolean;
  choices?: { name: string; value: string | number }[];
}

export interface WikiCommand {
  name: string;
  description: string;
  options?: CommandOption[];
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

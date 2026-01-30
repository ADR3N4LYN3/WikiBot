// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  emoji?: string | null;
  position: number;
  _count?: {
    articles: number;
  };
}

// Author type for articles
export interface ArticleAuthor {
  id: string;
  username: string;
  avatar?: string | null;
}

// Article types
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  author?: ArticleAuthor;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
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
}

export interface TopSearch {
  query: string;
  count: number;
  avgResultCount: number;
}

export interface ActivityData {
  date: string;
  searches: number;
  views: number;
}

// API Error type
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// User type for session
export interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  discordId?: string;
}

// Export data type
export interface ExportData {
  articles?: Article[];
  categories?: Category[];
  version?: string;
  exportedAt?: string;
}

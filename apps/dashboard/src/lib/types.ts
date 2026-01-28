// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  emoji?: string | null;
  order: number;
  _count?: {
    articles: number;
  };
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
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
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

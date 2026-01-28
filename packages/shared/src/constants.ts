// Subscription tiers
export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PRO = 'pro',
}

// Alias for backwards compatibility
export type PremiumTier = SubscriptionTier;

// Tier limits configuration
export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    maxArticles: 50,
    maxSearchesPerMonth: 1000,
    maxCategories: 3,
    maxAdmins: 1,
    aiSearchEnabled: false,
    customBranding: false,
    exportImport: false,
    advancedAnalytics: false,
    apiAccess: false,
  },
  [SubscriptionTier.PREMIUM]: {
    maxArticles: -1, // unlimited
    maxSearchesPerMonth: -1,
    maxCategories: -1,
    maxAdmins: 5,
    aiSearchEnabled: true,
    customBranding: true,
    exportImport: true,
    advancedAnalytics: true,
    apiAccess: false,
  },
  [SubscriptionTier.PRO]: {
    maxArticles: -1,
    maxSearchesPerMonth: -1,
    maxCategories: -1,
    maxAdmins: -1,
    aiSearchEnabled: true,
    customBranding: true,
    exportImport: true,
    advancedAnalytics: true,
    apiAccess: true,
  },
} as const;

// Discord colors
export const DISCORD_COLORS = {
  BLURPLE: '#5865F2',
  GREEN: '#57F287',
  YELLOW: '#FEE75C',
  FUCHSIA: '#EB459E',
  RED: '#ED4245',
  WHITE: '#FFFFFF',
  BLACK: '#23272A',
  DARK: '#2C2F33',
} as const;

// Embed constants
export const EMBED_LIMITS = {
  TITLE_MAX_LENGTH: 256,
  DESCRIPTION_MAX_LENGTH: 4096,
  FIELDS_MAX_COUNT: 25,
  FIELD_NAME_MAX_LENGTH: 256,
  FIELD_VALUE_MAX_LENGTH: 1024,
  FOOTER_MAX_LENGTH: 2048,
  AUTHOR_NAME_MAX_LENGTH: 256,
} as const;

// Article constants
export const ARTICLE_LIMITS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  CONTENT_MIN_LENGTH: 10,
  CONTENT_MAX_LENGTH: 50000, // ~50KB
  SLUG_MAX_LENGTH: 200,
  EXCERPT_LENGTH: 200,
} as const;

// Search constants
export const SEARCH_LIMITS = {
  QUERY_MIN_LENGTH: 2,
  QUERY_MAX_LENGTH: 200,
  RESULTS_PER_PAGE: 10,
  MAX_RESULTS: 50,
  SEMANTIC_SIMILARITY_THRESHOLD: 0.7, // Minimum similarity score for Pinecone results
} as const;

// API Rate limits
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE_IP: 100,
  REQUESTS_PER_MINUTE_SERVER: 1000,
  SEARCH_REQUESTS_PER_MINUTE: 20,
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  SEARCH_RESULTS: 300, // 5 minutes
  SERVER_SETTINGS: 300, // 5 minutes
  ARTICLE: 60, // 1 minute
  CATEGORIES: 600, // 10 minutes
} as const;

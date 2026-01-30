// Test setup file
import 'dotenv/config';

// Mock Redis for tests
jest.mock('../utils/redis', () => ({
  initRedis: jest.fn(),
  closeRedis: jest.fn(),
  isRedisAvailable: jest.fn().mockReturnValue(false),
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(undefined),
  cacheDelete: jest.fn().mockResolvedValue(undefined),
  cacheDeletePattern: jest.fn().mockResolvedValue(undefined),
  cacheable: jest.fn().mockImplementation(async (_key, fetchFn) => fetchFn()),
  CacheKeys: {
    serverSettings: (serverId: string) => `settings:${serverId}`,
    article: (serverId: string, slug: string) => `article:${serverId}:${slug}`,
    categories: (serverId: string) => `categories:${serverId}`,
    permissions: (serverId: string, userId: string) => `permissions:${serverId}:${userId}`,
    memberServers: (userId: string) => `member-servers:${userId}`,
  },
  CacheTTL: {
    SETTINGS: 300,
    ARTICLE: 60,
    CATEGORIES: 600,
    PERMISSIONS: 300,
    MEMBER_SERVERS: 300,
  },
}));

// Clean up after tests
afterAll(async () => {
  // Add any cleanup here
});

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
export async function initRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('⚠️ REDIS_URL not configured - caching disabled');
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      isConnected = true;
    });

    redisClient.on('disconnect', () => {
      console.log('⚠️ Redis disconnected');
      isConnected = false;
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    redisClient = null;
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null && isConnected;
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisAvailable()) {
    return null;
  }

  try {
    const value = await redisClient!.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

/**
 * Set value in cache with optional TTL (in seconds)
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await redisClient!.setEx(key, ttlSeconds, stringValue);
    } else {
      await redisClient!.set(key, stringValue);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    await redisClient!.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const keys = await redisClient!.keys(pattern);
    if (keys.length > 0) {
      await redisClient!.del(keys);
    }
  } catch (error) {
    console.error('Redis delete pattern error:', error);
  }
}

/**
 * Cache wrapper with automatic fetch
 * If value exists in cache, return it. Otherwise, fetch and cache.
 */
export async function cacheable<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the result
  await cacheSet(key, data, ttlSeconds);

  return data;
}

// Cache key generators
export const CacheKeys = {
  serverSettings: (serverId: string) => `settings:${serverId}`,
  article: (serverId: string, slug: string) => `article:${serverId}:${slug}`,
  categories: (serverId: string) => `categories:${serverId}`,
  permissions: (serverId: string, userId: string) => `permissions:${serverId}:${userId}`,
  memberServers: (userId: string) => `member-servers:${userId}`,
};

// Cache TTLs (in seconds)
export const CacheTTL = {
  SETTINGS: 300, // 5 minutes
  ARTICLE: 60, // 1 minute
  CATEGORIES: 600, // 10 minutes
  PERMISSIONS: 300, // 5 minutes
  MEMBER_SERVERS: 300, // 5 minutes
};

/**
 * Cache service - wraps Redis client
 * This abstraction makes it easy to swap cache providers if needed
 */

import Redis from 'ioredis';

// Prevent multiple instances of Redis Client in development
declare global {
  var __redis__: Redis | undefined;
}

let redis: Redis;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (process.env.NODE_ENV === 'production') {
  redis = new Redis(REDIS_URL);
} else {
  if (!global.__redis__) {
    global.__redis__ = new Redis(REDIS_URL);
  }
  redis = global.__redis__;
}

/**
 * Cache service interface
 */
export const cache = {
  /**
   * Get a value from cache
   */
  async get<T = string>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await redis.setex(key, ttl, stringValue);
    } else {
      await redis.set(key, stringValue);
    }
  },

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  /**
   * Get the Redis client instance for advanced operations
   */
  getClient(): Redis {
    return redis;
  }
};

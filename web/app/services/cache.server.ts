import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

// Prevent multiple instances during hot reload in development
const redis =
  globalThis.__redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__redis = redis;
}

// Handle connection errors gracefully
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

/**
 * Get a value from Redis cache
 * @param key - The cache key
 * @returns The parsed value or null if not found
 */
export async function get<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Set a value in Redis cache with optional TTL
 * @param key - The cache key
 * @param value - The value to store (will be JSON stringified)
 * @param ttlSeconds - Time to live in seconds (optional)
 */
export async function set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error);
  }
}

/**
 * Delete a value from Redis cache
 * @param key - The cache key to delete
 */
export async function del(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis del error for key ${key}:`, error);
  }
}

/**
 * Disconnect from Redis
 * Call this when shutting down the application or at the end of scripts
 */
export async function disconnect(): Promise<void> {
  try {
    await redis.quit();
  } catch (error) {
    console.error("Redis disconnect error:", error);
  }
}

export { redis };

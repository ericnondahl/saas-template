import type { ConnectionOptions } from "bullmq";

/**
 * Parse Redis URL into BullMQ connection options.
 * Supports redis:// URLs with optional password and port.
 */
function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    username: parsed.username || undefined,
  };
}

/**
 * Shared Redis connection configuration for BullMQ queues and workers.
 * Uses the REDIS_URL environment variable.
 */
export const connection: ConnectionOptions = parseRedisUrl(
  process.env.REDIS_URL || "redis://localhost:6379"
);

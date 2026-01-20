import { Queue } from "bullmq";
import { connection } from "./connection";

/**
 * Test queue for demonstrating BullMQ functionality.
 * Processes jobs that print user information to the console.
 */
export const testQueue = new Queue("test-queue", { connection });

/**
 * Registry of all queues for admin monitoring.
 * Add new queues here to make them visible in the admin dashboard.
 */
export const allQueues = [testQueue];

/**
 * Helper to get a queue by name.
 * @param name - The queue name to look up
 * @returns The queue instance or undefined if not found
 */
export function getQueueByName(name: string): Queue | undefined {
  return allQueues.find((q) => q.name === name);
}

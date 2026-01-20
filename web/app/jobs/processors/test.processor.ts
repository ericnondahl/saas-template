import type { Job } from "bullmq";

/**
 * Data payload for test queue jobs.
 */
export interface TestJobData {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Process a test job by logging user information to the console.
 * This is a demonstration processor - replace with real business logic.
 */
export async function processTestJob(job: Job<TestJobData>): Promise<void> {
  const { userId, email, firstName, lastName } = job.data;
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Unknown";

  console.log(`[test-queue] Processing job ${job.id}`);
  console.log(`[test-queue]   User ID: ${userId}`);
  console.log(`[test-queue]   Email: ${email}`);
  console.log(`[test-queue]   Name: ${name}`);

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log(`[test-queue] Completed job ${job.id}`);
}

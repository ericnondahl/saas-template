import { Worker } from "bullmq";
import { connection } from "./connection";
import { processTestJob } from "./processors/test.processor";

// Track workers for cleanup
const workers: Worker[] = [];

/**
 * Start all BullMQ workers.
 * Call this function to begin processing jobs from all queues.
 * Can be called from the web server (inline mode) or standalone worker script.
 */
export function startWorkers(): Worker[] {
  console.log("[worker] Starting BullMQ workers...");

  // Test queue worker
  const testWorker = new Worker("test-queue", processTestJob, {
    connection,
    concurrency: 5,
  });

  testWorker.on("completed", (job) => {
    console.log(`[worker] Job ${job.id} completed successfully`);
  });

  testWorker.on("failed", (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message);
  });

  testWorker.on("error", (err) => {
    console.error("[worker] Worker error:", err);
  });

  workers.push(testWorker);

  console.log("[worker] BullMQ workers started");
  console.log("[worker]   - test-queue worker (concurrency: 5)");

  return workers;
}

/**
 * Gracefully stop all workers.
 * Call this on process shutdown to ensure clean termination.
 */
export async function stopWorkers(): Promise<void> {
  console.log("[worker] Stopping BullMQ workers...");

  await Promise.all(workers.map((worker) => worker.close()));

  console.log("[worker] All workers stopped");
}

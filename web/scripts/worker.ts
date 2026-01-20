/**
 * Standalone BullMQ worker script.
 * Run this as a separate process to handle job processing independently from the web server.
 *
 * Usage: npm run worker
 * Or: npx tsx scripts/worker.ts
 *
 * Environment variables:
 *   REDIS_URL - Redis connection URL (default: redis://localhost:6379)
 */
import "dotenv/config";
import { startWorkers, stopWorkers } from "../app/jobs";

console.log("===========================================");
console.log("  BullMQ Worker - Standalone Mode");
console.log("===========================================");
console.log(`Redis URL: ${process.env.REDIS_URL || "redis://localhost:6379"}`);
console.log("");

// Start all workers
const workers = startWorkers();

// Handle graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n[worker] Received ${signal}, shutting down gracefully...`);

  try {
    await stopWorkers();
    console.log("[worker] Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("[worker] Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Keep the process alive
console.log("[worker] Worker is running. Press Ctrl+C to stop.");

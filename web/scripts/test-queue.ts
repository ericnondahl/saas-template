/**
 * Test script to queue jobs for all users in the database.
 * Demonstrates BullMQ queue functionality.
 *
 * Usage: npx tsx scripts/test-queue.ts
 *
 * Prerequisites:
 *   - Redis must be running (docker-compose up -d redis)
 *   - Database must have users (sign up through the app first)
 *
 * To process the queued jobs, run the worker in a separate terminal:
 *   npm run worker
 */
import "dotenv/config";
import { db } from "../app/services/db.server";
import { testQueue } from "../app/jobs/queues";

console.log("===========================================");
console.log("  BullMQ Test Script - Queue Jobs");
console.log("===========================================");
console.log("");

try {
  // Fetch all users from the database
  console.log("Fetching users from database...");
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  if (users.length === 0) {
    console.log("\nNo users found in the database.");
    console.log("Sign up through the app first to create some users.");
    await cleanup();
    process.exit(0);
  }

  console.log(`Found ${users.length} user(s)\n`);

  // Queue a job for each user
  console.log("Queuing jobs...\n");

  for (const user of users) {
    const job = await testQueue.add("test-job", {
      userId: user.id,
      email: user.email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    });

    console.log(`  Queued job ${job.id} for user: ${user.email}`);
  }

  console.log(`\n${users.length} job(s) queued to "test-queue"`);
  console.log("\nTo process these jobs, run the worker:");
  console.log("  npm run worker");
  console.log("\nOr view them in the admin panel:");
  console.log("  http://localhost:5173/admin/queues");
} catch (error) {
  console.error("\nError:", error);
  await cleanup();
  process.exit(1);
}

// Clean up connections
await cleanup();

async function cleanup() {
  await testQueue.close();
  await db.$disconnect();
}

/**
 * Test script to verify the OpenRouter streaming integration.
 * Usage: npx tsx scripts/test-openrouter-streaming.ts
 */
import "dotenv/config";
import { openRouterStreaming } from "../app/services/ai.server";
import { disconnect as disconnectCache } from "../app/services/cache.server";
import { db } from "../app/services/db.server";

console.log("Testing OpenRouter streaming...\n");

try {
  const stream = openRouterStreaming({
    prompt: "Write a short paragraph about the ocean.",
    model: "anthropic/claude-sonnet-4.5",
  });

  for await (const event of stream) {
    if (event.type === "content") {
      process.stdout.write(event.content);
    } else if (event.type === "complete") {
      console.log("\n\n--- Streaming complete ---");
      console.log(`Input tokens: ${event.usage.inputTokens}`);
      console.log(`Output tokens: ${event.usage.outputTokens}`);
      console.log(`Total tokens: ${event.usage.totalTokens}`);
      console.log(`Total cost: $${event.cost.totalCost.toFixed(6)}`);
    }
  }

  console.log("\n✓ OpenRouter streaming test successful!");
} catch (error) {
  console.error("\n✗ Failed to stream from OpenRouter:");
  console.error(error);
  await cleanup();
  process.exit(1);
}

await cleanup();

async function cleanup() {
  await disconnectCache();
  await db.$disconnect();
}

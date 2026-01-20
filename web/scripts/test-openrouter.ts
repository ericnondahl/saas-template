/**
 * Test script to verify the OpenRouter AI service integration.
 * Usage: npx tsx scripts/test-openrouter.ts
 */
import "dotenv/config";
import { openRouter } from "../app/services/ai.server";
import { disconnect as disconnectCache } from "../app/services/cache.server";
import { db } from "../app/services/db.server";

/**
 * Expected response type for testing
 */
interface TestResponse {
  message: string;
}

console.log("Testing OpenRouter AI service...\n");

try {
  const result = await openRouter<TestResponse>({
    prompt: "Say hello world",
    model: "anthropic/claude-sonnet-4.5",
    jsonSchema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
      required: ["message"],
    },
  });

  console.log("\n✓ OpenRouter call successful!");
  console.log("Response:", JSON.stringify(result, null, 2));

  // Verify the response matches expected type
  if (result.data.message) {
    console.log("\n✓ Response has expected 'message' field");
    console.log(`  Message content: "${result.data.message}"`);
  } else {
    console.warn("\n⚠ Warning: Response missing 'message' field");
  }

  // Display usage and cost information
  console.log("\n📊 Usage Statistics:");
  console.log(`  Input tokens: ${result.usage.inputTokens}`);
  console.log(`  Output tokens: ${result.usage.outputTokens}`);
  console.log(`  Total tokens: ${result.usage.totalTokens}`);
  console.log(`\n💰 Cost:`);
  console.log(`  Input cost: $${result.cost.inputCost.toFixed(6)}`);
  console.log(`  Output cost: $${result.cost.outputCost.toFixed(6)}`);
  console.log(`  Total cost: $${result.cost.totalCost.toFixed(6)}`);
} catch (error) {
  console.error("\n✗ Failed to call OpenRouter:");
  console.error(error);
  await cleanup();
  process.exit(1);
}

// Clean up connections so the script can exit
await cleanup();

async function cleanup() {
  await disconnectCache();
  await db.$disconnect();
}

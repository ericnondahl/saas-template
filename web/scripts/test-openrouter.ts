/**
 * Test script to verify the OpenRouter AI service integration.
 * Usage: npx tsx scripts/test-openrouter.ts
 */
import "dotenv/config";
import { openrouter } from "../app/services/ai.server";

/**
 * Expected response type for testing
 */
interface TestResponse {
  message: string;
}

console.log("Testing OpenRouter AI service...\n");

try {
  const result = await openrouter<TestResponse>({
    prompt: "Say hello world",
    model: "openai/gpt-4",
    jsonSchema: {
      type: "object",
      properties: {
        message: { type: "string" }
      },
      required: ["message"]
    }
  });

  console.log("\n✓ OpenRouter call successful!");
  console.log("Response:", JSON.stringify(result, null, 2));
  
  // Verify the response matches expected type
  if (result.message) {
    console.log("\n✓ Response has expected 'message' field");
    console.log(`  Message content: "${result.message}"`);
  } else {
    console.warn("\n⚠ Warning: Response missing 'message' field");
  }
  
} catch (error) {
  console.error("\n✗ Failed to call OpenRouter:");
  console.error(error);
  process.exit(1);
}

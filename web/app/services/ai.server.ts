/**
 * AI Service for OpenRouter integration
 * Provides generic typed methods for AI API calls
 */

export interface OpenRouterOptions {
  model?: string;
  prompt: string;
  jsonSchema?: Record<string, any>; // JSON schema to constrain output structure
  // Additional options can be added later (temperature, max_tokens, etc.)
}

/**
 * Calls OpenRouter API to generate AI responses.
 * Currently mocked - returns a hardcoded response for testing.
 * 
 * @param options - Configuration including prompt and optional JSON schema
 * @param options.prompt - The prompt to send to the AI model
 * @param options.model - Optional model identifier (e.g., "openai/gpt-4")
 * @param options.jsonSchema - Optional JSON schema to constrain the AI response format
 * @returns A promise that resolves to the typed response
 * 
 * @example
 * ```typescript
 * interface MyResponse {
 *   message: string;
 * }
 * 
 * const result = await openrouter<MyResponse>({
 *   prompt: "Say hello",
 *   jsonSchema: {
 *     type: "object",
 *     properties: {
 *       message: { type: "string" }
 *     },
 *     required: ["message"]
 *   }
 * });
 * ```
 */
export async function openrouter<T>(options: OpenRouterOptions): Promise<T> {
  // Mock implementation for now
  // In real implementation, jsonSchema will be passed to OpenRouter to ensure structured output
  
  console.log(`🤖 OpenRouter mock called with prompt: "${options.prompt}"`);
  if (options.model) {
    console.log(`   Model: ${options.model}`);
  }
  if (options.jsonSchema) {
    console.log(`   JSON Schema provided: ${JSON.stringify(options.jsonSchema, null, 2)}`);
  }
  
  // Return mock response
  return { message: "hello world" } as T;
}

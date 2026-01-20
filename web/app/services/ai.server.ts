/**
 * AI Service for OpenRouter integration
 * Provides generic typed methods for AI API calls with usage tracking and cost logging
 */

import { OpenRouter } from "@openrouter/sdk";
import { db } from "./db.server";
import * as cache from "./cache.server";

// Initialize OpenRouter client
const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Cache key prefix for model pricing
const MODEL_PRICING_CACHE_PREFIX = "openrouter:model:pricing:";
const PRICING_CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export interface OpenRouterOptions {
  model?: string;
  prompt: string;
  jsonSchema?: Record<string, unknown>; // JSON schema to constrain output structure
  temperature?: number;
  maxTokens?: number;
}

export interface OpenRouterResult<T> {
  data: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
}

interface ModelPricing {
  prompt: number; // Cost per million tokens for input
  completion: number; // Cost per million tokens for output
}

/**
 * Fetches model pricing from OpenRouter API and caches it
 * @param modelId - The model identifier (e.g., "openai/gpt-4")
 * @returns Pricing information or null if not found
 */
async function getModelPricing(modelId: string): Promise<ModelPricing | null> {
  const cacheKey = `${MODEL_PRICING_CACHE_PREFIX}${modelId}`;

  // Try to get from cache first
  const cached = await cache.get<ModelPricing>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Fetch all models from OpenRouter API
    const response = await client.models.list();

    // Find the specific model
    const model = response.data?.find(
      (m: { id?: string; pricing?: { prompt?: string; completion?: string } }) => m.id === modelId
    );
    if (!model || !model.pricing) {
      console.warn(`Model pricing not found for: ${modelId}`);
      return null;
    }

    const pricing: ModelPricing = {
      prompt: parseFloat(model.pricing.prompt || "0"),
      completion: parseFloat(model.pricing.completion || "0"),
    };

    // Cache the pricing for 24 hours
    await cache.set(cacheKey, pricing, PRICING_CACHE_TTL_SECONDS);

    return pricing;
  } catch (error) {
    console.error(`Failed to fetch model pricing for ${modelId}:`, error);
    return null;
  }
}

/**
 * Calculates the cost of an API call based on token usage and model pricing
 */
function calculateCost(
  inputTokens: number,
  outputTokens: number,
  pricing: ModelPricing | null
): { inputCost: number; outputCost: number; totalCost: number } {
  if (!pricing) {
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }

  // OpenRouter pricing is already per-token (e.g., "0.000003" = $0.000003 per token)
  const inputCost = inputTokens * pricing.prompt;
  const outputCost = outputTokens * pricing.completion;
  const totalCost = inputCost + outputCost;

  return { inputCost, outputCost, totalCost };
}

/**
 * Logs an OpenRouter API call to the database
 */
async function logApiCall(
  model: string,
  inputText: string,
  outputText: string,
  inputTokens: number,
  outputTokens: number,
  totalTokens: number,
  inputCost: number,
  outputCost: number,
  totalCost: number
): Promise<void> {
  try {
    // Using type assertion as Prisma types may need TS server restart to pick up new models
    await db.openRouterLog.create({
      data: {
        model,
        inputText,
        outputText,
        inputTokens,
        outputTokens,
        totalTokens,
        inputCost,
        outputCost,
        totalCost,
      },
    });
  } catch (error) {
    console.error("Failed to log OpenRouter API call:", error);
  }
}

/**
 * Calls OpenRouter API to generate AI responses.
 *
 * @param options - Configuration including prompt and optional JSON schema
 * @param options.prompt - The prompt to send to the AI model
 * @param options.model - Optional model identifier (e.g., "openai/gpt-4")
 * @param options.jsonSchema - Optional JSON schema to constrain the AI response format
 * @param options.temperature - Optional temperature for response randomness (0-2)
 * @param options.maxTokens - Optional maximum tokens in response
 * @returns A promise that resolves to the typed response with usage and cost info
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
 * console.log(result.data.message);
 * console.log(`Cost: $${result.cost.totalCost.toFixed(6)}`);
 * ```
 */
export async function openrouter<T>(options: OpenRouterOptions): Promise<OpenRouterResult<T>> {
  const model = options.model || "anthropic/claude-sonnet-4.5";

  // Get model pricing (cached)
  const pricing = await getModelPricing(model);

  // Build request parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestParams: any = {
    model,
    messages: [{ role: "user", content: options.prompt }],
  };

  // Add optional parameters
  if (options.temperature !== undefined) {
    requestParams.temperature = options.temperature;
  }

  if (options.maxTokens !== undefined) {
    requestParams.maxTokens = options.maxTokens;
  }

  // Add JSON schema for structured output if provided
  if (options.jsonSchema) {
    requestParams.responseFormat = {
      type: "json_schema",
      jsonSchema: {
        name: "response",
        strict: true,
        schema: options.jsonSchema,
      },
    };
  }

  // Make the API call
  const response = await client.chat.send(requestParams);

  // Extract response content - handle both streaming and non-streaming responses
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseData = response as any;

  // Debug: log response structure to find usage data
  if (process.env.DEBUG_OPENROUTER) {
    console.log("OpenRouter response keys:", Object.keys(responseData));
    console.log("OpenRouter usage:", JSON.stringify(responseData.usage, null, 2));
  }

  const content = responseData.choices?.[0]?.message?.content || "";

  // Parse response if JSON schema was provided
  let parsedContent: T;
  if (options.jsonSchema) {
    try {
      parsedContent = JSON.parse(content) as T;
    } catch {
      console.error("Failed to parse JSON response:", content);
      parsedContent = { message: content } as T;
    }
  } else {
    parsedContent = { message: content } as T;
  }

  // Extract usage information - OpenRouter SDK may use camelCase
  const inputTokens = responseData.usage?.prompt_tokens || responseData.usage?.promptTokens || 0;
  const outputTokens =
    responseData.usage?.completion_tokens || responseData.usage?.completionTokens || 0;
  const totalTokens =
    responseData.usage?.total_tokens ||
    responseData.usage?.totalTokens ||
    inputTokens + outputTokens;

  // Calculate costs
  const cost = calculateCost(inputTokens, outputTokens, pricing);

  // Log the API call to the database
  await logApiCall(
    model,
    options.prompt,
    content,
    inputTokens,
    outputTokens,
    totalTokens,
    cost.inputCost,
    cost.outputCost,
    cost.totalCost
  );

  return {
    data: parsedContent,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens,
    },
    cost,
  };
}

/**
 * Simple wrapper that returns just the data (for backward compatibility)
 */
export async function openrouterSimple<T>(options: OpenRouterOptions): Promise<T> {
  const result = await openrouter<T>(options);
  return result.data;
}

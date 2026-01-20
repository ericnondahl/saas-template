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

// Streaming types - no jsonSchema support since partial JSON chunks aren't useful
export interface OpenRouterStreamingOptions {
  model?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenRouterStreamChunk {
  type: "content";
  content: string;
}

export interface OpenRouterStreamComplete {
  type: "complete";
  content: string;
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

export type OpenRouterStreamEvent = OpenRouterStreamChunk | OpenRouterStreamComplete;

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
export async function openRouter<T>(options: OpenRouterOptions): Promise<OpenRouterResult<T>> {
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
 * Calls OpenRouter API with streaming support for progressive text responses.
 *
 * @param options - Configuration including prompt and model settings
 * @param options.prompt - The prompt to send to the AI model
 * @param options.model - Optional model identifier (defaults to claude-sonnet-4.5)
 * @param options.temperature - Optional temperature for response randomness (0-2)
 * @param options.maxTokens - Optional maximum tokens in response
 * @yields OpenRouterStreamChunk for each content chunk, then OpenRouterStreamComplete with final data
 *
 * @example
 * ```typescript
 * const stream = openRouterStreaming({
 *   prompt: "Tell me a story",
 *   model: "anthropic/claude-sonnet-4.5",
 * });
 *
 * for await (const event of stream) {
 *   if (event.type === "content") {
 *     process.stdout.write(event.content);
 *   } else if (event.type === "complete") {
 *     console.log("\nCost:", event.cost.totalCost);
 *   }
 * }
 * ```
 */
export async function* openRouterStreaming(
  options: OpenRouterStreamingOptions
): AsyncGenerator<OpenRouterStreamEvent> {
  const model = options.model || "anthropic/claude-sonnet-4.5";

  // Get model pricing (cached)
  const pricing = await getModelPricing(model);

  // Build request parameters with streaming enabled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestParams: any = {
    model,
    messages: [{ role: "user", content: options.prompt }],
    stream: true,
    streamOptions: { includeUsage: true },
  };

  // Add optional parameters
  if (options.temperature !== undefined) {
    requestParams.temperature = options.temperature;
  }

  if (options.maxTokens !== undefined) {
    requestParams.maxTokens = options.maxTokens;
  }

  // Make the streaming API call
  const stream = await client.chat.send(requestParams);

  // Accumulate content for logging
  let fullContent = "";
  let finalUsage: { inputTokens: number; outputTokens: number; totalTokens: number } | null = null;

  // Iterate over stream chunks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of stream as any) {
    // Extract content from delta
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      fullContent += content;
      yield { type: "content", content };
    }

    // Check for usage info in final chunk
    if (chunk.usage) {
      const inputTokens =
        chunk.usage.prompt_tokens || chunk.usage.promptTokens || 0;
      const outputTokens =
        chunk.usage.completion_tokens || chunk.usage.completionTokens || 0;
      const totalTokens =
        chunk.usage.total_tokens || chunk.usage.totalTokens || inputTokens + outputTokens;

      finalUsage = { inputTokens, outputTokens, totalTokens };
    }
  }

  // Calculate costs and log
  const usage = finalUsage || { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  const cost = calculateCost(usage.inputTokens, usage.outputTokens, pricing);

  // Log the API call to the database
  await logApiCall(
    model,
    options.prompt,
    fullContent,
    usage.inputTokens,
    usage.outputTokens,
    usage.totalTokens,
    cost.inputCost,
    cost.outputCost,
    cost.totalCost
  );

  // Yield final complete event
  yield {
    type: "complete",
    content: fullContent,
    usage,
    cost,
  };
}

import { desc } from "drizzle-orm";
import type { ApiResponse } from "@saas-template/shared";
import { requireAdminAuth } from "../services/admin.server";
import { db } from "../services/db.server";
import { openRouterLogs } from "../db/schema";

export interface OpenRouterLogDTO {
  id: string;
  model: string;
  inputText: string;
  outputText: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: string;
  outputCost: string;
  totalCost: string;
  createdAt: string;
}

/**
 * GET /api/admin/openrouter-logs
 * Returns the most recent 50 OpenRouter API call logs (admin only).
 */
export async function loader(args: any) {
  // Verify admin access
  await requireAdminAuth(args);

  // Fetch most recent 50 logs from database
  const logs = await db.query.openRouterLogs.findMany({
    orderBy: desc(openRouterLogs.createdAt),
    limit: 50,
  });

  const formattedLogs: OpenRouterLogDTO[] = logs.map((log) => ({
    id: log.id,
    model: log.model,
    inputText: log.inputText,
    outputText: log.outputText,
    inputTokens: log.inputTokens,
    outputTokens: log.outputTokens,
    totalTokens: log.totalTokens,
    inputCost: log.inputCost,
    outputCost: log.outputCost,
    totalCost: log.totalCost,
    createdAt: log.createdAt.toISOString(),
  }));

  return Response.json({
    success: true,
    data: formattedLogs,
  } as ApiResponse<OpenRouterLogDTO[]>);
}

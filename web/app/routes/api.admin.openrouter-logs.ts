import type { ApiResponse } from "@saas-template/shared";
import { requireAdminAuth } from "../services/admin.server";
import { db } from "../services/db.server";

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
  // Using type assertion as Prisma types may need TS server restart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = await (db as any).openRouterLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Convert Decimal fields to strings for JSON serialization
  const formattedLogs: OpenRouterLogDTO[] = logs.map(
    (log: {
      id: string;
      model: string;
      inputText: string;
      outputText: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      inputCost: { toString: () => string };
      outputCost: { toString: () => string };
      totalCost: { toString: () => string };
      createdAt: Date;
    }) => ({
      id: log.id,
      model: log.model,
      inputText: log.inputText,
      outputText: log.outputText,
      inputTokens: log.inputTokens,
      outputTokens: log.outputTokens,
      totalTokens: log.totalTokens,
      inputCost: log.inputCost.toString(),
      outputCost: log.outputCost.toString(),
      totalCost: log.totalCost.toString(),
      createdAt: log.createdAt.toISOString(),
    })
  );

  return Response.json({
    success: true,
    data: formattedLogs,
  } as ApiResponse<OpenRouterLogDTO[]>);
}

import type { ApiResponse } from "@saas-template/shared";
import { requireAdminAuth } from "../services/admin.server";
import { db } from "../services/db.server";

export interface DailyUsage {
  date: string;
  calls: number;
  totalTokens: number;
  totalCost: number;
}

export interface ModelUsage {
  model: string;
  calls: number;
  totalTokens: number;
  totalCost: number;
}

export interface UsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  dailyUsage: DailyUsage[];
  modelUsage: ModelUsage[];
}

/**
 * GET /api/admin/openrouter-usage?days=7
 * Returns aggregated OpenRouter usage statistics (admin only).
 */
export async function loader(args: any) {
  // Verify admin access
  await requireAdminAuth(args);

  // Get days parameter from query string (default to 7)
  const url = new URL(args.request.url);
  const days = parseInt(url.searchParams.get("days") || "7", 10);

  // Calculate the start date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Fetch logs within the date range
  // Using type assertion as Prisma types may need TS server restart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = await (db as any).openRouterLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Calculate totals
  let totalCalls = 0;
  let totalTokens = 0;
  let totalCost = 0;

  // Group by date for daily usage
  const dailyMap = new Map<string, { calls: number; totalTokens: number; totalCost: number }>();

  // Group by model for model usage
  const modelMap = new Map<string, { calls: number; totalTokens: number; totalCost: number }>();

  for (const log of logs) {
    const cost = parseFloat(log.totalCost.toString());
    const tokens = log.totalTokens;

    totalCalls++;
    totalTokens += tokens;
    totalCost += cost;

    // Daily aggregation
    const dateKey = log.createdAt.toISOString().split("T")[0];
    const dailyEntry = dailyMap.get(dateKey) || {
      calls: 0,
      totalTokens: 0,
      totalCost: 0,
    };
    dailyEntry.calls++;
    dailyEntry.totalTokens += tokens;
    dailyEntry.totalCost += cost;
    dailyMap.set(dateKey, dailyEntry);

    // Model aggregation
    const modelEntry = modelMap.get(log.model) || {
      calls: 0,
      totalTokens: 0,
      totalCost: 0,
    };
    modelEntry.calls++;
    modelEntry.totalTokens += tokens;
    modelEntry.totalCost += cost;
    modelMap.set(log.model, modelEntry);
  }

  // Convert maps to arrays
  const dailyUsage: DailyUsage[] = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      calls: data.calls,
      totalTokens: data.totalTokens,
      totalCost: parseFloat(data.totalCost.toFixed(8)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const modelUsage: ModelUsage[] = Array.from(modelMap.entries())
    .map(([model, data]) => ({
      model,
      calls: data.calls,
      totalTokens: data.totalTokens,
      totalCost: parseFloat(data.totalCost.toFixed(8)),
    }))
    .sort((a, b) => b.totalCost - a.totalCost);

  const summary: UsageSummary = {
    totalCalls,
    totalTokens,
    totalCost: parseFloat(totalCost.toFixed(8)),
    dailyUsage,
    modelUsage,
  };

  return Response.json({
    success: true,
    data: summary,
  } as ApiResponse<UsageSummary>);
}

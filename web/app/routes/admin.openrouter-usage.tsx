import { useEffect, useState } from "react";
import type { ApiResponse } from "@saas-template/shared";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailyUsage {
  date: string;
  calls: number;
  totalTokens: number;
  totalCost: number;
}

interface ModelUsage {
  model: string;
  calls: number;
  totalTokens: number;
  totalCost: number;
}

interface UsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  dailyUsage: DailyUsage[];
  modelUsage: ModelUsage[];
}

type TimePeriod = 7 | 30 | 90;

export default function OpenRouterUsagePage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<TimePeriod>(7);

  useEffect(() => {
    fetchUsage();
  }, [days]);

  const fetchUsage = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/openrouter-usage?days=${days}`);
      const data = (await response.json()) as ApiResponse<UsageSummary>;

      if (data.success && data.data) {
        setSummary(data.data);
      } else {
        setError(data.error?.message || "Failed to load usage data");
      }
    } catch (err) {
      console.error("Error fetching usage:", err);
      setError("Failed to load usage data");
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return "$0.00";
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    return `$${cost.toFixed(4)}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDateLabel = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-center text-gray-600">Loading usage data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-900">Error: {error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Prepare chart data with formatted dates
  const chartData = summary.dailyUsage.map((d) => ({
    ...d,
    dateLabel: formatDateLabel(d.date),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OpenRouter Usage Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor API usage and costs over time</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex space-x-2">
          {([7, 30, 90] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setDays(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === period
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {period}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cost</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCost(summary.totalCost)}</p>
          <p className="mt-1 text-sm text-gray-500">Last {days} days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Total API Calls
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatNumber(summary.totalCalls)}
          </p>
          <p className="mt-1 text-sm text-gray-500">Last {days} days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Total Tokens
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatNumber(summary.totalTokens)}
          </p>
          <p className="mt-1 text-sm text-gray-500">Last {days} days</p>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Over Time */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(4)}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCost(value as number), "Cost"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalCost"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6" }}
                    name="Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Call Volume */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily API Calls</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [formatNumber(value as number), "Calls"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="calls" fill="#10B981" name="API Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No usage data available for the selected period</p>
        </div>
      )}

      {/* Model Usage Table */}
      {summary.modelUsage.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Usage by Model</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.modelUsage.map((model) => (
                <tr key={model.model} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {model.model}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(model.calls)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(model.totalTokens)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCost(model.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

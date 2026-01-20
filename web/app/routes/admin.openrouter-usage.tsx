import { useEffect, useState } from "react";
import { DollarSign, Activity, Zap } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Alert,
  AlertDescription,
  Skeleton,
} from "~/components/ui";

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((p) => (
              <Skeleton key={p} className="h-9 w-14" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            OpenRouter Usage Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor API usage and costs over time
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-1">
          {([7, 30, 90] as TimePeriod[]).map((period) => (
            <Button
              key={period}
              variant={days === period ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(period)}
            >
              {period}d
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCost(summary.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total API Calls
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(summary.totalCalls)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tokens
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(summary.totalTokens)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cost Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toFixed(4)}`}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      formatter={(value) => [formatCost(value as number), "Cost"]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalCost"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--foreground))" }}
                      name="Cost"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily Call Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Daily API Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      formatter={(value) => [formatNumber(value as number), "Calls"]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="calls"
                      fill="hsl(var(--primary))"
                      name="API Calls"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No usage data available for the selected period
            </p>
          </CardContent>
        </Card>
      )}

      {/* Model Usage Table */}
      {summary.modelUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Model</CardTitle>
            <CardDescription>
              Breakdown of API usage across different models
            </CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.modelUsage.map((model) => (
                <TableRow key={model.model}>
                  <TableCell>
                    <Badge variant="secondary">{model.model}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatNumber(model.calls)}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatNumber(model.totalTokens)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCost(model.totalCost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

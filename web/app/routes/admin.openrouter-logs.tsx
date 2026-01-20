import { useEffect, useState, Fragment } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ApiResponse } from "@saas-template/shared";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
} from "~/components/ui";

interface OpenRouterLog {
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

export default function OpenRouterLogsPage() {
  const [logs, setLogs] = useState<OpenRouterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/openrouter-logs");
      const data = (await response.json()) as ApiResponse<OpenRouterLog[]>;

      if (data.success && data.data) {
        setLogs(data.data);
      } else {
        setError(data.error?.message || "Failed to load logs");
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCost = (cost: string) => {
    const num = parseFloat(cost);
    if (num === 0) return "$0.00";
    if (num < 0.01) return `$${num.toFixed(6)}`;
    return `$${num.toFixed(4)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">OpenRouter API Logs</h1>
        <p className="text-muted-foreground mt-2">
          View the most recent 50 API calls to OpenRouter
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Input</TableHead>
              <TableHead>Output</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <Fragment key={log.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <TableCell className="w-8">
                    {expandedId === log.id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-foreground">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.model}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div
                      className="truncate text-muted-foreground"
                      title={log.inputText}
                    >
                      {truncateText(log.inputText, 50)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div
                      className="truncate text-muted-foreground"
                      title={log.outputText}
                    >
                      {truncateText(log.outputText, 50)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      <span>In: {log.inputTokens}</span>
                      <br />
                      <span>Out: {log.outputTokens}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCost(log.totalCost)}
                  </TableCell>
                </TableRow>
                {expandedId === log.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/50 p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Full Input:
                          </h4>
                          <pre className="text-sm text-muted-foreground bg-background p-3 rounded-md border border-border whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {log.inputText}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Full Output:
                          </h4>
                          <pre className="text-sm text-muted-foreground bg-background p-3 rounded-md border border-border whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {log.outputText}
                          </pre>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Input Cost:</span>{" "}
                            <span className="font-medium text-foreground">
                              {formatCost(log.inputCost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Output Cost:</span>{" "}
                            <span className="font-medium text-foreground">
                              {formatCost(log.outputCost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Cost:</span>{" "}
                            <span className="font-medium text-foreground">
                              {formatCost(log.totalCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No API logs found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

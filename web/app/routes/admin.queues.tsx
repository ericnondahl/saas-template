import { useEffect, useState, Fragment } from "react";
import { RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
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
  Button,
  Select,
  Label,
  Alert,
  AlertDescription,
  Skeleton,
} from "~/components/ui";
import { cn } from "~/lib/utils";

interface QueueSummary {
  name: string;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
}

interface JobDetail {
  id: string;
  name: string;
  data: Record<string, unknown>;
  status: string;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  attemptsMade: number;
  progress: number | string | boolean | object;
}

type JobStatus = "waiting" | "active" | "completed" | "failed" | "delayed" | "paused" | "all";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  waiting: "secondary",
  active: "outline",
  completed: "default",
  failed: "destructive",
  delayed: "secondary",
  paused: "secondary",
};

export default function QueuesPage() {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [jobs, setJobs] = useState<JobDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus>("all");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchQueues();
  }, []);

  useEffect(() => {
    if (selectedQueue) {
      fetchJobs(selectedQueue, selectedStatus);
    }
  }, [selectedQueue, selectedStatus]);

  const fetchQueues = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/queues");
      const data = (await response.json()) as ApiResponse<QueueSummary[]>;

      if (data.success && data.data) {
        setQueues(data.data);
      } else {
        setError(data.error?.message || "Failed to load queues");
      }
    } catch (err) {
      console.error("Error fetching queues:", err);
      setError("Failed to load queues");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (queueName: string, status: JobStatus) => {
    setJobsLoading(true);

    try {
      const statusParam = status === "all" ? "" : `&status=${status}`;
      const response = await fetch(`/api/admin/queues?queue=${queueName}${statusParam}`);
      const data = (await response.json()) as ApiResponse<JobDetail[]>;

      if (data.success && data.data) {
        setJobs(data.data);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTotalJobs = (counts: QueueSummary["counts"]) => {
    return (
      counts.waiting +
      counts.active +
      counts.completed +
      counts.failed +
      counts.delayed +
      counts.paused
    );
  };

  const handleRefresh = () => {
    fetchQueues();
    if (selectedQueue) {
      fetchJobs(selectedQueue, selectedStatus);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2 mt-3">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-16" />
                  ))}
                </div>
              </CardContent>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Queues</h1>
          <p className="text-muted-foreground mt-2">
            Monitor BullMQ job queues and their status
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Queue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queues.map((queue) => (
          <Card
            key={queue.name}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedQueue === queue.name && "ring-2 ring-ring"
            )}
            onClick={() => {
              setSelectedQueue(queue.name);
              setSelectedStatus("all");
              setExpandedJobId(null);
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{queue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">
                Total Jobs:{" "}
                <span className="font-medium text-foreground">
                  {getTotalJobs(queue.counts)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(queue.counts).map(([status, count]) => {
                  // Only show destructive variant for failed if count > 0
                  const variant =
                    status === "failed" && count === 0
                      ? "secondary"
                      : STATUS_VARIANTS[status] || "secondary";
                  return (
                    <Badge key={status} variant={variant} className="text-xs">
                      {status}: {count}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {queues.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No queues registered</p>
          </CardContent>
        </Card>
      )}

      {/* Job Details Section */}
      {selectedQueue && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Jobs in {selectedQueue}</CardTitle>
            <div className="flex items-center gap-3">
              <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
                Filter:
              </Label>
              <Select
                id="status-filter"
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as JobStatus)}
                className="w-36"
              >
                <option value="all">All</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="delayed">Delayed</option>
                <option value="paused">Paused</option>
              </Select>
            </div>
          </CardHeader>

          {jobsLoading ? (
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading jobs...
            </CardContent>
          ) : jobs.length === 0 ? (
            <CardContent className="py-8 text-center text-muted-foreground">
              No jobs found
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Attempts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <Fragment key={job.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedJobId(expandedJobId === job.id ? null : job.id)
                      }
                    >
                      <TableCell className="w-8">
                        {expandedJobId === job.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-foreground">
                        {job.id}
                      </TableCell>
                      <TableCell className="text-foreground">{job.name}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[job.status] || "secondary"}>
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(job.timestamp)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {job.attemptsMade}
                      </TableCell>
                    </TableRow>
                    {expandedJobId === job.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/50 p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">
                                Job Data:
                              </h4>
                              <pre className="text-sm text-muted-foreground bg-background p-3 rounded-md border border-border whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {JSON.stringify(job.data, null, 2)}
                              </pre>
                            </div>
                            {job.failedReason && (
                              <div>
                                <h4 className="text-sm font-medium text-destructive mb-2">
                                  Error:
                                </h4>
                                <pre className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {job.failedReason}
                                </pre>
                              </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Created:</span>{" "}
                                <span className="font-medium text-foreground">
                                  {formatDate(job.timestamp)}
                                </span>
                              </div>
                              {job.processedOn && (
                                <div>
                                  <span className="text-muted-foreground">Processed:</span>{" "}
                                  <span className="font-medium text-foreground">
                                    {formatDate(job.processedOn)}
                                  </span>
                                </div>
                              )}
                              {job.finishedOn && (
                                <div>
                                  <span className="text-muted-foreground">Finished:</span>{" "}
                                  <span className="font-medium text-foreground">
                                    {formatDate(job.finishedOn)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Progress:</span>{" "}
                                <span className="font-medium text-foreground">
                                  {typeof job.progress === "number"
                                    ? `${job.progress}%`
                                    : typeof job.progress === "string"
                                      ? job.progress
                                      : typeof job.progress === "boolean"
                                        ? String(job.progress)
                                        : JSON.stringify(job.progress)}
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
          )}
        </Card>
      )}
    </div>
  );
}

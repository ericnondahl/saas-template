import { useEffect, useState } from "react";
import type { ApiResponse } from "@saas-template/shared";

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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  waiting: { bg: "bg-gray-100", text: "text-gray-800" },
  active: { bg: "bg-yellow-100", text: "text-yellow-800" },
  completed: { bg: "bg-green-100", text: "text-green-800" },
  failed: { bg: "bg-red-100", text: "text-red-800" },
  delayed: { bg: "bg-blue-100", text: "text-blue-800" },
  paused: { bg: "bg-purple-100", text: "text-purple-800" },
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
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-center text-gray-600">Loading queues...</p>
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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Queues</h1>
          <p className="text-gray-600 mt-2">Monitor BullMQ job queues and their status</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Queue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {queues.map((queue) => (
          <div
            key={queue.name}
            onClick={() => {
              setSelectedQueue(queue.name);
              setSelectedStatus("all");
              setExpandedJobId(null);
            }}
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedQueue === queue.name ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{queue.name}</h3>
            <div className="text-sm text-gray-600 mb-3">
              Total Jobs: <span className="font-medium">{getTotalJobs(queue.counts)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(queue.counts).map(([status, count]) => (
                <span
                  key={status}
                  className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[status]?.bg || "bg-gray-100"} ${STATUS_COLORS[status]?.text || "text-gray-800"}`}
                >
                  {status}: {count}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {queues.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No queues registered</p>
        </div>
      )}

      {/* Job Details Section */}
      {selectedQueue && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Jobs in {selectedQueue}</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm text-gray-600">
                Filter by status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as JobStatus)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="delayed">Delayed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          {jobsLoading ? (
            <div className="p-8 text-center text-gray-600">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No jobs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempts
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <>
                      <tr
                        key={job.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                          {job.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {job.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[job.status]?.bg || "bg-gray-100"} ${STATUS_COLORS[job.status]?.text || "text-gray-800"}`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(job.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {job.attemptsMade}
                        </td>
                      </tr>
                      {expandedJobId === job.id && (
                        <tr key={`${job.id}-expanded`}>
                          <td colSpan={5} className="px-4 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Job Data:
                                </h4>
                                <pre className="text-sm text-gray-600 bg-white p-3 rounded border whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {JSON.stringify(job.data, null, 2)}
                                </pre>
                              </div>
                              {job.failedReason && (
                                <div>
                                  <h4 className="text-sm font-medium text-red-700 mb-2">Error:</h4>
                                  <pre className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200 whitespace-pre-wrap max-h-48 overflow-y-auto">
                                    {job.failedReason}
                                  </pre>
                                </div>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Created:</span>{" "}
                                  <span className="font-medium">{formatDate(job.timestamp)}</span>
                                </div>
                                {job.processedOn && (
                                  <div>
                                    <span className="text-gray-500">Processed:</span>{" "}
                                    <span className="font-medium">
                                      {formatDate(job.processedOn)}
                                    </span>
                                  </div>
                                )}
                                {job.finishedOn && (
                                  <div>
                                    <span className="text-gray-500">Finished:</span>{" "}
                                    <span className="font-medium">
                                      {formatDate(job.finishedOn)}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-500">Progress:</span>{" "}
                                  <span className="font-medium">
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
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

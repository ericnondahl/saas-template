import type { ApiResponse } from "@saas-template/shared";
import { requireAdminAuth } from "../services/admin.server";
import { allQueues, getQueueByName } from "../jobs";

/**
 * Queue summary with job counts by status.
 */
export interface QueueSummary {
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

/**
 * Job details for display in admin UI.
 */
export interface JobDetail {
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

type LoaderResponse = ApiResponse<QueueSummary[] | JobDetail[]>;

/**
 * GET /api/admin/queues
 * Returns queue summaries or job details based on query parameters.
 *
 * Query parameters:
 *   - queue: Queue name to get jobs from (optional)
 *   - status: Job status to filter by (optional, requires queue)
 *
 * Without query params: Returns all queue summaries with job counts.
 * With queue param: Returns jobs from that queue.
 * With queue + status: Returns jobs with that status from that queue.
 */
export async function loader(args: { request: Request }): Promise<Response> {
  // Verify admin access
  await requireAdminAuth(args);

  const url = new URL(args.request.url);
  const queueName = url.searchParams.get("queue");
  const status = url.searchParams.get("status");

  // If queue name is provided, return job details
  if (queueName) {
    const queue = getQueueByName(queueName);

    if (!queue) {
      return Response.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Queue "${queueName}" not found`,
          },
        } as LoaderResponse,
        { status: 404 }
      );
    }

    // Get jobs based on status filter
    const validStatuses = [
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
      "paused",
    ] as const;
    const statuses =
      status && validStatuses.includes(status as (typeof validStatuses)[number])
        ? [status as (typeof validStatuses)[number]]
        : [...validStatuses];

    const jobs = await queue.getJobs(statuses, 0, 100);

    const jobDetails: JobDetail[] = await Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState();
        return {
          id: job.id || "unknown",
          name: job.name,
          data: job.data as Record<string, unknown>,
          status: state,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          failedReason: job.failedReason,
          attemptsMade: job.attemptsMade,
          progress: job.progress,
        };
      })
    );

    // Sort by timestamp descending (most recent first)
    jobDetails.sort((a, b) => b.timestamp - a.timestamp);

    return Response.json({
      success: true,
      data: jobDetails,
    } as LoaderResponse);
  }

  // Return queue summaries
  const summaries: QueueSummary[] = await Promise.all(
    allQueues.map(async (queue) => {
      const counts = await queue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed",
        "paused"
      );

      return {
        name: queue.name,
        counts: {
          waiting: counts.waiting || 0,
          active: counts.active || 0,
          completed: counts.completed || 0,
          failed: counts.failed || 0,
          delayed: counts.delayed || 0,
          paused: counts.paused || 0,
        },
      };
    })
  );

  return Response.json({
    success: true,
    data: summaries,
  } as LoaderResponse);
}

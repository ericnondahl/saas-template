import type { ApiError, ApiResponse, PaginatedResponse } from "../types/api";

/** Build a successful ApiResponse envelope. */
export function apiSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

/** Build a failed ApiResponse envelope. */
export function apiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> {
  const error: ApiError = { code, message, ...(details ? { details } : {}) };
  return { success: false, error };
}

/** Build a PaginatedResponse from a page of items and the total row count. */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    },
  };
}

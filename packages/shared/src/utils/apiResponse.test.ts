import { describe, expect, it } from "vitest";
import { apiError, apiSuccess, paginatedResponse } from "./apiResponse";

describe("apiSuccess", () => {
  it("wraps data in a success envelope", () => {
    expect(apiSuccess({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
  });
});

describe("apiError", () => {
  it("wraps code and message in an error envelope", () => {
    expect(apiError("NOT_FOUND", "User not found")).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "User not found" },
    });
  });

  it("includes details only when provided", () => {
    const res = apiError("VALIDATION", "Bad input", { field: "email" });
    expect(res.error?.details).toEqual({ field: "email" });
    expect(apiError("VALIDATION", "Bad input").error).not.toHaveProperty("details");
  });
});

describe("paginatedResponse", () => {
  it("computes totalPages with a partial final page", () => {
    const res = paginatedResponse([1, 2, 3], 1, 10, 25);
    expect(res.pagination).toEqual({ page: 1, pageSize: 10, total: 25, totalPages: 3 });
  });

  it("handles an empty result set", () => {
    expect(paginatedResponse([], 1, 10, 0).pagination.totalPages).toBe(0);
  });

  it("guards against a zero page size", () => {
    expect(paginatedResponse([], 1, 0, 10).pagination.totalPages).toBe(0);
  });
});

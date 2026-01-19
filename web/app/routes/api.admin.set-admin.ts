import type { ApiResponse } from "@saas-template/shared";
import { requireAdminAuth } from "../services/admin.server";
import { db } from "../services/db.server";

interface SetAdminRequest {
  userId: string;
  isAdmin: boolean;
}

interface SetAdminResponse {
  userId: string;
  isAdmin: boolean;
}

/**
 * POST /api/admin/set-admin
 * Updates a user's admin status (admin only).
 */
export async function action(args: any) {
  // Verify admin access
  await requireAdminAuth(args);

  // Parse request body
  const request = args.request;
  const body = (await request.json()) as SetAdminRequest;

  if (!body.userId) {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "userId is required",
        },
      } as ApiResponse,
      { status: 400 }
    );
  }

  if (typeof body.isAdmin !== "boolean") {
    return Response.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "isAdmin must be a boolean",
        },
      } as ApiResponse,
      { status: 400 }
    );
  }

  // Update user's admin status
  const updatedUser = await db.user.update({
    where: { id: body.userId },
    data: { isAdmin: body.isAdmin },
    select: { id: true, isAdmin: true },
  });

  return Response.json({
    success: true,
    data: {
      userId: updatedUser.id,
      isAdmin: updatedUser.isAdmin,
    },
  } as ApiResponse<SetAdminResponse>);
}

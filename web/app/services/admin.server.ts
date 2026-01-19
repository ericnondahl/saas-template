import { getAuth } from "@clerk/react-router/server";
import type { ApiResponse } from "@saas-template/shared";
import type { User as PrismaUser } from "@prisma/client";
import { getUserByClerkId } from "./user.server";

/**
 * Requires the current user to be authenticated and an admin.
 * Returns the admin user if authorized, or throws a Response with appropriate error.
 */
export async function requireAdminAuth(args: any): Promise<PrismaUser> {
  const { userId } = await getAuth(args);

  if (!userId) {
    throw Response.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      } as ApiResponse,
      { status: 401 }
    );
  }

  const user = await getUserByClerkId(userId);

  if (!user) {
    throw Response.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found in database",
        },
      } as ApiResponse,
      { status: 404 }
    );
  }

  if (!user.isAdmin) {
    throw Response.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
      } as ApiResponse,
      { status: 403 }
    );
  }

  return user;
}

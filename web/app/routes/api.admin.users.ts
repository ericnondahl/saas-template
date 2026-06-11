import { asc } from "drizzle-orm";
import type { ApiResponse } from "@saas-template/shared";
import { requireAdminAuth } from "../services/admin.server";
import { db } from "../services/db.server";
import { users } from "../db/schema";

export interface AdminUserDTO {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

/**
 * GET /api/admin/users
 * Returns list of all users (admin only).
 */
export async function loader(args: any) {
  // Verify admin access
  await requireAdminAuth(args);

  // Fetch all users from database
  const allUsers = await db.query.users.findMany({
    orderBy: asc(users.email),
    columns: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isAdmin: true,
    },
  });

  return Response.json({
    success: true,
    data: allUsers,
  } as ApiResponse<AdminUserDTO[]>);
}

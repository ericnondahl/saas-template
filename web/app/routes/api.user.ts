import { getAuth } from "@clerk/react-router/server";
import type { ApiResponse, UserDTO } from "@saas-template/shared";
import { getUserDTOByClerkId } from "../services/user.server";

/**
 * GET /api/user
 * Returns the current user's data from the database.
 * Requires authentication via Clerk.
 */
export async function loader(args: any) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return Response.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      } as ApiResponse<UserDTO>,
      { status: 401 }
    );
  }

  const user = await getUserDTOByClerkId(userId);

  if (!user) {
    return Response.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "User not found in database",
        },
      } as ApiResponse<UserDTO>,
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    data: user,
  } as ApiResponse<UserDTO>);
}

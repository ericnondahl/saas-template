import { getAuth } from "@clerk/react-router/server";
import { createClerkClient } from "@clerk/react-router/api.server";
import type { Route } from "./+types/api.sync-user";
import { syncUser } from "../services/user.server";

export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkUser = await clerkClient.users.getUser(userId);
    await syncUser(clerkUser);

    return Response.json({ success: true, userId });
  } catch (error) {
    console.error("[API] Error syncing user:", error);
    return new Response("Error syncing user", { status: 500 });
  }
}

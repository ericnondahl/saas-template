import { getAuth, createClerkClient } from "@clerk/react-router/server";
import type { Route } from "./+types/api.sync-user";
import { syncUser } from "../services/user.server";

export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Parse optional data from request body (name from Apple Sign-In, timezone, etc.)
    let appleFirstName: string | undefined;
    let appleLastName: string | undefined;
    let timezone: string | undefined;
    let platform: string | undefined;
    let clientVersion: string | undefined;
    try {
      const body = await args.request.json();
      if (body?.firstName && typeof body.firstName === "string") {
        appleFirstName = body.firstName;
      }
      if (body?.lastName && typeof body.lastName === "string") {
        appleLastName = body.lastName;
      }
      if (body?.timezone && typeof body.timezone === "string") {
        timezone = body.timezone;
      }
      if (body?.platform && typeof body.platform === "string") {
        platform = body.platform;
      }
      if (body?.clientVersion && typeof body.clientVersion === "string") {
        clientVersion = body.clientVersion;
      }
    } catch {
      // No body or invalid JSON - that's fine, clients may not send one
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    let clerkUser = await clerkClient.users.getUser(userId);

    // If the Clerk user is missing name data but we received it from Apple's
    // native credential, update the Clerk user record so it becomes the
    // source of truth. Apple provides the name only on first authorization,
    // so this is the one chance to capture it.
    if (appleFirstName || appleLastName) {
      const needsUpdate =
        (!clerkUser.firstName && appleFirstName) || (!clerkUser.lastName && appleLastName);

      if (needsUpdate) {
        console.log(
          `[API] Updating Clerk user ${userId} with Apple name: ${appleFirstName} ${appleLastName}`
        );
        clerkUser = await clerkClient.users.updateUser(userId, {
          firstName: appleFirstName ?? clerkUser.firstName ?? undefined,
          lastName: appleLastName ?? clerkUser.lastName ?? undefined,
        });
      }
    }

    await syncUser(clerkUser, { timezone, platform, clientVersion });

    return Response.json({ success: true, userId });
  } catch (error) {
    console.error("[API] Error syncing user:", error);
    return new Response("Error syncing user", { status: 500 });
  }
}

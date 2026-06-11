import { eq } from "drizzle-orm";
import { db } from "./db.server";
import type { UserDTO } from "@saas-template/shared";
import { users, type User } from "../db/schema";
import { sendWelcomeEmail } from "./email.server";

interface ClerkUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

/** Optional client context sent alongside a sync (mobile sends these). */
interface SyncOptions {
  timezone?: string;
  platform?: string;
  clientVersion?: string;
}

/**
 * Syncs a Clerk user to the database.
 * Creates the user if they don't exist, or updates their info if they do.
 */
export async function syncUser(clerkUser: ClerkUser, options: SyncOptions = {}) {
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User has no email address");
  }

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  const isNewUser = !existingUser;

  // Only set client-context fields when the client sent them, so a sync from
  // a client that omits them doesn't blank out previously stored values.
  const clientContext = {
    ...(options.timezone ? { timezone: options.timezone } : {}),
    ...(options.platform ? { platform: options.platform } : {}),
    ...(options.clientVersion ? { clientVersion: options.clientVersion } : {}),
  };

  const [user] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      ...clientContext,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        ...clientContext,
        updatedAt: new Date(),
      },
    })
    .returning();

  // Send welcome email to new users
  if (isNewUser) {
    try {
      await sendWelcomeEmail(email, clerkUser.firstName);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't fail user creation if email fails
    }
  }

  return user;
}

/**
 * Gets a user from the database by their Clerk ID.
 */
export async function getUserByClerkId(clerkId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  return user ?? null;
}

/**
 * Converts a User row to a UserDTO (without timestamps).
 */
export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    isAdmin: user.isAdmin,
    emailSubscribed: user.emailSubscribed,
  };
}

/**
 * Gets a user DTO from the database by their Clerk ID.
 */
export async function getUserDTOByClerkId(clerkId: string): Promise<UserDTO | null> {
  const user = await getUserByClerkId(clerkId);
  return user ? userToDTO(user) : null;
}

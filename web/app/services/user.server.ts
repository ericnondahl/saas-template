import { db } from "./db.server";
import type { UserDTO } from "@saas-template/shared";
import type { User as PrismaUser } from "@prisma/client";

interface ClerkUser {
  id: string;
  emailAddresses: { emailAddress: string }[];
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

/**
 * Syncs a Clerk user to the database.
 * Creates the user if they don't exist, or updates their info if they do.
 */
export async function syncUser(clerkUser: ClerkUser) {
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User has no email address");
  }

  const user = await db.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });

  return user;
}

/**
 * Gets a user from the database by their Clerk ID.
 */
export async function getUserByClerkId(clerkId: string) {
  return db.user.findUnique({
    where: { clerkId },
  });
}

/**
 * Converts a Prisma User to a UserDTO (without timestamps).
 */
export function userToDTO(user: PrismaUser): UserDTO {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    isAdmin: user.isAdmin,
  };
}

/**
 * Gets a user DTO from the database by their Clerk ID.
 */
export async function getUserDTOByClerkId(clerkId: string): Promise<UserDTO | null> {
  const user = await getUserByClerkId(clerkId);
  return user ? userToDTO(user) : null;
}

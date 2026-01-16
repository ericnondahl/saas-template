/**
 * Auth service - wraps Clerk authentication
 * This abstraction makes it easy to swap auth providers if needed
 */

import { getAuth } from '@clerk/react-router/ssr.server';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { db } from './db.server';
import type { User } from '@saas-template/shared';

/**
 * Get the current authenticated user from Clerk
 */
export async function getCurrentUser(
  args: LoaderFunctionArgs | ActionFunctionArgs
): Promise<{ userId: string; user: User | null }> {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    return { userId: '', user: null };
  }

  // Get user from database
  const user = await db.user.findUnique({
    where: { clerkId: userId }
  });

  return { userId, user };
}

/**
 * Require authentication - throws redirect if not authenticated
 */
export async function requireAuth(
  args: LoaderFunctionArgs | ActionFunctionArgs
): Promise<{ userId: string; user: User }> {
  const { userId, user } = await getCurrentUser(args);

  if (!userId || !user) {
    throw redirect('/sign-in');
  }

  return { userId, user };
}

/**
 * Get or create user from Clerk data
 */
export async function getOrCreateUser(
  clerkId: string,
  email: string,
  firstName?: string | null,
  lastName?: string | null,
  imageUrl?: string | null
): Promise<User> {
  // Try to find existing user
  let user = await db.user.findUnique({
    where: { clerkId }
  });

  // Create user if doesn't exist
  if (!user) {
    user = await db.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        imageUrl
      }
    });
  }

  return user;
}

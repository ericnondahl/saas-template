/**
 * User type matching Prisma User model
 */
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  emailSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User data transfer object (without timestamps)
 */
export interface UserDTO {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isAdmin: boolean;
  emailSubscribed: boolean;
}

/**
 * User creation input
 */
export interface CreateUserInput {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

/**
 * User update input
 */
export interface UpdateUserInput {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { json } from "react-router";
import { requireAuth, cache } from "~/services";
import type { ApiResponse } from "@saas-template/shared";

/**
 * Example API GET endpoint
 * Returns the current user's information
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Require authentication
    const { user } = await requireAuth({ request } as LoaderFunctionArgs);

    // Example: Get some data from cache
    const cacheKey = `user:${user.id}:stats`;
    let stats = await cache.get<{ loginCount: number }>(cacheKey);

    if (!stats) {
      // In a real app, you might fetch this from the database
      stats = { loginCount: 0 };
      await cache.set(cacheKey, stats, 3600); // Cache for 1 hour
    }

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        stats
      }
    };

    return json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An error occurred'
      }
    };

    return json(response, { status: 500 });
  }
}

/**
 * Example API POST endpoint
 * Updates user preferences or settings
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Require authentication
    const { user } = await requireAuth({ request } as ActionFunctionArgs);

    // Parse request body
    const body = await request.json();
    const { preference, value } = body;

    // Validate input
    if (!preference || value === undefined) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Preference and value are required'
        }
      };
      return json(response, { status: 400 });
    }

    // In a real app, you would save this to the database
    // For now, just store it in cache as an example
    const cacheKey = `user:${user.id}:preferences`;
    const preferences = await cache.get<Record<string, unknown>>(cacheKey) || {};
    preferences[preference] = value;
    await cache.set(cacheKey, preferences, 86400); // Cache for 24 hours

    const response: ApiResponse = {
      success: true,
      data: { 
        message: 'Preference updated successfully',
        preferences 
      }
    };

    return json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An error occurred'
      }
    };

    return json(response, { status: 500 });
  }
}

import type { UserDTO } from "@saas-template/shared";

interface UserProfileProps {
  user: UserDTO;
}

/**
 * UserProfile component that displays user information using the shared UserDTO type.
 * This demonstrates type reusability across the web and mobile apps.
 */
export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full border border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={`${user.firstName || 'User'}'s profile`}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-2xl font-semibold">
              {user.firstName?.[0] || user.email[0].toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.firstName || "User"}
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          User Details
        </h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-gray-600 font-medium">User ID:</dt>
            <dd className="text-gray-900 font-mono text-sm">
              {user.id.slice(0, 12)}...
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 font-medium">Clerk ID:</dt>
            <dd className="text-gray-900 font-mono text-sm">
              {user.clerkId.slice(0, 12)}...
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 font-medium">First Name:</dt>
            <dd className="text-gray-900">{user.firstName || "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 font-medium">Last Name:</dt>
            <dd className="text-gray-900">{user.lastName || "Not set"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-900">
          <strong>💡 Shared Type:</strong> This component uses the{" "}
          <code className="bg-blue-100 px-1 rounded">UserDTO</code> type from{" "}
          <code className="bg-blue-100 px-1 rounded">@saas-template/shared</code>,
          ensuring type safety across web and mobile!
        </p>
      </div>
    </div>
  );
}

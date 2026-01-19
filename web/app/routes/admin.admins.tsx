import { useEffect, useState } from "react";
import type { ApiResponse } from "@saas-template/shared";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

export default function AdminsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users");
      const data = (await response.json()) as ApiResponse<AdminUser[]>;

      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        setError(data.error?.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    setUpdatingUserId(userId);

    try {
      const response = await fetch("/api/admin/set-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, isAdmin }),
      });

      const data = (await response.json()) as ApiResponse<{
        userId: string;
        isAdmin: boolean;
      }>;

      if (data.success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, isAdmin } : user
          )
        );
      } else {
        alert(data.error?.message || "Failed to update admin status");
      }
    } catch (err) {
      console.error("Error updating admin status:", err);
      alert("Failed to update admin status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-center text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-900">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-gray-600 mt-2">
          Manage admin privileges for users in the system
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.id.slice(0, 12)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={user.isAdmin}
                        onChange={(e) =>
                          handleToggleAdmin(user.id, e.target.checked)
                        }
                        disabled={updatingUserId === user.id}
                        className="sr-only"
                      />
                      <div
                        className={`block w-14 h-8 rounded-full transition-colors ${
                          user.isAdmin ? "bg-blue-600" : "bg-gray-300"
                        } ${
                          updatingUserId === user.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                          user.isAdmin ? "transform translate-x-6" : ""
                        } ${
                          updatingUserId === user.id
                            ? "flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {updatingUserId === user.id && (
                          <svg
                            className="animate-spin h-4 w-4 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700">
                      {user.isAdmin ? "Admin" : "User"}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

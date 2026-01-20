import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ApiResponse } from "@saas-template/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch,
  Badge,
  Alert,
  AlertDescription,
  Skeleton,
} from "~/components/ui";

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
          prevUsers.map((user) => (user.id === userId ? { ...user, isAdmin } : user))
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
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage admin privileges for users in the system
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium text-foreground">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {user.id.slice(0, 12)}...
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.isAdmin ? "default" : "secondary"}>
                    {user.isAdmin ? "Admin" : "User"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {updatingUserId === user.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={(checked) => handleToggleAdmin(user.id, checked)}
                      disabled={updatingUserId === user.id}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

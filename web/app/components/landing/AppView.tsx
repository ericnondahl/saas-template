import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SignOutButton, UserButton, useUser } from "@clerk/react-router";
import { Settings, LogOut } from "lucide-react";
import { UserProfile } from "../UserProfile";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Alert,
  AlertDescription,
  Skeleton,
} from "../ui";
import type { ApiResponse, UserDTO } from "@saas-template/shared";

export function AppView() {
  const { isLoaded, user } = useUser();
  const [userData, setUserData] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[HOME] Component mounted!");
    console.log("[HOME] Clerk isLoaded:", isLoaded);
    console.log("[HOME] User:", user?.id || "Not signed in");
  }, [isLoaded, user]);

  // Fetch user data from API when user is signed in
  useEffect(() => {
    if (isLoaded && user) {
      setLoading(true);
      setError(null);

      fetch("/api/user")
        .then((res) => res.json())
        .then((data: ApiResponse<UserDTO>) => {
          if (data.success && data.data) {
            setUserData(data.data);
          } else {
            setError(data.error?.message || "Failed to load user data");
          }
        })
        .catch((err) => {
          console.error("[HOME] Error fetching user:", err);
          setError("Failed to load user data");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUserData(null);
    }
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-foreground">SaaS Template</h1>

      <div className="flex gap-3 items-center mb-8">
        <span className="text-muted-foreground mr-2">
          Welcome, {user?.firstName || "User"}!
        </span>
        <UserButton afterSignOutUrl="/" />
        <SignOutButton>
          <Button variant="default" size="default">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </SignOutButton>
      </div>

      {/* Display User Profile when signed in */}
      <div className="mb-8 w-full flex flex-col items-center">
        {loading && (
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        )}
        {error && (
          <Alert variant="destructive" className="max-w-2xl w-full">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && userData && (
          <>
            <UserProfile user={userData} />
            {userData.isAdmin && (
              <Button asChild className="mt-4" size="lg">
                <Link to="/admin">
                  <Settings className="h-5 w-5" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Modern Stack</CardTitle>
            <CardDescription>
              Built with React Router 7, Expo, TypeScript, and Tailwind CSS
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Clerk Auth integration for secure user management
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Database Ready</CardTitle>
            <CardDescription>
              Prisma ORM with PostgreSQL and Redis caching
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

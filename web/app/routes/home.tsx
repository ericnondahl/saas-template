import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/server";
import { createClerkClient } from "@clerk/react-router/api.server";
import type { Route } from "./+types/home";
import { syncUser } from "../services/user.server";
import { UserProfile } from "../components/UserProfile";
import type { ApiResponse, UserDTO } from "@saas-template/shared";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SaaS Template - Home" },
    { name: "description", content: "Welcome to the SaaS Template!" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (userId) {
    // User is signed in - sync to database
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const clerkUser = await clerkClient.users.getUser(userId);
    await syncUser(clerkUser);
  }

  return { synced: !!userId };
}

export default function Home() {
  const { isLoaded, user } = useUser();
  const [userData, setUserData] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[HOME] ✅ Component mounted!");
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">SaaS Template</h1>

      <div className="flex gap-4 items-center mb-8">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <span className="text-gray-700 mr-2">Welcome, {user?.firstName || "User"}!</span>
          <UserButton afterSignOutUrl="/" />
          <SignOutButton>
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium ml-2">
              Sign Out
            </button>
          </SignOutButton>
        </SignedIn>
      </div>

      {/* Display User Profile when signed in */}
      <SignedIn>
        <div className="mb-8 w-full flex justify-center">
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
              <p className="text-center text-gray-600">Loading user data...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl w-full">
              <p className="text-red-900">Error: {error}</p>
            </div>
          )}
          {!loading && !error && userData && <UserProfile user={userData} />}
        </div>
      </SignedIn>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">🚀 Modern Stack</h3>
          <p className="text-gray-600">
            Built with React Router 7, Expo, TypeScript, and Tailwind CSS
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">🔐 Authentication</h3>
          <p className="text-gray-600">
            Clerk Auth integration for secure user management
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">💾 Database Ready</h3>
          <p className="text-gray-600">
            Prisma ORM with PostgreSQL and Redis caching
          </p>
        </div>
      </div>
    </div>
  );
}

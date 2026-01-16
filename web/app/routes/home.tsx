import { useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/server";
import { createClerkClient } from "@clerk/react-router/api.server";
import type { Route } from "./+types/home";
import { syncUser } from "../services/user.server";

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

  useEffect(() => {
    console.log("[HOME] ✅ Component mounted!");
    console.log("[HOME] Clerk isLoaded:", isLoaded);
    console.log("[HOME] User:", user?.id || "Not signed in");
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">SaaS Template</h1>

      <div className="flex gap-4 items-center mb-8">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <span className="text-gray-600 mr-2">Welcome, {user?.firstName || "User"}!</span>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">🚀 Modern Stack</h3>
          <p className="text-gray-600">
            Built with React Router 7, Expo, TypeScript, and Tailwind CSS
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">🔐 Authentication</h3>
          <p className="text-gray-600">
            Clerk Auth integration for secure user management
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">💾 Database Ready</h3>
          <p className="text-gray-600">
            Prisma ORM with PostgreSQL and Redis caching
          </p>
        </div>
      </div>
    </div>
  );
}

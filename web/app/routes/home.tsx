import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "SaaS Template - Home" },
    { name: "description", content: "Welcome to the SaaS Template!" },
  ];
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SaaS Template</h1>
          <div>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Your SaaS Template
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            A modern full-stack template with React Router 7, Expo, Clerk Auth, Prisma, and Redis.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <SignedIn>
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              View on GitHub
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">🚀 Modern Stack</h3>
              <p className="text-gray-600">
                Built with React Router 7, Expo, TypeScript, and Tailwind CSS
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">🔐 Authentication</h3>
              <p className="text-gray-600">
                Clerk Auth integration for secure user management
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">💾 Database Ready</h3>
              <p className="text-gray-600">
                Prisma ORM with PostgreSQL and Redis caching
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 SaaS Template. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}

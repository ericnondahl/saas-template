import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link } from "react-router";
import { UserButton } from "@clerk/react-router";
import { requireAuth } from "~/services";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - SaaS Template" },
    { name: "description", content: "Your dashboard" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Require authentication
  const { user } = await requireAuth({ request } as LoaderFunctionArgs);

  return { user };
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              SaaS Template
            </Link>
            <nav className="flex gap-4">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || user.email}!
          </h1>
          <p className="text-gray-600">
            Here's your dashboard overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Account Status</h3>
            <p className="text-2xl font-bold text-green-600">Active</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Member Since</h3>
            <p className="text-2xl font-bold text-gray-900">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Usage</h3>
            <p className="text-2xl font-bold text-gray-900">-</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Getting Started</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  👋 Welcome to your Dashboard
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  This is your authenticated dashboard. Start building your features here!
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Add your own routes in <code className="bg-gray-100 px-1 rounded">web/app/routes/</code></li>
                  <li>• Create database models in <code className="bg-gray-100 px-1 rounded">prisma/schema.prisma</code></li>
                  <li>• Add shared types in <code className="bg-gray-100 px-1 rounded">packages/shared/src/types/</code></li>
                  <li>• Use the service layer in <code className="bg-gray-100 px-1 rounded">web/app/services/</code></li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  📚 Documentation
                </h3>
                <p className="text-gray-600 text-sm">
                  Check out the README.md for complete documentation and examples.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

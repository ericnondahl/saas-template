import { Outlet, Link, redirect } from "react-router";
import { getAuth } from "@clerk/react-router/server";
import type { Route } from "./+types/admin";
import { getUserByClerkId } from "../services/user.server";
import { SignedIn, UserButton } from "@clerk/react-router";
import { Home, Users, FileText, BarChart3, ListTodo } from "lucide-react";
import { Button } from "~/components/ui";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin Dashboard" }, { name: "description", content: "Admin control panel" }];
}

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    throw redirect("/");
  }

  const user = await getUserByClerkId(userId);

  if (!user || !user.isAdmin) {
    throw redirect("/");
  }

  return { user };
}

const navItems = [
  { to: "/admin", label: "Admins", icon: Users, end: true },
  { to: "/admin/openrouter-logs", label: "OpenRouter Logs", icon: FileText },
  { to: "/admin/openrouter-usage", label: "OpenRouter Usage", icon: BarChart3 },
  { to: "/admin/queues", label: "Queues", icon: ListTodo },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
              >
                <Home className="h-5 w-5" />
                SaaS Template
              </Link>
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => (
                  <Button key={item.to} variant="ghost" size="sm" asChild>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Admin Panel
              </span>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-border bg-background px-4 py-2 overflow-x-auto">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <Button key={item.to} variant="ghost" size="sm" asChild>
              <Link to={item.to} className="flex items-center gap-2 whitespace-nowrap">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </nav>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

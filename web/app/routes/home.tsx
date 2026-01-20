import { SignedIn, SignedOut } from "@clerk/react-router";
import { getAuth, createClerkClient } from "@clerk/react-router/server";
import type { Route } from "./+types/home";
import { syncUser } from "../services/user.server";
import { LandingPage, AppView } from "../components/landing";

export function meta({}: Route.MetaArgs) {
  return [
    // Primary Meta Tags
    { title: "SaaS Template - Launch Your SaaS Faster" },
    {
      name: "description",
      content:
        "Production-ready SaaS boilerplate with authentication, database, AI integration, and everything you need to ship faster. Built with React Router, TypeScript, and Tailwind CSS.",
    },
    {
      name: "keywords",
      content:
        "saas template, saas boilerplate, react template, typescript starter, clerk auth, prisma, tailwind css, production ready, startup template",
    },
    { name: "author", content: "SaaS Template" },
    { name: "robots", content: "index, follow" },

    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:title", content: "SaaS Template - Launch Your SaaS Faster" },
    {
      property: "og:description",
      content:
        "Production-ready SaaS boilerplate with authentication, database, AI integration, and everything you need to ship faster.",
    },
    { property: "og:site_name", content: "SaaS Template" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "SaaS Template - Launch Your SaaS Faster" },
    {
      name: "twitter:description",
      content:
        "Production-ready SaaS boilerplate with authentication, database, AI integration, and everything you need to ship faster.",
    },

    // Additional SEO
    { name: "theme-color", content: "#111827" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
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
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <AppView />
      </SignedIn>
    </>
  );
}

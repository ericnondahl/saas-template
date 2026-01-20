import { useEffect } from "react";
import { useLocation } from "react-router";
import { useUser } from "@clerk/react-router";
import posthog from "posthog-js";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, isSignedIn } = useUser();

  // Track page views on route change
  useEffect(() => {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [location.pathname]);

  // Identify user when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      const properties: Record<string, string> = {};
      if (user.primaryEmailAddress?.emailAddress) {
        properties.email = user.primaryEmailAddress.emailAddress;
      }
      if (user.fullName) {
        properties.name = user.fullName;
      }
      posthog.identify(user.id, properties);
    } else {
      posthog.reset();
    }
  }, [isSignedIn, user]);

  return children;
}

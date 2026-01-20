import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import posthog from "posthog-js";

console.log("[CLIENT] Hydrating...");

// Initialize PostHog
if (typeof window !== "undefined" && import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: false, // Manual pageview tracking for SPA
    capture_pageleave: true,
    // Session recording options
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
  });
}

hydrateRoot(document, <HydratedRouter />);

console.log("[CLIENT] Hydration called");

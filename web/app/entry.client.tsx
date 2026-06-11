import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import posthog from "posthog-js";

// Initialize PostHog (skip the .env.example placeholder key)
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (typeof window !== "undefined" && posthogKey && !posthogKey.startsWith("phc_xxx")) {
  posthog.init(posthogKey, {
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

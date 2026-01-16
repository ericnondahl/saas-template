import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

console.log("[CLIENT] Hydrating...");

hydrateRoot(document, <HydratedRouter />);

console.log("[CLIENT] Hydration called");

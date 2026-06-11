import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "packages/shared/vitest.config.ts",
  "web/vitest.config.ts",
  "mobile/vitest.config.ts",
]);

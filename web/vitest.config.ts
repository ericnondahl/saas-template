import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { name: "web", include: ["app/**/*.test.ts"], environment: "node" },
});

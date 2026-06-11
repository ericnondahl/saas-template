import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/": resolve(__dirname, "./") + "/",
      "@saas-template/shared": resolve(__dirname, "../packages/shared/src"),
    },
  },
  test: {
    name: "mobile",
    include: ["utils/**/*.test.ts", "lib/**/*.test.ts"],
    environment: "node",
    passWithNoTests: true,
  },
});

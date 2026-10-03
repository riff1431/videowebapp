import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/api/**/*.test.ts", "tests/rls/**/*.test.ts", "tests/static/**/*.test.ts"],
    setupFiles: ["tests/setup/vitest-setup.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

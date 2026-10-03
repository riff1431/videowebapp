import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const PORT = 3000;
const baseURL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  globalSetup: "./tests/setup/global-setup.ts",
  use: {
    baseURL,
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "node tests/setup/run-dev.js",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
  },
});

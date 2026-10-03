import { seedTestData } from "./seed";

export default async function globalSetup() {
  console.log("\n[Playwright Global Setup] Seeding test database...");
  await seedTestData();
  console.log("[Playwright Global Setup] Seed complete.\n");
}

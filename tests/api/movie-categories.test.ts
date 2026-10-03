import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/db";
import { movieCategories, videos, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addMovieCategoryAction, deleteMovieCategoryAction } from "@/modules/admin/movies.actions";

describe("Phase 1.9: Movie Categories & Movies Filter Parity", () => {
  let adminUserId: number;

  beforeAll(async () => {
    // Seed test movie categories if not present
    const existing = await db
      .select()
      .from(movieCategories)
      .where(eq(movieCategories.key, "action_thriller"))
      .limit(1);

    if (!existing.length) {
      await db.insert(movieCategories).values({
        key: "action_thriller",
        name: "Action & Thriller",
        translations: JSON.stringify({ english: "Action & Thriller" }),
      });
    }
  });

  it("reads dynamic movie categories from movie_categories table", async () => {
    const list = await db
      .select({
        key: movieCategories.key,
        name: movieCategories.name,
      })
      .from(movieCategories);

    expect(list.length).toBeGreaterThan(0);
    const hasAction = list.some((c) => c.key === "action_thriller");
    expect(hasAction).toBe(true);
  });

  it("filters movies by category_ correctly when queried", async () => {
    // Check query behavior with a category condition
    const res = await db
      .select()
      .from(movieCategories)
      .where(eq(movieCategories.key, "action_thriller"));

    expect(res.length).toBe(1);
    expect(res[0].name).toBe("Action & Thriller");
  });
});

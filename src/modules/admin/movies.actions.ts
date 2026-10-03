"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { videos, movieCategories } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Manage Movies Actions
// ==========================================

export async function deleteMovieAction(id: number) {
  await assertAdmin();
  try {
    await db.delete(videos).where(and(eq(videos.id, id), eq(videos.isMovie, true)));
    revalidatePath("/admin/movies");
    revalidatePath("/admin/manage-movies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete movie" };
  }
}

export async function bulkDeleteMoviesAction(ids: number[]) {
  await assertAdmin();
  try {
    if (!ids || ids.length === 0) {
      return { success: false, error: "No movies selected" };
    }
    await db
      .delete(videos)
      .where(and(inArray(videos.id, ids), eq(videos.isMovie, true)));
    revalidatePath("/admin/movies");
    revalidatePath("/admin/manage-movies");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete selected movies" };
  }
}

// ==========================================
// 2. Movie Categories Actions
// ==========================================

export async function addMovieCategoryAction(formData: Record<string, string>) {
  await assertAdmin();
  try {
    const englishName = formData["english"]?.trim() || "";
    if (!englishName) {
      return { success: false, error: "English category name is required" };
    }

    // Generate unique key slug
    const key =
      englishName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `cat_${Date.now()}`;

    // Check if key already exists
    const existing = await db
      .select({ id: movieCategories.id })
      .from(movieCategories)
      .where(eq(movieCategories.key, key))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "A category with this name already exists" };
    }

    await db.insert(movieCategories).values({
      key,
      name: englishName,
      translations: JSON.stringify(formData),
    });

    revalidatePath("/admin/movies-categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add movie category" };
  }
}

export async function updateMovieCategoryAction(
  key: string,
  formData: Record<string, string>
) {
  await assertAdmin();
  try {
    const englishName = formData["english"]?.trim() || "";
    if (!englishName) {
      return { success: false, error: "English category name is required" };
    }

    await db
      .update(movieCategories)
      .set({
        name: englishName,
        translations: JSON.stringify(formData),
      })
      .where(eq(movieCategories.key, key));

    revalidatePath("/admin/movies-categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update movie category" };
  }
}

export async function deleteMovieCategoryAction(key: string) {
  await assertAdmin();
  try {
    if (key === "other") {
      return { success: false, error: "The default 'other' category cannot be deleted" };
    }

    await db.delete(movieCategories).where(eq(movieCategories.key, key));
    revalidatePath("/admin/movies-categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete movie category" };
  }
}

export async function bulkDeleteMovieCategoriesAction(keys: string[]) {
  await assertAdmin();
  try {
    // Exclude 'other'
    const validKeys = keys.filter((k) => k !== "other");
    if (validKeys.length === 0) {
      return { success: false, error: "No deletable categories selected" };
    }

    await db.delete(movieCategories).where(inArray(movieCategories.key, validKeys));
    revalidatePath("/admin/movies-categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete selected categories" };
  }
}

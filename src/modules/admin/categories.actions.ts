"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { categories, subCategories } from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. Manage Categories Actions
// ==========================================

export async function addCategoryAction(formData: Record<string, string>) {
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
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.key, key))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "A category with this name already exists" };
    }

    const currentCount = await db.select({ id: categories.id }).from(categories);

    await db.insert(categories).values({
      key,
      name: englishName,
      sortOrder: currentCount.length + 1,
      translations: JSON.stringify(formData),
    });

    revalidatePath("/admin/manage_categories");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding category:", error);
    return { success: false, error: error.message || "Failed to add category" };
  }
}

export async function updateCategoryAction(
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
      .update(categories)
      .set({
        name: englishName,
        translations: JSON.stringify(formData),
      })
      .where(eq(categories.key, key));

    revalidatePath("/admin/manage_categories");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategoryAction(key: string) {
  await assertAdmin();
  try {
    if (key === "other") {
      return { success: false, error: "The default 'other' category cannot be deleted" };
    }

    await db.delete(categories).where(eq(categories.key, key));
    // Also delete any subcategories for this category
    await db.delete(subCategories).where(eq(subCategories.categoryKey, key));

    revalidatePath("/admin/manage_categories");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

export async function bulkDeleteCategoriesAction(keys: string[]) {
  await assertAdmin();
  try {
    const validKeys = keys.filter((k) => k !== "other");
    if (validKeys.length === 0) {
      return { success: false, error: "No deletable categories selected" };
    }

    await db.delete(categories).where(inArray(categories.key, validKeys));
    await db.delete(subCategories).where(inArray(subCategories.categoryKey, validKeys));

    revalidatePath("/admin/manage_categories");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk deleting categories:", error);
    return { success: false, error: error.message || "Failed to delete selected categories" };
  }
}

// ==========================================
// 2. Manage Sub Categories Actions
// ==========================================

export async function addSubCategoryAction(
  categoryKey: string,
  formData: Record<string, string>
) {
  await assertAdmin();
  try {
    if (!categoryKey) {
      return { success: false, error: "Category is required" };
    }

    const englishName = formData["english"]?.trim() || "";
    if (!englishName) {
      return { success: false, error: "English sub category name is required" };
    }

    const key =
      englishName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `sub_${Date.now()}`;

    // Check if key already exists within this category
    const existing = await db
      .select({ id: subCategories.id })
      .from(subCategories)
      .where(and(eq(subCategories.categoryKey, categoryKey), eq(subCategories.key, key)))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "A sub category with this name already exists in this category" };
    }

    await db.insert(subCategories).values({
      categoryKey,
      key,
      name: englishName,
      translations: JSON.stringify(formData),
    });

    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding sub category:", error);
    return { success: false, error: error.message || "Failed to add sub category" };
  }
}

export async function updateSubCategoryAction(
  key: string,
  formData: Record<string, string>
) {
  await assertAdmin();
  try {
    const englishName = formData["english"]?.trim() || "";
    if (!englishName) {
      return { success: false, error: "English sub category name is required" };
    }

    await db
      .update(subCategories)
      .set({
        name: englishName,
        translations: JSON.stringify(formData),
      })
      .where(eq(subCategories.key, key));

    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating sub category:", error);
    return { success: false, error: error.message || "Failed to update sub category" };
  }
}

export async function deleteSubCategoryAction(key: string) {
  await assertAdmin();
  try {
    await db.delete(subCategories).where(eq(subCategories.key, key));
    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting sub category:", error);
    return { success: false, error: error.message || "Failed to delete sub category" };
  }
}

export async function bulkDeleteSubCategoriesAction(keys: string[]) {
  await assertAdmin();
  try {
    if (!keys || keys.length === 0) {
      return { success: false, error: "No sub categories selected" };
    }

    await db.delete(subCategories).where(inArray(subCategories.key, keys));
    revalidatePath("/admin/manage_sub_categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error bulk deleting sub categories:", error);
    return { success: false, error: error.message || "Failed to delete selected sub categories" };
  }
}

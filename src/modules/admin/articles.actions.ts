"use server";

import { db } from "@/db";
import { articles, users, categories } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface ArticleInput {
  title: string;
  description: string;
  text: string;
  category: string;
  tags?: string;
  image?: string;
  active?: boolean;
}

export async function createArticleAction(data: ArticleInput) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Title is required" };
    }

    // Find first admin or user to associate as author
    const firstUser = await db.select({ id: users.id }).from(users).limit(1);
    const userId = firstUser.length > 0 ? firstUser[0].id : 1;

    const [newArticle] = await db
      .insert(articles)
      .values({
        userId,
        title: data.title.trim(),
        description: data.description?.trim() || "",
        text: data.text || "",
        category: data.category || "other",
        tags: data.tags || "",
        image: data.image || "/upload/photos/d-cover.jpg",
        active: data.active ?? true,
      })
      .returning({ id: articles.id });

    revalidatePath("/admin/manage-articles");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");

    return { success: true, id: newArticle.id };
  } catch (error: any) {
    console.error("Error creating article:", error);
    return { success: false, error: error.message || "Failed to create article" };
  }
}

export async function updateArticleAction(id: number, data: ArticleInput) {
  try {
    if (!data.title?.trim()) {
      return { success: false, error: "Title is required" };
    }

    await db
      .update(articles)
      .set({
        title: data.title.trim(),
        description: data.description?.trim() || "",
        text: data.text || "",
        category: data.category || "other",
        tags: data.tags || "",
        ...(data.image ? { image: data.image } : {}),
        active: data.active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id));

    revalidatePath("/admin/manage-articles");
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/edit-article?id=${id}`);
    revalidatePath(`/articles/${id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating article:", error);
    return { success: false, error: error.message || "Failed to update article" };
  }
}

export async function deleteArticleAction(id: number) {
  try {
    await db.delete(articles).where(eq(articles.id, id));
    revalidatePath("/admin/manage-articles");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting article:", error);
    return { success: false, error: error.message || "Failed to delete article" };
  }
}

export async function bulkArticleAction(
  ids: number[],
  action: "activate" | "deactivate" | "delete"
) {
  try {
    if (!ids || ids.length === 0) {
      return { success: false, error: "No articles selected" };
    }

    if (action === "delete") {
      await db.delete(articles).where(inArray(articles.id, ids));
    } else if (action === "activate") {
      await db
        .update(articles)
        .set({ active: true, updatedAt: new Date() })
        .where(inArray(articles.id, ids));
    } else if (action === "deactivate") {
      await db
        .update(articles)
        .set({ active: false, updatedAt: new Date() })
        .where(inArray(articles.id, ids));
    }

    revalidatePath("/admin/manage-articles");
    revalidatePath("/admin/articles");
    revalidatePath("/articles");

    return { success: true };
  } catch (error: any) {
    console.error("Error in bulkArticleAction:", error);
    return { success: false, error: error.message || "Failed to process bulk action" };
  }
}

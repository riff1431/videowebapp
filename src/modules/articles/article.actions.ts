"use server";

import { db } from "@/db";
import { articles, articleComments, users } from "@/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sanitizeUserHtml, sanitizePlainText } from "@/lib/security/sanitize";

const createArticleSchema = z.object({
  title: z.string().min(3).max(250),
  description: z.string().min(5),
  text: z.string().min(10),
  category: z.string().default("general"),
  image: z.string().optional(),
  tags: z.string().default(""),
});

export async function createArticleAction(formData: FormData) {
  try {
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      text: formData.get("text") as string,
      category: (formData.get("category") as string) || "general",
      image: (formData.get("image") as string) || undefined,
      tags: (formData.get("tags") as string) || "",
    };

    const parsed = createArticleSchema.parse(rawData);

    let authorId = 1;
    try {
      const { auth } = await import("@/lib/auth/auth");
      const { headers } = await import("next/headers");
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user?.id) {
        authorId = Number(session.user.id);
      } else {
        const [defaultUser] = await db.select().from(users).limit(1);
        if (defaultUser) authorId = defaultUser.id;
      }
    } catch (e) {
      const [defaultUser] = await db.select().from(users).limit(1);
      if (defaultUser) authorId = defaultUser.id;
    }

    let finalImageUrl = parsed.image || "/upload/photos/d-cover.jpg";
    if (parsed.image && parsed.image.startsWith("data:image/")) {
      try {
        const { writeFileSync, existsSync, mkdirSync } = await import("fs");
        const { join } = await import("path");
        const matches = parsed.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const uploadDir = join(process.cwd(), "public", "upload", "photos");
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          const filename = `article-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const filePath = join(uploadDir, filename);
          writeFileSync(filePath, buffer);
          finalImageUrl = `/upload/photos/${filename}`;
        }
      } catch (fsErr) {
        console.warn("Failed to write image file to disk, using raw string:", fsErr);
      }
    }

    const [newArticle] = await db
      .insert(articles)
      .values({
        userId: authorId,
        title: sanitizePlainText(parsed.title),
        description: sanitizePlainText(parsed.description),
        text: sanitizeUserHtml(parsed.text),
        category: parsed.category,
        image: finalImageUrl,
        tags: sanitizePlainText(parsed.tags),
        views: 0,
        shared: 0,
        active: true,
      })
      .returning({ id: articles.id });

    revalidatePath("/articles");
    return { success: true, articleId: newArticle.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create article" };
  }
}

export async function postArticleCommentAction(articleId: number, text: string) {
  try {
    if (!text.trim()) {
      return { success: false, error: "Comment text cannot be empty" };
    }

    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      return { success: false, error: "User authentication required" };
    }

    const cleaned = sanitizePlainText(text.trim());
    if (!cleaned) {
      return { success: false, error: "Comment text cannot be empty" };
    }

    const [comment] = await db
      .insert(articleComments)
      .values({
        articleId,
        userId: user.id,
        text: cleaned,
      })
      .returning();

    revalidatePath(`/articles/read/${articleId}`);
    return { success: true, comment };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to post comment" };
  }
}

export async function deleteArticleAction(articleId: number) {
  try {
    const { auth } = await import("@/lib/auth/auth");
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Please log in to delete an article." };
    }

    const userId = Number(session.user.id);
    await db
      .delete(articles)
      .where(and(eq(articles.id, articleId), eq(articles.userId, userId)));

    revalidatePath("/my_articles");
    revalidatePath("/my-articles");
    revalidatePath("/articles");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete article" };
  }
}


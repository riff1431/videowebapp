"use server";

import { db } from "@/db";
import { articles, articleComments, users } from "@/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

    const [newArticle] = await db
      .insert(articles)
      .values({
        userId: authorId,
        title: parsed.title,
        description: parsed.description,
        text: parsed.text,
        category: parsed.category,
        image: parsed.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1280&auto=format&fit=crop&q=80",
        tags: parsed.tags,
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

    const [comment] = await db
      .insert(articleComments)
      .values({
        articleId,
        userId: user.id,
        text: text.trim(),
      })
      .returning();

    revalidatePath(`/articles/read/${articleId}`);
    return { success: true, comment };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to post comment" };
  }
}

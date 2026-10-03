"use server";

import { db } from "@/db";
import {
  videos,
  likesDislikes,
  comments,
  commentReplies,
  subscriptions,
  watchLater,
  siteConfig,
  users,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { getUserUploadLimit } from "@/lib/config/upload-policy";
import { censorText } from "@/lib/security/censor";
import { getSiteConfig } from "@/lib/config";
import { createNotification } from "@/services/notification.service";

// ==========================================
// 1. Video Upload Server Action
// ==========================================
const uploadVideoSchema = z.object({
  title: z.string().min(3).max(250),
  description: z.string().optional(),
  categoryId: z.string().default("other"),
  videoLocation: z.string().url().or(z.string().min(1)),
  thumbnail: z.string().optional(),
  duration: z.string().default("00:00"),
  privacy: z.coerce.number().default(0),
  isShort: z.boolean().default(false),
  tags: z.string().optional(),
  fileSizeBytes: z.coerce.number().optional().default(0),
});

export async function uploadVideoAction(formData: FormData, customHeaders?: Headers) {
  try {
    const currentUserId = await getAuthUserId(customHeaders);
    if (!currentUserId) {
      return { success: false, error: "Please log in to upload videos" };
    }

    // Check upload policy (Phase 1.2)
    const policy = await getUserUploadLimit(currentUserId);
    if (!policy.canUpload) {
      return {
        success: false,
        error:
          policy.whoCanUpload === "admin"
            ? "Only administrators are allowed to upload videos"
            : policy.whoCanUpload === "pro"
            ? "Only Pro members are allowed to upload videos"
            : "Video uploads are currently disabled",
      };
    }

    const fileSizeBytes = Number(formData.get("fileSizeBytes") || 0);
    if (policy.maxUploadBytes > 0 && fileSizeBytes > policy.maxUploadBytes) {
      return {
        success: false,
        error: `File size exceeds the allowed maximum upload limit of ${policy.maxUploadFormatted}`,
      };
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: (formData.get("categoryId") as string) || "other",
      videoLocation: formData.get("videoLocation") as string,
      thumbnail: formData.get("thumbnail") as string,
      privacy: formData.get("privacy") ? Number(formData.get("privacy")) : 0,
      isShort: formData.get("isShort") === "true",
      tags: (formData.get("tags") as string) || "",
      fileSizeBytes,
    };

    const parsed = uploadVideoSchema.parse(rawData);

    // Apply word censoring (Phase 1.3)
    const censoredTitle = await censorText(parsed.title);
    const censoredDescription = await censorText(parsed.description || "");

    const videoId = "pt_" + Math.random().toString(36).substring(2, 10);

    const [newVideo] = await db
      .insert(videos)
      .values({
        videoId,
        userId: currentUserId,
        title: censoredTitle,
        description: censoredDescription,
        categoryId: parsed.categoryId,
        videoLocation: parsed.videoLocation,
        tags: parsed.tags || "",
        thumbnail:
          parsed.thumbnail ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
        duration: parsed.isShort ? "00:30" : "03:45",
        size: parsed.fileSizeBytes || 0,
        privacy: parsed.privacy,
        isShort: parsed.isShort,
        videoType: "video/mp4",
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/videos/latest");
    revalidatePath("/shorts");
    revalidatePath("/admin/videos");

    return { success: true, videoId: newVideo.videoId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload video" };
  }
}

// ==========================================
// 2. Video Import Server Action (YouTube / Vimeo)
// ==========================================
const importVideoSchema = z.object({
  url: z.string().url("Please provide a valid video URL"),
  title: z.string().min(3).max(250),
  description: z.string().optional(),
  categoryId: z.string().default("other"),
  thumbnail: z.string().optional(),
  duration: z.string().default("00:00"),
});

export async function importVideoAction(formData: FormData, customHeaders?: Headers) {
  try {
    const currentUserId = await getAuthUserId(customHeaders);
    if (!currentUserId) {
      return { success: false, error: "Please log in to import videos" };
    }

    const rawData = {
      url: formData.get("url") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: (formData.get("categoryId") as string) || "other",
      thumbnail: formData.get("thumbnail") as string,
      duration: (formData.get("duration") as string) || "04:20",
    };

    const parsed = importVideoSchema.parse(rawData);

    // Apply censoring (Phase 1.3)
    const censoredTitle = await censorText(parsed.title);
    const censoredDesc = await censorText(parsed.description || "");

    // Determine embed type
    let videoType = "youtube";
    let embedUrl = parsed.url;

    if (parsed.url.includes("youtube.com/watch?v=")) {
      const vid = parsed.url.split("v=")[1]?.split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (parsed.url.includes("youtu.be/")) {
      const vid = parsed.url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (parsed.url.includes("vimeo.com/")) {
      const vid = parsed.url.split("vimeo.com/")[1]?.split("?")[0];
      embedUrl = `https://player.vimeo.com/video/${vid}`;
      videoType = "vimeo";
    }

    const videoId = "pt_imp_" + Math.random().toString(36).substring(2, 10);

    const [newVideo] = await db
      .insert(videos)
      .values({
        videoId,
        userId: currentUserId,
        title: censoredTitle,
        description: censoredDesc,
        categoryId: parsed.categoryId,
        videoLocation: embedUrl,
        youtubeUrl: embedUrl,
        thumbnail:
          parsed.thumbnail ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80",
        duration: parsed.duration,
        privacy: 0,
        videoType,
      })
      .returning();

    revalidatePath("/");
    revalidatePath("/videos/latest");
    return { success: true, videoId: newVideo.videoId };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to import video" };
  }
}

// Helper to get authenticated user in Server Actions
async function getAuthUserId(customHeaders?: Headers): Promise<number | null> {
  const { auth } = await import("@/lib/auth/auth");
  let reqHeaders: Headers;
  try {
    const { headers } = await import("next/headers");
    reqHeaders = customHeaders || (await headers());
  } catch {
    reqHeaders = customHeaders || new Headers();
  }
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return session?.user?.id ? Number(session.user.id) : null;
}

// ==========================================
// 3. Video Like / Dislike Toggle Action
// ==========================================
export async function toggleLikeVideoAction({
  videoDbId,
  type,
}: {
  videoDbId: number;
  type: 1 | 2; // 1: like, 2: dislike
}) {
  try {
    const currentUserId = await getAuthUserId();
    if (!currentUserId) return { success: false, error: "Please log in to like or dislike videos" };

    const [existing] = await db
      .select()
      .from(likesDislikes)
      .where(
        and(
          eq(likesDislikes.userId, currentUserId),
          eq(likesDislikes.videoId, videoDbId)
        )
      );

    if (existing) {
      if (existing.type === type) {
        // Remove vote
        await db
          .delete(likesDislikes)
          .where(eq(likesDislikes.id, existing.id));
        revalidatePath("/watch/[videoId]", "page");
        return { success: true, removed: true, currentVote: null };
      } else {
        // Change vote
        await db
          .update(likesDislikes)
          .set({ type })
          .where(eq(likesDislikes.id, existing.id));
        revalidatePath("/watch/[videoId]", "page");
        return { success: true, removed: false, currentVote: type };
      }
    } else {
      // New vote
      await db.insert(likesDislikes).values({
        userId: currentUserId,
        videoId: videoDbId,
        type,
      });
      revalidatePath("/watch/[videoId]", "page");
      return { success: true, removed: false, currentVote: type };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4. Add Comment Server Action
// ==========================================
export async function addCommentAction({
  videoDbId,
  text,
  customHeaders,
}: {
  videoDbId: number;
  text: string;
  customHeaders?: Headers;
}) {
  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: "Comment text cannot be empty" };
    }

    const currentUserId = await getAuthUserId(customHeaders);
    if (!currentUserId) return { success: false, error: "Please log in to comment" };

    const cleanedText = sanitizePlainText(text.trim());
    if (!cleanedText) {
      return { success: false, error: "Comment text cannot be empty or malicious HTML" };
    }

    // Apply censoring (Phase 1.3)
    const censoredComment = await censorText(cleanedText);

    const [newComment] = await db
      .insert(comments)
      .values({
        userId: currentUserId,
        videoId: videoDbId,
        text: censoredComment,
      })
      .returning();

    // Trigger notification to video owner if different
    const [targetVid] = await db.select({ userId: videos.userId, videoId: videos.videoId }).from(videos).where(eq(videos.id, videoDbId)).limit(1);
    if (targetVid && targetVid.userId !== currentUserId) {
      await createNotification({
        userId: targetVid.userId,
        type: "comment",
        text: "Someone commented on your video.",
        url: `/watch/${targetVid.videoId}`,
      });
    }

    revalidatePath("/watch/[videoId]", "page");
    return { success: true, comment: newComment };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4b. Reply to Comment Server Action
// ==========================================
export async function addCommentReplyAction({
  commentId,
  videoDbId,
  text,
  customHeaders,
}: {
  commentId: number;
  videoDbId: number;
  text: string;
  customHeaders?: Headers;
}) {
  try {
    if (!text || text.trim().length === 0) {
      return { success: false, error: "Reply text cannot be empty" };
    }

    const currentUserId = await getAuthUserId(customHeaders);
    if (!currentUserId) return { success: false, error: "Please log in to reply" };

    const cleanedText = sanitizePlainText(text.trim());
    if (!cleanedText) {
      return { success: false, error: "Reply text cannot be empty or malicious HTML" };
    }

    // Apply censoring (Phase 1.3)
    const censoredReply = await censorText(cleanedText);

    const [newReply] = await db
      .insert(commentReplies)
      .values({
        commentId,
        userId: currentUserId,
        videoId: videoDbId,
        text: censoredReply,
      })
      .returning();

    // Trigger notification to original comment author if different
    const [targetComm] = await db.select({ userId: comments.userId }).from(comments).where(eq(comments.id, commentId)).limit(1);
    const [parentVid] = await db.select({ videoId: videos.videoId }).from(videos).where(eq(videos.id, videoDbId)).limit(1);
    if (targetComm && targetComm.userId !== currentUserId) {
      await createNotification({
        userId: targetComm.userId,
        type: "reply",
        text: "Someone replied to your comment.",
        url: parentVid ? `/watch/${parentVid.videoId}` : "/watch",
      });
    }

    revalidatePath("/watch/[videoId]", "page");
    return { success: true, reply: newReply };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4c. Load More Comments Action
// ==========================================
export async function loadMoreCommentsAction({
  videoId,
  offset,
  limit,
}: {
  videoId: number;
  offset: number;
  limit?: number;
}) {
  try {
    const config = await getSiteConfig(["comments_default_num"]);
    const fetchLimit = limit || parseInt(config["comments_default_num"] || "20", 10) || 20;

    const list = await db
      .select({
        id: comments.id,
        text: comments.text,
        createdAt: comments.createdAt,
        user: {
          name: users.name,
          username: users.username,
          avatar: users.avatar,
          verified: users.verified,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.videoId, videoId))
      .orderBy(desc(comments.createdAt))
      .limit(fetchLimit)
      .offset(offset);

    return { success: true, comments: list, hasMore: list.length === fetchLimit };
  } catch (err: any) {
    return { success: false, comments: [], hasMore: false, error: err.message };
  }
}

// ==========================================
// 5. Toggle Subscription Action
// ==========================================
export async function toggleSubscribeAction({
  channelUserId,
}: {
  channelUserId: number;
}) {
  try {
    const currentUserId = await getAuthUserId();
    if (!currentUserId) return { success: false, error: "Please log in to subscribe" };

    if (currentUserId === channelUserId) {
      return { success: false, error: "Cannot subscribe to your own channel" };
    }

    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, currentUserId),
          eq(subscriptions.channelId, channelUserId)
        )
      );

    if (existing) {
      await db
        .delete(subscriptions)
        .where(eq(subscriptions.id, existing.id));
      revalidatePath("/subscriptions");
      return { success: true, subscribed: false };
    } else {
      await db.insert(subscriptions).values({
        subscriberId: currentUserId,
        channelId: channelUserId,
      });

      // Trigger new subscriber notification
      const [subscriberUser] = await db.select({ username: users.username }).from(users).where(eq(users.id, currentUserId)).limit(1);
      await createNotification({
        userId: channelUserId,
        type: "subscriber",
        text: `@${subscriberUser?.username || "A user"} subscribed to your channel.`,
        url: `/channel/${subscriberUser?.username || ""}`,
      });

      revalidatePath("/subscriptions");
      return { success: true, subscribed: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 5b. Toggle Save / Watch Later Action
// ==========================================
export async function toggleWatchLaterAction({
  videoId,
}: {
  videoId: number;
}) {
  try {
    const currentUserId = await getAuthUserId();
    if (!currentUserId) return { success: false, error: "Please log in to save videos" };

    const [existing] = await db
      .select()
      .from(watchLater)
      .where(
        and(
          eq(watchLater.userId, currentUserId),
          eq(watchLater.videoId, videoId)
        )
      );

    if (existing) {
      await db
        .delete(watchLater)
        .where(eq(watchLater.id, existing.id));
      revalidatePath("/saved");
      return { success: true, saved: false };
    } else {
      await db.insert(watchLater).values({
        userId: currentUserId,
        videoId,
      });
      revalidatePath("/saved");
      return { success: true, saved: true };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update saved video" };
  }
}

// ==========================================
// 6. Update Video Metadata Action
// ==========================================
const updateVideoSchema = z.object({
  id: z.coerce.number(),
  title: z.string().min(3).max(250),
  description: z.string().optional(),
  categoryId: z.string().default("other"),
  privacy: z.coerce.number().default(0),
  thumbnail: z.string().optional(),
});

export async function updateVideoAction(formData: FormData) {
  try {
    const rawData = {
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description"),
      categoryId: formData.get("categoryId") || "other",
      privacy: formData.get("privacy") ? Number(formData.get("privacy")) : 0,
      thumbnail: formData.get("thumbnail") || undefined,
    };

    const parsed = updateVideoSchema.parse(rawData);

    // Apply censoring (Phase 1.3)
    const censoredTitle = await censorText(parsed.title);
    const censoredDescription = await censorText(parsed.description || "");

    await db
      .update(videos)
      .set({
        title: censoredTitle,
        description: censoredDescription,
        categoryId: parsed.categoryId,
        privacy: parsed.privacy,
        ...(parsed.thumbnail ? { thumbnail: parsed.thumbnail } : {}),
      })
      .where(eq(videos.id, parsed.id));

    revalidatePath("/manage-videos");
    revalidatePath(`/watch/${parsed.id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update video" };
  }
}

// ==========================================
// 7. Delete Video Action
// ==========================================
export async function deleteVideoAction(videoId: number) {
  const { deleteVideoService } = await import("@/services/video.service");
  const result = await deleteVideoService(videoId);
  if (result.success) {
    try {
      revalidatePath("/manage-videos");
      revalidatePath("/dashboard");
      revalidatePath("/");
    } catch {
      // Gracefully handle invocation outside Next.js request context if any
    }
  }
  return result;
}

// ==========================================
// 8. Delete Comment Action (Creator Studio)
// ==========================================
export async function deleteCommentAction(commentId: number) {
  try {
    const { auth } = await import("@/lib/auth/auth");
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const userId = Number(session.user.id);
    const [c] = await db
      .select({ id: comments.id, userId: comments.userId, videoUserId: videos.userId })
      .from(comments)
      .innerJoin(videos, eq(comments.videoId, videos.id))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!c || (c.userId !== userId && c.videoUserId !== userId)) {
      return { success: false, error: "Permission denied." };
    }

    await db.delete(comments).where(eq(comments.id, commentId));
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete comment" };
  }
}

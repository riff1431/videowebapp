"use server";

import { assertAdmin } from "@/lib/auth/assert-admin";

import { db } from "@/db";
import { reports, copyrightReports, users, videos } from "@/db/schema";
import { eq, inArray, ilike, or, desc, asc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// Types
// ==========================================
export interface VideoReportItem {
  id: number;
  userId: number;
  username: string;
  userAvatar: string;
  videoId: number;
  videoTitle: string;
  videoUrl: string;
  text: string;
  time: string;
  rawTime: Date;
}

export interface CopyrightReportItem {
  id: number;
  userId: number;
  username: string;
  userAvatar: string;
  videoId: number;
  videoTitle: string;
  videoUrl: string;
  text: string;
  time: string;
  rawTime: Date;
}

// Helper date range parser matching PlayTube daterangepicker
function getDateRangeFilter(range: string) {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;

  if (range === "Today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else if (range === "Yesterday") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
  } else if (range === "This Week") {
    const day = now.getDay();
    const diff = now.getDate() - day; // Sunday or adjust
    start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    end = new Date();
    end.setHours(23, 59, 59, 999);
  } else if (range === "This Month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (range === "Last Month") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (range === "This Year") {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }

  return { start, end };
}

// ==========================================
// 1. Manage Video Reports Actions
// ==========================================
export async function getVideoReportsAction(options?: {
  query?: string;
  sort?: string;
  range?: string;
  page?: number;
  limit?: number;
}): Promise<{
  reports: VideoReportItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await assertAdmin();
  try {
    const query = options?.query?.trim() || "";
    const sort = options?.sort || "DESC_i";
    const range = options?.range || "All";
    const page = Math.max(1, options?.page || 1);
    const limit = options?.limit || 15;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query) {
      const searchPattern = `%${query}%`;
      conditions.push(
        or(
          ilike(reports.text, searchPattern),
          ilike(videos.title, searchPattern),
          ilike(users.name, searchPattern),
          ilike(users.username, searchPattern)
        )
      );
    }

    if (range && range !== "All") {
      const { start, end } = getDateRangeFilter(range);
      if (start && end) {
        conditions.push(and(gte(reports.time, start), lte(reports.time, end)));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sort order
    let orderByClause = desc(reports.id);
    if (sort === "ASC_i") orderByClause = asc(reports.id);
    else if (sort === "DESC_i") orderByClause = desc(reports.id);
    else if (sort === "ASC_t") orderByClause = asc(reports.time);
    else if (sort === "DESC_t") orderByClause = desc(reports.time);

    // Count total
    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .leftJoin(videos, eq(reports.videoId, videos.id))
      .where(whereClause);

    const total = Number(countRes[0]?.count || 0);

    // Fetch items
    const rows = await db
      .select({
        id: reports.id,
        userId: reports.userId,
        text: reports.text,
        time: reports.time,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        videoId: reports.videoId,
        videoTitle: videos.title,
        videoVideoId: videos.videoId,
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .leftJoin(videos, eq(reports.videoId, videos.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const mapped: VideoReportItem[] = rows.map((r) => {
      const d = new Date(r.time);
      const dateStr = `${d.getFullYear()}-${d.toLocaleString("en-US", {
        month: "long",
      })}-${String(d.getDate()).padStart(2, "0")}`;

      return {
        id: r.id,
        userId: r.userId,
        username: r.userName || r.userUsername || "Unknown User",
        userAvatar: r.userAvatar || "/upload/photos/d-avatar.jpg",
        videoId: r.videoId,
        videoTitle: r.videoTitle || "Untitled Video",
        videoUrl: r.videoVideoId ? `/watch/${r.videoVideoId}` : "#",
        text: r.text || "",
        time: dateStr,
        rawTime: d,
      };
    });

    return {
      reports: mapped,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (err) {
    console.error("Failed to get video reports:", err);
    return { reports: [], total: 0, page: 1, totalPages: 1 };
  }
}

// Mark Safe (action = 1) -> Removes report from DB
export async function markReportSafeAction(id: number) {
  await assertAdmin();
  try {
    await db.delete(reports).where(eq(reports.id, id));
    revalidatePath("/admin/manage-video-reports");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to mark safe" };
  }
}

// Delete Video & Report (action = 3) -> Deletes video and report
export async function deleteReportedVideoAction(id: number) {
  await assertAdmin();
  try {
    const rep = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
    if (rep.length > 0 && rep[0].videoId > 0) {
      await db.delete(videos).where(eq(videos.id, rep[0].videoId));
    }
    await db.delete(reports).where(eq(reports.id, id));
    revalidatePath("/admin/manage-video-reports");
    revalidatePath("/admin/manage-videos");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete video and report" };
  }
}

// Bulk Actions for Video Reports: 'safe' | 'delete'
export async function bulkManageVideoReportsAction(ids: number[], actionType: "safe" | "delete") {
  await assertAdmin();
  try {
    if (!ids || ids.length === 0) {
      return { success: true };
    }

    if (actionType === "delete") {
      const reps = await db.select().from(reports).where(inArray(reports.id, ids));
      const videoIds = reps.map((r) => r.videoId).filter((vid) => vid > 0);
      if (videoIds.length > 0) {
        await db.delete(videos).where(inArray(videos.id, videoIds));
      }
      await db.delete(reports).where(inArray(reports.id, ids));
    } else {
      // 'safe': remove the reports only
      await db.delete(reports).where(inArray(reports.id, ids));
    }

    revalidatePath("/admin/manage-video-reports");
    revalidatePath("/admin/manage-videos");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Bulk action failed" };
  }
}

// ==========================================
// 2. Manage Copyright Reports Actions
// ==========================================
export async function getCopyrightReportsAction(options?: {
  query?: string;
  sort?: string;
  range?: string;
  page?: number;
  limit?: number;
}): Promise<{
  reports: CopyrightReportItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await assertAdmin();
  try {
    const query = options?.query?.trim() || "";
    const sort = options?.sort || "DESC_i";
    const range = options?.range || "All";
    const page = Math.max(1, options?.page || 1);
    const limit = options?.limit || 15;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query) {
      const searchPattern = `%${query}%`;
      conditions.push(
        or(
          ilike(copyrightReports.text, searchPattern),
          ilike(videos.title, searchPattern),
          ilike(users.name, searchPattern),
          ilike(users.username, searchPattern)
        )
      );
    }

    if (range && range !== "All") {
      const { start, end } = getDateRangeFilter(range);
      if (start && end) {
        conditions.push(and(gte(copyrightReports.time, start), lte(copyrightReports.time, end)));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sort order
    let orderByClause = desc(copyrightReports.id);
    if (sort === "ASC_i") orderByClause = asc(copyrightReports.id);
    else if (sort === "DESC_i") orderByClause = desc(copyrightReports.id);
    else if (sort === "ASC_t") orderByClause = asc(copyrightReports.time);
    else if (sort === "DESC_t") orderByClause = desc(copyrightReports.time);

    // Count total
    const countRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(copyrightReports)
      .leftJoin(users, eq(copyrightReports.userId, users.id))
      .leftJoin(videos, eq(copyrightReports.videoId, videos.id))
      .where(whereClause);

    const total = Number(countRes[0]?.count || 0);

    // Fetch items
    const rows = await db
      .select({
        id: copyrightReports.id,
        userId: copyrightReports.userId,
        text: copyrightReports.text,
        time: copyrightReports.time,
        userName: users.name,
        userUsername: users.username,
        userAvatar: users.avatar,
        videoId: copyrightReports.videoId,
        videoTitle: videos.title,
        videoVideoId: videos.videoId,
      })
      .from(copyrightReports)
      .leftJoin(users, eq(copyrightReports.userId, users.id))
      .leftJoin(videos, eq(copyrightReports.videoId, videos.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const mapped: CopyrightReportItem[] = rows.map((r) => {
      const d = new Date(r.time);
      const dateStr = `${d.getFullYear()}-${d.toLocaleString("en-US", {
        month: "long",
      })}-${String(d.getDate()).padStart(2, "0")}`;

      return {
        id: r.id,
        userId: r.userId,
        username: r.userName || r.userUsername || "Unknown User",
        userAvatar: r.userAvatar || "/upload/photos/d-avatar.jpg",
        videoId: r.videoId,
        videoTitle: r.videoTitle || "Untitled Video",
        videoUrl: r.videoVideoId ? `/watch/${r.videoVideoId}` : "#",
        text: r.text || "",
        time: dateStr,
        rawTime: d,
      };
    });

    return {
      reports: mapped,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (err) {
    console.error("Failed to get copyright reports:", err);
    return { reports: [], total: 0, page: 1, totalPages: 1 };
  }
}

// Delete Copyright Report
export async function deleteCopyrightReportAction(id: number) {
  await assertAdmin();
  try {
    await db.delete(copyrightReports).where(eq(copyrightReports.id, id));
    revalidatePath("/admin/copy_report");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete copyright report" };
  }
}

// Bulk Delete Copyright Reports
export async function bulkDeleteCopyrightReportsAction(ids: number[]) {
  await assertAdmin();
  try {
    if (ids && ids.length > 0) {
      await db.delete(copyrightReports).where(inArray(copyrightReports.id, ids));
    }
    revalidatePath("/admin/copy_report");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Bulk delete failed" };
  }
}

// User-facing report actions
export async function reportVideoAction(data: {
  videoId: number;
  userId?: number;
  text: string;
}) {
  try {
    const text = data.text?.trim();
    if (!text) {
      return { success: false, error: "Please provide a reason for reporting" };
    }

    let reportUserId = data.userId || 0;
    if (!reportUserId) {
      try {
        const { auth } = await import("@/lib/auth/auth");
        const { headers } = await import("next/headers");
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (session?.user?.id) {
          reportUserId = Number(session.user.id);
        }
      } catch (e) {
        // Fallback to anonymous
      }
    }

    await db.insert(reports).values({
      videoId: data.videoId,
      userId: reportUserId,
      text,
      type: "video",
    });

    revalidatePath("/admin/manage-video-reports");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit report" };
  }
}

export async function reportCopyrightAction(data: {
  videoId: number;
  userId?: number;
  text: string;
}) {
  try {
    const text = data.text?.trim();
    if (!text) {
      return { success: false, error: "Please provide copyright report details" };
    }

    let reportUserId = data.userId || 0;
    if (!reportUserId) {
      try {
        const { auth } = await import("@/lib/auth/auth");
        const { headers } = await import("next/headers");
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (session?.user?.id) {
          reportUserId = Number(session.user.id);
        }
      } catch (e) {
        // Fallback to anonymous
      }
    }

    await db.insert(copyrightReports).values({
      videoId: data.videoId,
      userId: reportUserId,
      text,
    });

    revalidatePath("/admin/copy_report");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit copyright report" };
  }
}


import React from "react";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { AlertTriangle, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function AdminReportsPage() {
  const reportedVideos = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      views: videos.views,
      user: {
        username: users.username,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .orderBy(desc(videos.createdAt))
    .limit(10);

  async function deleteReportedVideoAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (id) {
      await db.delete(videos).where(eq(videos.id, id));
      revalidatePath("/admin/reports");
      revalidatePath("/admin/videos");
      revalidatePath("/");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl text-[var(--admin-text-main)]">
      <div>
        <h1 className="text-2xl font-bold text-[var(--admin-text-main)] tracking-tight">Content Moderation & Reports</h1>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Review community-flagged videos for copyright infringement, adult content, or policy violations
        </p>
      </div>

      <div className="bg-[var(--admin-card-bg)] rounded-xl border border-[var(--admin-card-border)] shadow-xs overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-[var(--admin-card-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-[var(--admin-text-main)]">
              Flagged Videos Queue
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--admin-card-hover)] border-b border-[var(--admin-card-border)] text-[var(--admin-text-muted)] font-semibold">
                <th className="py-3 px-4">Video</th>
                <th className="py-3 px-4">Uploader</th>
                <th className="py-3 px-4">Report Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-card-border)]">
              {reportedVideos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[var(--admin-text-muted)]">
                    No flagged reports pending review.
                  </td>
                </tr>
              ) : (
                reportedVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-[var(--admin-card-hover)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          className="w-14 h-9 object-cover rounded bg-neutral-200 dark:bg-neutral-800"
                        />
                        <span className="font-semibold text-[var(--admin-text-main)] line-clamp-1 max-w-xs">
                          {v.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--admin-text-muted)] font-medium">@{v.user.username}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Inappropriate / Flagged
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/watch/${v.videoId}`}
                          target="_blank"
                          className="p-1.5 text-[var(--admin-text-muted)] hover:text-[#04abf2] transition-colors"
                          title="View Video"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <form action={deleteReportedVideoAction} className="inline">
                          <input type="hidden" name="id" value={v.id} />
                          <button
                            type="submit"
                            className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                            title="Delete Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

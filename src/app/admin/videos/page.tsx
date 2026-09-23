import React from "react";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Video, Trash2, Eye, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ManageVideosPage() {
  const allVideos = await db
    .select()
    .from(videos)
    .orderBy(desc(videos.createdAt))
    .limit(50);

  return (
    <div className="space-y-6 text-[var(--admin-text-main)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text-main)] tracking-tight">
            Manage Videos
          </h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-1">
            Review, moderate, and manage uploaded content on the PlayTube platform.
          </p>
        </div>
        <div className="text-xs bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] px-3 py-1.5 rounded-lg text-[var(--admin-text-muted)] font-medium shadow-xs">
          Showing {allVideos.length} videos
        </div>
      </div>

      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-2xl shadow-xs overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--admin-card-hover)] border-b border-[var(--admin-card-border)] text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Video Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Privacy</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-card-border)]">
              {allVideos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--admin-text-muted)] text-sm">
                    No videos available in database.
                  </td>
                </tr>
              ) : (
                allVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-[var(--admin-card-hover)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden shrink-0 border border-[var(--admin-card-border)]">
                          {v.thumbnail ? (
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)]">
                              <Video className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-semibold text-[var(--admin-text-main)] text-xs line-clamp-1">
                            {v.title}
                          </p>
                          <p className="text-[11px] text-[var(--admin-text-muted)] font-mono mt-0.5">
                            ID: {v.videoId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-neutral-500/10 text-[var(--admin-text-muted)] border border-neutral-500/20 px-2 py-0.5 rounded font-medium">
                        {v.categoryId || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--admin-text-main)] font-medium">
                      {(v.views ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--admin-text-muted)] font-mono">
                      {v.duration || "00:00"}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        v.privacy === 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-neutral-500/10 text-[var(--admin-text-muted)] border border-neutral-500/20"
                      }`}>
                        {v.privacy === 0 ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/watch/${v.videoId}`}
                          target="_blank"
                          className="p-1.5 text-[var(--admin-text-muted)] hover:text-[#04abf2] hover:bg-neutral-500/10 rounded-lg transition-colors"
                          title="Watch Video"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
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

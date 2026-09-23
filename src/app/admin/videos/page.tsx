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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Manage Videos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, moderate, and manage uploaded content on the PlayTube platform.
          </p>
        </div>
        <div className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 font-medium">
          Showing {allVideos.length} videos
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Video Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Privacy</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allVideos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-sm">
                    No videos available in database.
                  </td>
                </tr>
              ) : (
                allVideos.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                          {v.thumbnail ? (
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Video className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs">
                          <p className="font-semibold text-gray-900 text-xs line-clamp-1">
                            {v.title}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            ID: {v.videoId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        {v.categoryId || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600 font-medium">
                      {(v.views ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 font-mono">
                      {v.duration || "00:00"}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        v.privacy === 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {v.privacy === 0 ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/watch/${v.videoId}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Film, Edit3, Trash2, Eye, Plus, Play, Lock, Globe } from "lucide-react";
import { deleteVideoAction } from "@/modules/videos/video.actions";

export const revalidate = 0; // Dynamic creator dashboard

export default async function ManageVideosPage() {
  // Query all videos uploaded by primary creator / user
  const userVideos = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      description: videos.description,
      thumbnail: videos.thumbnail,
      views: videos.views,
      duration: videos.duration,
      privacy: videos.privacy,
      createdAt: videos.createdAt,
      categoryId: videos.categoryId,
    })
    .from(videos)
    .orderBy(desc(videos.id))
    .limit(50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Studio Header matching PlayTube manage-videos */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Manage Videos (Creator Studio)
            </h1>
            <p className="text-xs text-neutral-500">
              View, edit metadata, change thumbnails, or remove your published videos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/upload-video"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New</span>
          </Link>
        </div>
      </div>

      {userVideos.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl p-12 text-center">
          <Film className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            No videos uploaded yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
            You have not published any videos. Start sharing your creations with the world!
          </p>
          <Link
            href="/upload-video"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userVideos.map((video) => {
            async function handleDelete() {
              "use server";
              await deleteVideoAction(video.id);
            }

            return (
              <div
                key={video.id}
                className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <Link href={`/watch/${video.videoId}`}>
                    <img
                      src={video.thumbnail || "/upload/photos/d-cover.jpg"}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-bold bg-black/80 text-white">
                    {video.duration || "00:00"}
                  </span>

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white flex items-center gap-1">
                    {video.privacy === 1 ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-400" /> Private
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 text-emerald-400" /> Public
                      </>
                    )}
                  </span>
                </div>

                {/* Content & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/watch/${video.videoId}`}>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 hover:text-[var(--primary)] transition-colors">
                        {video.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {video.views || 0} views
                      </span>
                      <span>•</span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* PlayTube Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <Link
                      href={`/edit-video/${video.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-[var(--primary)] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <form action={handleDelete}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

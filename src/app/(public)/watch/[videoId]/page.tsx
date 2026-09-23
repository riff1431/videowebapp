import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoByVideoId, getFeaturedVideos } from "@/services/video.service";
import { VideoCard } from "@/components/common/VideoCard";
import { ThumbsUp, ThumbsDown, Share2, Bookmark, CheckCircle2, UserPlus } from "lucide-react";

export interface WatchPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { videoId } = await params;
  const video = await getVideoByVideoId(videoId);

  if (!video) {
    notFound();
  }

  const relatedVideos = await getFeaturedVideos(8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Video & Details */}
      <div className="lg:col-span-2 space-y-4">
        {/* HTML5 / Embedded Player */}
        <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-[var(--card-border)]">
          {video.videoType === "youtube" && video.youtubeUrl ? (
            <iframe
              src={video.youtubeUrl}
              title={video.title}
              className="w-full h-full"
              allowFullScreen
            />
          ) : (
            <video
              src={video.videoLocation}
              poster={video.thumbnail}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Title & Actions */}
        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)] shadow-xs space-y-3">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <Link href={`/@${video.user.username}`} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.user.avatar || "/upload/photos/d-avatar.jpg"}
                  alt={video.user.name || video.user.username}
                  className="w-10 h-10 rounded-full object-cover bg-neutral-200"
                />
              </Link>
              <div>
                <Link
                  href={`/@${video.user.username}`}
                  className="flex items-center gap-1 font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[var(--primary)]"
                >
                  <span>{video.user.name || video.user.username}</span>
                  {video.user.verified && <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                </Link>
                <div className="text-xs text-neutral-500">Channel</div>
              </div>
              <button className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Subscribe</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] overflow-hidden">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Like</span>
                </button>
                <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700" />
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-[var(--border)] text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Description & Metadata */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 text-xs space-y-1">
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              {(video.views || 0).toLocaleString()} views
            </div>
            {video.description && (
              <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related Videos Rail */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
          Up Next
        </h2>
        <div className="space-y-3">
          {relatedVideos
            .filter((v) => v.videoId !== video.videoId)
            .map((v) => (
              <VideoCard
                key={v.id}
                videoId={v.videoId}
                title={v.title}
                thumbnail={v.thumbnail}
                duration={v.duration}
                views={v.views}
                user={{
                  username: v.user.username,
                  name: v.user.name,
                  avatar: v.user.avatar,
                  verified: v.user.verified,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

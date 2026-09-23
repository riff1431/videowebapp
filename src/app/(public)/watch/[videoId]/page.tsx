import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoByVideoId, getFeaturedVideos } from "@/services/video.service";
import { VideoCard } from "@/components/common/VideoCard";
import { VideoComments } from "@/components/common/VideoComments";
import { VideoActionButtons } from "@/components/common/VideoActionButtons";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

  // Fetch comments from database
  const initialComments = await db
    .select({
      id: comments.id,
      text: comments.text,
      user: {
        name: users.name,
        username: users.username,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.videoId, video.id))
    .orderBy(desc(comments.createdAt));

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

          <div className="flex items-center gap-3">
            <Link href={`/channel/${video.user.username}`} className="shrink-0">
              <img
                src={video.user.avatar || "/upload/photos/d-avatar.jpg"}
                alt={video.user.name || video.user.username}
                className="w-10 h-10 rounded-full object-cover bg-neutral-200"
              />
            </Link>
            <div>
              <Link
                href={`/channel/${video.user.username}`}
                className="flex items-center gap-1 font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[var(--primary)]"
              >
                <span>{video.user.name || video.user.username}</span>
                {video.user.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
              </Link>
              <div className="text-xs text-neutral-500">Channel</div>
            </div>
          </div>

          <VideoActionButtons
            videoDbId={video.id}
            channelUserId={video.userId}
            initialLikes={video.likes || 0}
            initialDislikes={video.dislikes || 0}
          />

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

        {/* Video Comments Section */}
        <VideoComments
          videoId={video.id}
          initialComments={initialComments as any}
        />
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
                video={{
                  id: v.id,
                  videoId: v.videoId,
                  title: v.title,
                  thumbnail: v.thumbnail,
                  duration: v.duration,
                  views: v.views,
                  channel: {
                    id: v.user.id,
                    name: v.user.name,
                    username: v.user.username,
                    avatar: v.user.avatar,
                    verified: v.user.verified,
                  },
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

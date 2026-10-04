import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  users,
  videos,
  subscriptions,
  playlists,
  playlistVideos,
  likesDislikes,
  activities,
} from "@/db/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { VideoCard } from "@/app/themes/default/components/media/VideoCard";
import { getServerTranslations } from "@/lib/translations/server";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import {
  Video as VideoIcon,
  List,
  Sparkles,
  ThumbsUp,
  Megaphone,
  Info,
  VideoOff,
  Calendar,
  Eye,
  CheckCircle2,
  Share2,
  Heart,
  MessageCircle,
} from "lucide-react";
import { ChannelSubscribeButton } from "@/components/channels/ChannelSubscribeButton";

interface ChannelPageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function ChannelPage({
  params,
  searchParams,
}: ChannelPageProps) {
  const { t } = await getServerTranslations();
  const { username } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTab = resolvedSearchParams.page || "videos";

  // Clean username if it starts with @
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;

  // Query channel user
  const [channelUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, cleanUsername))
    .limit(1);

  if (!channelUser) {
    notFound();
  }

  // Get current viewer session to determine ownership
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isOwner = currentUserId === channelUser.id;

  // Count channel subscribers
  const [subsCount] = await db
    .select({ value: count() })
    .from(subscriptions)
    .where(eq(subscriptions.channelId, channelUser.id));

  // Check if current user is subscribed to this channel
  const [existingSub] = currentUserId
    ? await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, currentUserId),
          eq(subscriptions.channelId, channelUser.id)
        )
      )
      .limit(1)
    : [];
  const isSubscribed = Boolean(existingSub);

  const displayName = channelUser.name || channelUser.username;

  // Query data based on active tab
  let tabVideos: any[] = [];
  let tabPlaylists: any[] = [];
  let tabActivities: any[] = [];

  if (activeTab === "videos") {
    tabVideos = await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        thumbnail: videos.thumbnail,
        duration: videos.duration,
        views: videos.views,
        createdAt: videos.createdAt,
        user: {
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          verified: users.verified,
        },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          eq(videos.userId, channelUser.id),
          eq(videos.isShort, false)
        )
      )
      .orderBy(desc(videos.createdAt));
  } else if (activeTab === "shorts") {
    tabVideos = await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        thumbnail: videos.thumbnail,
        duration: videos.duration,
        views: videos.views,
        createdAt: videos.createdAt,
        user: {
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          verified: users.verified,
        },
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          eq(videos.userId, channelUser.id),
          eq(videos.isShort, true)
        )
      )
      .orderBy(desc(videos.createdAt));
  } else if (activeTab === "play-list" || activeTab === "playlists") {
    tabPlaylists = await db
      .select()
      .from(playlists)
      .where(eq(playlists.userId, channelUser.id))
      .orderBy(desc(playlists.createdAt));
  } else if (activeTab === "liked-videos") {
    tabVideos = await db
      .select({
        id: videos.id,
        videoId: videos.videoId,
        title: videos.title,
        thumbnail: videos.thumbnail,
        duration: videos.duration,
        views: videos.views,
        createdAt: videos.createdAt,
        user: {
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          verified: users.verified,
        },
      })
      .from(likesDislikes)
      .innerJoin(videos, eq(likesDislikes.videoId, videos.id))
      .innerJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          eq(likesDislikes.userId, channelUser.id),
          eq(likesDislikes.type, 1)
        )
      )
      .orderBy(desc(likesDislikes.createdAt));
  } else if (activeTab === "activities") {
    tabActivities = await db
      .select({
        id: activities.id,
        type: activities.type,
        text: activities.text,
        image: activities.image,
        time: activities.time,
      })
      .from(activities)
      .where(eq(activities.userId, channelUser.id))
      .orderBy(desc(activities.time))
      .limit(30);
  }

  const tabs = [
    { key: "videos", label: t("videos", "Videos"), href: `/@${channelUser.username}?page=videos` },
    { key: "play-list", label: t("playlists", "PlayLists"), href: `/@${channelUser.username}?page=play-list` },
    { key: "shorts", label: t("shorts", "Shorts"), href: `/@${channelUser.username}?page=shorts` },
    { key: "liked-videos", label: t("liked_videos", "Liked videos"), href: `/@${channelUser.username}?page=liked-videos` },
    { key: "activities", label: t("activities", "Activities"), href: `/@${channelUser.username}?page=activities` },
    { key: "about", label: t("about", "About"), href: `/@${channelUser.username}?page=about` },
  ];

  const coverUrl = getPublicImageUrl(channelUser.cover, "/upload/photos/d-cover.jpg") || "/upload/photos/d-cover.jpg";
  const avatarUrl = getPublicImageUrl(channelUser.avatar, "/upload/photos/d-avatar.jpg") || "/upload/photos/d-avatar.jpg";

  return (

    <div className="-m-4 md:-m-6 bg-[#f4f5f7] dark:bg-[#0f0f0f] min-h-[calc(100vh-3.5rem)] pb-20 w-full">
      {/* 1. Cover Banner Image with placeholder */}
      <div className="w-full h-48 sm:h-60 md:h-68 lg:h-72 relative bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={`${displayName} cover`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Channel Header Bar with Overlapping Avatar (relative z-10 so avatar is never cropped by banner) */}
      <div className="relative z-10 bg-white dark:bg-[#1a1a1a] border-b border-neutral-200/80 dark:border-neutral-800 px-6 sm:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3">
          {/* Avatar and Channel Info */}
          <div className="flex items-end gap-5">
            <div className="relative z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden shadow-md -mt-12 sm:-mt-14 shrink-0 bg-neutral-200 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="mb-1 flex items-baseline gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                {displayName}
              </h1>
              <span className="text-xs text-neutral-500 font-normal">
                | &nbsp;{subsCount?.value || 0} {t("subscribers", "Subscribers")}
              </span>
            </div>
          </div>

          {/* Action Button: MANAGE for owner, or Subscribe for visitor */}
          <div className="mb-2 self-start sm:self-end">
            {isOwner ? (
              <Link
                href="/manage-videos"
                className="bg-[#555555] hover:bg-[#444444] active:bg-[#333333] text-white text-xs font-semibold uppercase px-5 py-2 rounded-md shadow-xs transition-colors"
              >
                {t("manage", "MANAGE")}
              </Link>
            ) : (
              <ChannelSubscribeButton
                channelUserId={channelUser.id}
                initialSubscribed={isSubscribed}
              />
            )}
          </div>
        </div>

        {/* 3. Horizontal Navigation Tabs matching Screenshots 1, 2, 3 */}
        <div className="flex items-center gap-8 text-xs sm:text-sm font-medium pt-3 border-t border-neutral-100 dark:border-neutral-800/80 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const isActive =
              activeTab === t.key ||
              (t.key === "videos" && activeTab === "") ||
              (t.key === "play-list" && activeTab === "playlists");
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`pb-3 border-b-[3px] transition-colors whitespace-nowrap cursor-pointer ${isActive
                  ? "border-[#04abf2] text-neutral-900 dark:text-white font-semibold"
                  : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Content Area - Full width */}
      <div className="w-full px-6 sm:px-10 pt-8">
        {/* ======================================================= */}
        {/* TAB: PlayLists (Screenshot 1)                          */}
        {/* ======================================================= */}
        {(activeTab === "play-list" || activeTab === "playlists") && (
          <div className="w-full">
            {/* Header row with PlayLists icon */}
            <div className="flex items-center gap-2 pb-3 mb-8 border-b border-neutral-200/80 dark:border-neutral-800">
              <List className="w-4 h-4 text-[#04abf2]" />
              <h2 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
                {t("playlists", "PlayLists")}
              </h2>
            </div>

            {tabPlaylists.length === 0 ? (
              <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-4">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {t("no_videos_found_for_now", "No videos found for now!")}
                </p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {tabPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-xs"
                  >
                    <div className="w-full h-36 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 mb-3">
                      <List className="w-8 h-8 text-[#04abf2]" />
                    </div>
                    <h3 className="font-semibold text-sm text-neutral-800 dark:text-white truncate">
                      {pl.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {pl.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB: Videos (Screenshot 2)                              */}
        {/* ======================================================= */}
        {activeTab === "videos" && (
          <div className="w-full">
            <div className="flex items-center gap-2 pb-3 mb-8 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="w-4 h-4 rounded bg-[#04abf2] flex items-center justify-center text-white text-[10px]">
                ▶
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
                {t("latest_videos", "Latest videos")}
              </h2>
            </div>

            {tabVideos.length === 0 ? (
              <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-4">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {t("no_videos_found_for_now", "No videos found for now!")}
                </p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {tabVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    videoId={video.videoId}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                    user={video.user}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB: Shorts                                             */}
        {/* ======================================================= */}
        {activeTab === "shorts" && (
          <div className="w-full">
            <div className="flex items-center gap-2 pb-3 mb-8 border-b border-neutral-200/80 dark:border-neutral-800">
              <h2 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
                {t("shorts", "Shorts")}
              </h2>
            </div>

            {tabVideos.length === 0 ? (
              <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-4">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {t("no_videos_found_for_now", "No videos found for now!")}
                </p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tabVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    videoId={video.videoId}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                    user={video.user}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB: Liked videos                                       */}
        {/* ======================================================= */}
        {activeTab === "liked-videos" && (
          <div className="w-full">
            <div className="flex items-center gap-2 pb-3 mb-8 border-b border-neutral-200/80 dark:border-neutral-800">
              <ThumbsUp className="w-4 h-4 text-[#04abf2]" />
              <h2 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
                {t("liked_videos", "Liked videos")}
              </h2>
            </div>

            {tabVideos.length === 0 ? (
              <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-4">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {t("no_videos_found_for_now", "No videos found for now!")}
                </p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {tabVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    videoId={video.videoId}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                    views={video.views}
                    createdAt={video.createdAt}
                    user={video.user}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB: Activities (Screenshot 3)                          */}
        {/* ======================================================= */}
        {activeTab === "activities" && (
          <div className="w-full">
            <div className="flex items-center justify-between pb-3 mb-8 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#04abf2]" />
                <h2 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
                  {t("most_recent_activities", "Most recent activities")}
                </h2>
              </div>
              {isOwner && (
                <Link
                  href="/create_post"
                  className="bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-xs"
                >
                  {t("create_post", "Create Post")}
                </Link>
              )}
            </div>

            {tabActivities.length === 0 ? (
              <div className="min-h-[45vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e6f6fd] dark:bg-[#04abf2]/15 flex items-center justify-center text-[#04abf2] mb-4">
                  <VideoOff className="w-10 h-10 text-[#04abf2] stroke-[1.5]" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {t("no_activities_found_for_now", "No activities found for now.")}
                </p>
              </div>
            ) : (
              <div className="w-full max-w-3xl space-y-4">
                {tabActivities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-5 shadow-xs space-y-3"
                  >
                    {/* Author Row */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {new Date(act.time).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Text */}
                    {act.text && (
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                        {act.text}
                      </p>
                    )}

                    {/* Post Image */}
                    {act.image && (
                      <div className="rounded-lg overflow-hidden border border-neutral-100 dark:border-neutral-800 max-h-96">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={act.image}
                          alt="Post media"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB: About                                              */}
        {/* ======================================================= */}
        {activeTab === "about" && (
          <div className="w-full">
            <div className="max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800">
                <Info className="w-4 h-4 text-[#04abf2]" />
                <h2 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-white">
                  {t("about", "About")} {displayName}
                </h2>
              </div>

              <div>
                <h3 className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">
                  {t("description", "Description")}
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {channelUser.about ||
                    "Welcome to my official PlayTube channel! Subscribe for new releases, updates, and community activities."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>{t("joined", "Joined")} {new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Eye className="w-4 h-4 text-neutral-400" />
                  <span>{t("verified_creator_channel", "Verified Creator Channel")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

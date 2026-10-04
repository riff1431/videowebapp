import React from "react";
import Link from "next/link";
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { ShortCard } from "@/app/themes/default/components/media/ShortCard";
import { DataState } from "@/app/themes/default/components/patterns/DataState";

export const revalidate = 30;

export default async function ShortsPage() {
  const shortsList = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      thumbnail: videos.thumbnail,
      duration: videos.duration,
      views: videos.views,
      videoLocation: videos.videoLocation,
      user: {
        username: users.username,
        name: users.name,
        avatar: users.avatar,
        verified: users.verified,
      },
    })
    .from(videos)
    .innerJoin(users, eq(videos.userId, users.id))
    .where(eq(videos.isShort, true))
    .orderBy(desc(videos.createdAt))
    .limit(28);

  return (
    <div className="w-full space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end pb-2 border-b border-[var(--border)]/40">
        <Link
          href="/upload-video?type=shorts"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[var(--default-brand-red)] text-[var(--default-brand-red)] hover:bg-[var(--default-brand-red)] hover:text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create</span>
        </Link>
      </div>

      <DataState
        empty={shortsList.length === 0}
        emptyTitle="No shorts found for now!"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {shortsList.map((short) => (
            <ShortCard key={short.id} short={short} />
          ))}
        </div>
      </DataState>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { getPublicImageUrl } from "@/lib/storage/image-url";
import { Badge } from "@/app/themes/default/components/ui/badge";

export interface ShortItem {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string;
  views?: number | null;
  createdAt?: Date | string;
}

export function ShortCard({ short }: { short: ShortItem }) {
  const thumbUrl =
    getPublicImageUrl(short.thumbnail, "/upload/photos/d-cover.jpg") ||
    "/upload/photos/d-cover.jpg";

  return (
    <div className="short-card-item group rounded-[16px] p-2 transition-all cursor-pointer">
      <Link
        href={`/shorts?v=${short.videoId}`}
        className="block relative aspect-[9/16] w-full overflow-hidden rounded-[16px] bg-neutral-200 dark:bg-neutral-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl}
          alt={short.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="new">NEW</Badge>
        </div>
      </Link>

      <div className="mt-2.5 px-0.5">
        <Link href={`/shorts?v=${short.videoId}`}>
          <h3
            title={short.title}
            className="line-clamp-2 text-xs font-semibold text-[var(--default-text)] leading-snug group-hover:text-[var(--default-brand-red)] transition-colors"
          >
            {short.title}
          </h3>
        </Link>
        <p className="mt-1 text-[11px] text-[var(--default-muted)]">
          {short.views?.toLocaleString() || 0} views
        </p>
      </div>
    </div>
  );
}

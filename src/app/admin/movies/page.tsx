import React from "react";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ManageMoviesClient, AdminMovieItem } from "@/components/admin/ManageMoviesClient";

export const dynamic = "force-dynamic";

export default async function ManageMoviesPage() {
  const rawMovies = await db
    .select({
      id: videos.id,
      videoId: videos.videoId,
      title: videos.title,
      movieRelease: videos.movieRelease,
      createdAt: videos.createdAt,
    })
    .from(videos)
    .where(eq(videos.isMovie, true))
    .orderBy(desc(videos.createdAt))
    .limit(500);

  const initialMovies: AdminMovieItem[] = rawMovies.map((m) => ({
    id: m.id,
    videoId: m.videoId,
    title: m.title,
    movieRelease: m.movieRelease,
    createdAt: m.createdAt,
  }));

  return <ManageMoviesClient initialMovies={initialMovies} />;
}

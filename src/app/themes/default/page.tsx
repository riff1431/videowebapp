import React from "react";
import { getFeaturedVideos, getCategories, getShortVideos } from "@/services/video.service";
import { DefaultHomeClient } from "./components/DefaultHomeClient";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const [featuredVideos, shortVideos, categoriesList, session] = await Promise.all([
    getFeaturedVideos(28),
    getShortVideos(18),
    getCategories(),
    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  return (
    <DefaultHomeClient
      featuredVideos={featuredVideos}
      shortVideos={shortVideos}
      categoriesList={categoriesList}
      userName={session?.user?.name || (session?.user as any)?.username}
    />
  );
}

import React from "react";
import { getFeaturedVideos, getCategories } from "@/services/video.service";
import { DefaultHomeClient } from "./components/DefaultHomeClient";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const [featuredVideos, categoriesList, session] = await Promise.all([
    getFeaturedVideos(12),
    getCategories(),
    auth.api.getSession({
      headers: await headers(),
    }),
  ]);

  return (
    <DefaultHomeClient
      featuredVideos={featuredVideos}
      categoriesList={categoriesList}
      userName={session?.user?.name || (session?.user as any)?.username}
    />
  );
}

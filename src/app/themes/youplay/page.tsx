import React from "react";
import { getFeaturedVideos, getCategories } from "@/services/video.service";
import { HomeClient } from "@/components/common/HomeClient";

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  const [featuredVideos, categoriesList] = await Promise.all([
    getFeaturedVideos(12),
    getCategories(),
  ]);

  return (
    <HomeClient featuredVideos={featuredVideos} categoriesList={categoriesList} />
  );
}

import React from "react";
import { CreateVideoAdClient } from "@/components/admin/CreateVideoAdClient";

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function CreateVideoAdPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  let type: "video" | "image" | "vast" = "video";

  if (resolvedParams?.type === "image") {
    type = "image";
  } else if (resolvedParams?.type === "vast" || resolvedParams?.type === "vpaid") {
    type = "vast";
  }

  return <CreateVideoAdClient type={type} />;
}

import React from "react";
import { db } from "@/db";
import { siteConfig, managePro } from "@/db/schema";
import { inArray, asc } from "drizzle-orm";
import {
  ProSystemSettingsClient,
  ProPackageItem,
} from "@/components/admin/ProSystemSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminProSysSettingsPage() {
  const proConfigKeys = [
    "go_pro",
    "require_subcription",
    "pro_google",
    "who_can_pro_google",
    "pro_pkg_price",
    "user_max_import",
    "max_upload_free_users",
    "max_upload_pro_users",
  ];

  const [configs, rawPackages] = await Promise.all([
    db
      .select()
      .from(siteConfig)
      .where(inArray(siteConfig.name, proConfigKeys)),
    db.select().from(managePro).orderBy(asc(managePro.id)),
  ]);

  const configObj: Record<string, string> = {
    go_pro: "on",
    require_subcription: "off",
    pro_google: "on",
    who_can_pro_google: "all",
    pro_pkg_price: "10",
    user_max_import: "100",
    max_upload_free_users: "1000000000",
    max_upload_pro_users: "1000000000",
  };

  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  const packagesList: ProPackageItem[] = rawPackages.map((p) => ({
    id: p.id,
    type: p.type,
    price: p.price,
    featuredVideos: p.featuredVideos,
    verifiedBadge: p.verifiedBadge,
    discount: p.discount,
    image: p.image || "",
    nightImage: p.nightImage || "",
    color: p.color,
    description: p.description || "",
    status: p.status,
    time: p.time,
    timeCount: p.timeCount,
    maxUpload: p.maxUpload,
    features: p.features || "{}",
  }));

  return (
    <ProSystemSettingsClient
      initialConfig={configObj}
      initialPackages={packagesList}
    />
  );
}

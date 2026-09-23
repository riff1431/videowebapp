import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { AdminSettingsForm } from "@/components/forms/AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settingsKeys = [
    "title",
    "name",
    "email",
    "theme",
    "description",
    "keyword",
    "validation",
    "max_upload",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, settingsKeys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          General Site Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure site name, metadata, email delivery, and upload parameters imported from PlayTube.
        </p>
      </div>

      <AdminSettingsForm initialConfig={configObj} />
    </div>
  );
}

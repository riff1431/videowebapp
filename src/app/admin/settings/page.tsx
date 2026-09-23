import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { Settings, Save, Server, Globe, Mail } from "lucide-react";

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

  const configMap = new Map(configs.map((c) => [c.name, c.value]));

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

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Site Title</label>
            <input
              type="text"
              defaultValue={configMap.get("title") || "PlayTube"}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Site Name</label>
            <input
              type="text"
              defaultValue={configMap.get("name") || "PlayTube"}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Site Admin Email</label>
            <input
              type="email"
              defaultValue={configMap.get("email") || "admin@playtube.local"}
              className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Default Theme</label>
            <input
              type="text"
              disabled
              defaultValue={configMap.get("theme") || "youplay"}
              className="w-full text-sm bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Meta Keywords</label>
          <input
            type="text"
            defaultValue={configMap.get("keyword") || "playtube, video sharing"}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Meta Description</label>
          <textarea
            rows={3}
            defaultValue={configMap.get("description") || "PlayTube Video Sharing Platform"}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

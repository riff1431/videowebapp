import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Megaphone, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const adKeys = ["header_ad", "footer_ad", "watch_side_bar_ad", "watch_comments_ad"];
  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, adKeys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  async function handleSave(formData: FormData) {
    "use server";
    await updateAdminSettingsAction(formData);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--primary)] flex items-center justify-center">
          <Megaphone className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Manage Website Advertisements
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Inject Google AdSense, HTML banners, or custom ad tags across site layouts
          </p>
        </div>
      </div>

      <form action={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Header Banner Ad (Under navigation bar)
          </label>
          <textarea
            name="header_ad"
            defaultValue={configObj.header_ad || ""}
            rows={3}
            placeholder='<script async src="..."></script>'
            className="w-full p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Footer Banner Ad (Above footer)
          </label>
          <textarea
            name="footer_ad"
            defaultValue={configObj.footer_ad || ""}
            rows={3}
            placeholder='<a href="..."><img src="..." /></a>'
            className="w-full p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Watch Page Sidebar Ad (Above related videos)
          </label>
          <textarea
            name="watch_side_bar_ad"
            defaultValue={configObj.watch_side_bar_ad || ""}
            rows={3}
            placeholder='<ins class="adsbygoogle" ...></ins>'
            className="w-full p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Watch Page Comments Ad (Above discussion)
          </label>
          <textarea
            name="watch_comments_ad"
            defaultValue={configObj.watch_comments_ad || ""}
            rows={3}
            placeholder='<div>Custom Responsive Banner</div>'
            className="w-full p-3 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Ad Placements</span>
          </button>
        </div>
      </form>
    </div>
  );
}

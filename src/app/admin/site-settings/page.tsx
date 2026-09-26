import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Globe, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const keys = [
    "title",
    "name",
    "keyword",
    "description",
    "google",
    "google_vignette",
    "lookup_key",
    "point_level_system",
    "point_allow_withdrawal",
    "dollar_to_point_cost",
    "comments_point",
    "likes_point",
    "dislikes_point",
    "watching_point",
    "upload_point",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, keys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  async function handleSave(formData: FormData) {
    "use server";
    await updateAdminSettingsAction(formData);
  }

  return (
    <div className="space-y-6 text-[var(--admin-text-main)] w-full max-w-full">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold tracking-tight text-[var(--admin-text-main)]">
          Website Information
        </h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; Website Information
        </p>
      </div>

      <form action={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card 1: Website Information */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#04abf2]" />
              <span>Website Information</span>
            </h6>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Title</label>
              <input
                type="text"
                name="title"
                defaultValue={configObj.title || "PlayTube - The Ultimate Video Sharing Platform"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
              />
              <small className="text-[11px] text-[var(--admin-text-muted)] block">
                Your website general title, it will appear on Google and on your browser tab.
              </small>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Name</label>
              <input
                type="text"
                name="name"
                defaultValue={configObj.name || "PlayTube"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
              />
              <small className="text-[11px] text-[var(--admin-text-muted)] block">
                Your website name, it will appear on website footer and emails.
              </small>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Keywords</label>
              <input
                type="text"
                name="keyword"
                defaultValue={configObj.keyword || "video, streaming, playtube, sharing, movies"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
              />
              <small className="text-[11px] text-[var(--admin-text-muted)] block">
                Your website keywords, used mostly for SEO and search engines.
              </small>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Description</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={configObj.description || "PlayTube is the most advanced video sharing platform."}
                className="w-full p-3 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
              />
              <small className="text-[11px] text-[var(--admin-text-muted)] block">
                Your website description, used mostly for SEO and search engines. Max 100 characters recommended.
              </small>
            </div>
          </div>

          {/* Right Column: Features API Keys & Point System Settings */}
          <div className="space-y-6">
            {/* Card 2: Features API Keys & Custom Scripts */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
              <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3">
                Features API Keys & Tracking
              </h6>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">
                  Google Analytics Code / Custom HTML Header Code
                </label>
                <textarea
                  name="google"
                  rows={3}
                  defaultValue={configObj.google || ""}
                  placeholder="<!-- Global site tag (gtag.js) - Google Analytics -->"
                  className="w-full p-3 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">
                  Google Vignette / Ad Code
                </label>
                <textarea
                  name="google_vignette"
                  rows={2}
                  defaultValue={configObj.google_vignette || ""}
                  className="w-full p-3 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">
                  Extreme IP Lookup Key
                </label>
                <input
                  type="text"
                  name="lookup_key"
                  defaultValue={configObj.lookup_key || ""}
                  className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)] font-mono"
                />
                <small className="text-[11px] text-[var(--admin-text-muted)] block">
                  Extreme IP Lookup Key to retrieve user location for geo-blocking.
                </small>
              </div>
            </div>

            {/* Card 3: Point System Settings */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
              <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3">
                Point System & Rewards Settings
              </h6>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Point System</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">
                    Users earn reward points for liking, commenting, and watching videos.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="point_level_system" value="0" />
                  <input
                    type="checkbox"
                    name="point_level_system"
                    value="1"
                    defaultChecked={configObj.point_level_system === "1"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-main)]">$1.00 = ? Points</label>
                  <input
                    type="number"
                    name="dollar_to_point_cost"
                    defaultValue={configObj.dollar_to_point_cost || "100"}
                    className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-main)]">Points per Comment</label>
                  <input
                    type="number"
                    name="comments_point"
                    defaultValue={configObj.comments_point || "5"}
                    className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-main)]">Points per Like</label>
                  <input
                    type="number"
                    name="likes_point"
                    defaultValue={configObj.likes_point || "2"}
                    className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-main)]">Points per Video Watch</label>
                  <input
                    type="number"
                    name="watching_point"
                    defaultValue={configObj.watching_point || "1"}
                    className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Film, PlayCircle, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminVideoSettingsPage() {
  const keys = [
    "autoplay_system",
    "trailer_system",
    "who_can_trailer_system",
    "post_system",
    "who_can_post",
    "playlist_subscribe",
    "who_can_playlist",
    "censored_words",
    "videos_load_limit",
    "date_style",
    "comments_default_num",
    "comment_system",
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
          Video & Player Settings
        </h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; Video & Player Settings
        </p>
      </div>

      <form action={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card 1: Player & Playback Features */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-[#04abf2]" />
              <span>Player & Playback Configuration</span>
            </h6>

            {/* Autoplay System */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--admin-text-main)]">Autoplay System</p>
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Autoplay the next video in list or playlist.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="autoplay_system" value="off" />
                <input
                  type="checkbox"
                  name="autoplay_system"
                  value="on"
                  defaultChecked={configObj.autoplay_system !== "off"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
              </label>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            {/* Movie Trailers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Add Trailer with Movie</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">
                    Allow adding preview trailers alongside uploaded full movies.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="trailer_system" value="off" />
                  <input
                    type="checkbox"
                    name="trailer_system"
                    value="on"
                    defaultChecked={configObj.trailer_system === "on"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <div className="pt-1">
                <label className="text-[11px] text-[var(--admin-text-muted)] block mb-1">Who can use movie trailers?</label>
                <select
                  name="who_can_trailer_system"
                  defaultValue={configObj.who_can_trailer_system || "admin"}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
                >
                  <option value="admin">Administrators Only</option>
                  <option value="all">All Users</option>
                  <option value="pro">Pro Members Only</option>
                </select>
              </div>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            {/* Pagination limit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Video Pagination Limit</label>
              <input
                type="number"
                name="videos_load_limit"
                defaultValue={configObj.videos_load_limit || "20"}
                min="2"
                max="100"
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
              />
              <small className="text-[11px] text-[var(--admin-text-muted)] block">
                Number of videos displayed on each channel and feed page.
              </small>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            {/* Date style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Date Format Style</label>
              <select
                name="date_style"
                defaultValue={configObj.date_style || "m/d/y"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
              >
                <option value="m/d/y">mm/dd/yy (e.g. 09/26/26)</option>
                <option value="d/m/y">dd/mm/yy (e.g. 26/09/26)</option>
                <option value="y/m/d">yy/mm/dd (e.g. 26/09/26)</option>
                <option value="d-F-Y">dd Month yyyy (e.g. 26 September 2026)</option>
              </select>
            </div>
          </div>

          {/* Card 2: Comments & Moderation Settings */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
              <Film className="w-4 h-4 text-[#04abf2]" />
              <span>Comments & Content Moderation</span>
            </h6>

            {/* Comment System */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Comment System Provider</label>
              <select
                name="comment_system"
                defaultValue={configObj.comment_system || "default"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
              >
                <option value="default">PlayTube Built-in Comments</option>
                <option value="fb">Facebook Comments</option>
                <option value="both">Both (PlayTube + Facebook)</option>
              </select>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            {/* Default shown comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Default Shown Comments</label>
              <select
                name="comments_default_num"
                defaultValue={configObj.comments_default_num || "20"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
              >
                <option value="10">10 Comments</option>
                <option value="20">20 Comments</option>
                <option value="30">30 Comments</option>
                <option value="50">50 Comments</option>
              </select>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            {/* Censored words */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Censored Words</label>
              <textarea
                name="censored_words"
                rows={4}
                defaultValue={configObj.censored_words || "badword1, badword2, spamword"}
                className="w-full p-3 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
              />
              <small className="text-[11px] text-[var(--admin-text-muted)] block">
                Words separated by a comma (,) will be masked with asterisks (***) in comments and titles.
              </small>
            </div>
          </div>
        </div>

        {/* Save Button */}
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

import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Clapperboard, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFfmpegPage() {
  const ffmpegKeys = [
    "ffmpeg_system",
    "ffmpeg_binary_path",
    "transcode_240p",
    "transcode_360p",
    "transcode_480p",
    "transcode_720p",
    "transcode_1080p",
    "transcode_2k",
    "transcode_4k",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, ffmpegKeys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  async function handleSave(formData: FormData) {
    "use server";
    await updateAdminSettingsAction(formData);
  }

  return (
    <div className="space-y-6 max-w-4xl text-[var(--admin-text-main)]">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-[var(--admin-text-main)]">
          Import & Upload Configuration
        </h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; Import & Upload Configuration
        </p>
      </div>

      <form action={handleSave} className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl p-6 shadow-xs space-y-6 transition-colors duration-200">
        <div>
          <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
            FFmpeg Transcoding Engine
          </label>
          <select
            name="ffmpeg_system"
            defaultValue={configObj.ffmpeg_system || "on"}
            className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="on" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Enabled (Server encodes uploaded videos)</option>
            <option value="off" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Disabled (Direct storage without encoding)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
            FFmpeg Binary Path
          </label>
          <input
            type="text"
            name="ffmpeg_binary_path"
            defaultValue={configObj.ffmpeg_binary_path || "/usr/bin/ffmpeg"}
            placeholder="/usr/bin/ffmpeg or C:\ffmpeg\bin\ffmpeg.exe"
            className="w-full px-3.5 py-2 text-xs font-mono bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] placeholder-[var(--admin-text-muted)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-[var(--admin-text-main)] mb-3 pb-2 border-b border-[var(--admin-card-border)]">
            Resolution Encoding Profiles
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
            {[
              { id: "transcode_360p", label: "360p (SD)" },
              { id: "transcode_480p", label: "480p (SD)" },
              { id: "transcode_720p", label: "720p (HD)" },
              { id: "transcode_1080p", label: "1080p (FHD)" },
              { id: "transcode_2k", label: "2K (QHD)" },
              { id: "transcode_4k", label: "4K (UHD)" },
            ].map((res) => (
              <label key={res.id} className="flex items-center gap-2 p-3 rounded-lg border border-[var(--admin-card-border)] bg-[var(--admin-card-hover)] text-[var(--admin-text-main)] cursor-pointer">
                <input
                  type="checkbox"
                  name={res.id}
                  value="1"
                  defaultChecked={configObj[res.id] !== "0"}
                  className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span>{res.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--admin-card-border)] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save FFmpeg Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}

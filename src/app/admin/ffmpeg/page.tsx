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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <Clapperboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            FFmpeg & Video Transcoding Setup
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure server FFmpeg binaries and automated multi-resolution encoding profiles
          </p>
        </div>
      </div>

      <form action={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            FFmpeg Transcoding Engine
          </label>
          <select
            name="ffmpeg_system"
            defaultValue={configObj.ffmpeg_system || "on"}
            className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
          >
            <option value="on">Enabled (Server encodes uploaded videos)</option>
            <option value="off">Disabled (Direct storage without encoding)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            FFmpeg Binary Path
          </label>
          <input
            type="text"
            name="ffmpeg_binary_path"
            defaultValue={configObj.ffmpeg_binary_path || "/usr/bin/ffmpeg"}
            placeholder="/usr/bin/ffmpeg or C:\ffmpeg\bin\ffmpeg.exe"
            className="w-full px-3.5 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
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
              <label key={res.id} className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50/50">
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

        <div className="pt-4 border-t border-gray-100 flex justify-end">
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

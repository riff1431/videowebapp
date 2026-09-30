import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Radio, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLivePage() {
  const keys = [
    "live_video",
    "who_can_live_video",
    "agora_app_id",
    "agora_customer_id",
    "agora_customer_certificate",
    "live_token",
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
    <div className="space-y-6 text-neutral-800 dark:text-[var(--admin-text-main)] w-full max-w-full">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Live Settings
        </h3>
        <p className="text-xs text-neutral-500 dark:text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; Live Settings
        </p>
      </div>

      {/* Info Notice */}
      <div className="w-full bg-blue-50 dark:bg-[#1e293b]/60 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-md text-xs">
        <strong>Info:</strong> PlayTube Live Streaming is powered by Agora.io WebRTC infrastructure. Enter your Agora App ID and certificates below to enable live broadcast.
      </div>

      <form action={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card: Live Streaming Configuration */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              <span>Live Streaming Configuration</span>
            </h6>

            {/* Toggle Live Streaming */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--admin-text-main)]">Live Streaming</p>
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Users can start real-time broadcasts instantly.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="live_video" value="0" />
                <input
                  type="checkbox"
                  name="live_video"
                  value="1"
                  defaultChecked={configObj.live_video === "1"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
              </label>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Who can broadcast live?</label>
              <select
                name="who_can_live_video"
                defaultValue={configObj.who_can_live_video || "all"}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
              >
                <option value="all">All Registered Users</option>
                <option value="pro">Pro VIP Members Only</option>
                <option value="admin">Administrators Only</option>
              </select>
            </div>

            <hr className="border-[var(--admin-card-border)]" />

            {/* Agora App ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Agora App ID</label>
              <input
                type="text"
                name="agora_app_id"
                defaultValue={configObj.agora_app_id || ""}
                placeholder="Agora Project App ID"
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
              />
            </div>

            {/* Agora Customer ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Agora Customer ID</label>
              <input
                type="text"
                name="agora_customer_id"
                defaultValue={configObj.agora_customer_id || ""}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
              />
            </div>

            {/* Agora App Certificate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text-main)]">Agora App Certificate</label>
              <input
                type="password"
                name="agora_customer_certificate"
                defaultValue={configObj.agora_customer_certificate || ""}
                className="w-full px-3.5 py-2 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
              />
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

import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Clock, Play, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCronJobSettingsPage() {
  const keys = [
    "cronjob_last_run",
    "site_url",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, keys));

  const configObj: Record<string, string> = {};
  configs.forEach((c) => {
    configObj[c.name] = c.value;
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const lastRun = configObj.cronjob_last_run
    ? new Date(Number(configObj.cronjob_last_run) * 1000).toLocaleString()
    : "Never executed yet";

  async function handleTriggerNow() {
    "use server";
    const now = Math.floor(Date.now() / 1000).toString();
    const formData = new FormData();
    formData.set("cronjob_last_run", now);
    await updateAdminSettingsAction(formData);
  }

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[var(--admin-text-main)] w-full max-w-full">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          CronJob Settings
        </h3>
        <p className="text-xs text-neutral-500 dark:text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; CronJob Settings
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-6 shadow-xs space-y-5">
          <h6 className="text-sm font-bold text-neutral-900 dark:text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Scheduled CronJob Background Tasks</span>
          </h6>

          {/* Warning / Setup Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-700 dark:text-amber-400 text-xs">
            Make sure to add this cronjob to your crontab list or background runner. The target runs every 5 minutes:
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-[var(--admin-text-main)]">CronJob Command (Linux Crontab)</label>
            <div className="p-3 bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-xs text-[#04abf2] select-all">
              */5 * * * * curl {appUrl}/api/cron &gt;/dev/null 2&gt;&amp;1
            </div>
            <small className="text-[11px] text-neutral-500 dark:text-[var(--admin-text-muted)] block">
              Or run in local terminal: <code className="text-neutral-700 dark:text-neutral-300 font-semibold">npm run cron</code>
            </small>
          </div>

          <hr className="border-[var(--admin-card-border)]" />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800 dark:text-[var(--admin-text-main)]">CronJob Last Run</label>
            <div className="p-3 bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-xs font-mono text-neutral-700 dark:text-neutral-300">
              {lastRun}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <form action={handleTriggerNow}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Cron Tasks Now</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

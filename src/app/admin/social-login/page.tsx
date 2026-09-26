import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Share2, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSocialLoginPage() {
  const keys = [
    "fb_login",
    "facebook_app_ID",
    "facebook_app_key",
    "tw_login",
    "twitter_app_ID",
    "twitter_app_key",
    "plus_login",
    "google_app_ID",
    "google_app_key",
    "vk_login",
    "vk_app_id",
    "vk_app_key",
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
          Social Login Settings
        </h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; Social Login Settings
        </p>
      </div>

      {/* Info notice */}
      <div className="w-full bg-[#1e293b]/60 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-md text-xs">
        <strong>Info:</strong> Configure third-party OAuth provider credentials for seamless one-click user sign in.
      </div>

      <form action={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Card 1: Facebook Login */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-card-border)] pb-3">
              <div>
                <p className="text-sm font-bold text-[var(--admin-text-main)]">Facebook Login</p>
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Enable login with Facebook account.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="fb_login" value="off" />
                <input
                  type="checkbox"
                  name="fb_login"
                  value="on"
                  defaultChecked={configObj.fb_login === "on"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">Application ID</label>
                <input
                  type="text"
                  name="facebook_app_ID"
                  defaultValue={configObj.facebook_app_ID || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">Application Secret Key</label>
                <input
                  type="password"
                  name="facebook_app_key"
                  defaultValue={configObj.facebook_app_key || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Google Login */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-card-border)] pb-3">
              <div>
                <p className="text-sm font-bold text-[var(--admin-text-main)]">Google Login</p>
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Enable login with Google OAuth credentials.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="plus_login" value="off" />
                <input
                  type="checkbox"
                  name="plus_login"
                  value="on"
                  defaultChecked={configObj.plus_login === "on"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">Client ID</label>
                <input
                  type="text"
                  name="google_app_ID"
                  defaultValue={configObj.google_app_ID || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">Client Secret</label>
                <input
                  type="password"
                  name="google_app_key"
                  defaultValue={configObj.google_app_key || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Twitter / X Login */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-card-border)] pb-3">
              <div>
                <p className="text-sm font-bold text-[var(--admin-text-main)]">Twitter / X Login</p>
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Enable login with Twitter/X developer credentials.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="tw_login" value="off" />
                <input
                  type="checkbox"
                  name="tw_login"
                  value="on"
                  defaultChecked={configObj.tw_login === "on"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">Consumer Key (API Key)</label>
                <input
                  type="text"
                  name="twitter_app_ID"
                  defaultValue={configObj.twitter_app_ID || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">Consumer Secret</label>
                <input
                  type="password"
                  name="twitter_app_key"
                  defaultValue={configObj.twitter_app_key || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
            </div>
          </div>

          {/* Card 4: VKontakte Login */}
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-card-border)] pb-3">
              <div>
                <p className="text-sm font-bold text-[var(--admin-text-main)]">VK Login</p>
                <p className="text-[11px] text-[var(--admin-text-muted)]">
                  Enable login with VK credentials.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="hidden" name="vk_login" value="off" />
                <input
                  type="checkbox"
                  name="vk_login"
                  value="on"
                  defaultChecked={configObj.vk_login === "on"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">VK App ID</label>
                <input
                  type="text"
                  name="vk_app_id"
                  defaultValue={configObj.vk_app_id || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--admin-text-main)]">VK Secret Key</label>
                <input
                  type="password"
                  name="vk_app_key"
                  defaultValue={configObj.vk_app_key || ""}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md font-mono text-[var(--admin-text-main)]"
                />
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

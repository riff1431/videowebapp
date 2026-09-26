import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Settings, Save, ShieldAlert, Users, Sliders } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminGeneralSettingsPage() {
  const keys = [
    "switch_account",
    "switch_account_counts",
    "developer_mode",
    "developers_page",
    "maintenance_mode",
    "seo_link",
    "history_system",
    "popular_channels",
    "article_system",
    "who_can_article",
    "show_articles",
    "pop_up_18",
    "time_18",
    "lang_modal",
    "language",
    "report_copyright",
    "playlist_subscribe",
    "who_can_playlist",
    "post_system",
    "who_can_post",
    "user_registration",
    "validation",
    "auto_username",
    "two_factor_setting",
    "google_authenticator",
    "recaptcha",
    "recaptcha_key",
    "prevent_system",
    "bad_login_limit",
    "lock_time",
    "delete_account",
    "verification_badge",
    "block_system",
    "donate_system",
    "who_can_donate",
    "invite_links_system",
    "who_can_invite_links",
    "server",
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
          General Configuration
        </h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; General Configuration
        </p>
      </div>

      <form action={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: System & Feature Configurations */}
          <div className="space-y-6">
            {/* Card 1: Core System Features */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
              <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#04abf2]" />
                <span>General System Features</span>
              </h6>

              {/* Switch Account */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Switch Account</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Allow users to switch between multiple linked channels.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="switch_account" value="off" />
                  <input
                    type="checkbox"
                    name="switch_account"
                    value="on"
                    defaultChecked={configObj.switch_account === "on"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Developer Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Developer Mode</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Turn on detailed error and stack traces for debugging.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="developer_mode" value="off" />
                  <input
                    type="checkbox"
                    name="developer_mode"
                    value="on"
                    defaultChecked={configObj.developer_mode === "on"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Maintenance Mode</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Take the entire site down for maintenance.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="maintenance_mode" value="off" />
                  <input
                    type="checkbox"
                    name="maintenance_mode"
                    value="on"
                    defaultChecked={configObj.maintenance_mode === "on"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* History System */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">History System</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Users will be able to view their watched videos history.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="history_system" value="off" />
                  <input
                    type="checkbox"
                    name="history_system"
                    value="on"
                    defaultChecked={configObj.history_system !== "off"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Article / Blog System */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--admin-text-main)]">Article System</p>
                    <p className="text-[11px] text-[var(--admin-text-muted)]">Create articles and blog posts.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="hidden" name="article_system" value="off" />
                    <input
                      type="checkbox"
                      name="article_system"
                      value="on"
                      defaultChecked={configObj.article_system !== "off"}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                  </label>
                </div>
                <select
                  name="who_can_article"
                  defaultValue={configObj.who_can_article || "all"}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
                >
                  <option value="all">Who can post articles: All Users</option>
                  <option value="pro">Who can post articles: Pro Users Only</option>
                  <option value="admin">Who can post articles: Admins Only</option>
                </select>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Post System */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--admin-text-main)]">Channel Community Posts</p>
                    <p className="text-[11px] text-[var(--admin-text-muted)]">Allow channels to publish text & image community posts.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="hidden" name="post_system" value="off" />
                    <input
                      type="checkbox"
                      name="post_system"
                      value="on"
                      defaultChecked={configObj.post_system !== "off"}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                  </label>
                </div>
                <select
                  name="who_can_post"
                  defaultValue={configObj.who_can_post || "all"}
                  className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md text-[var(--admin-text-main)]"
                >
                  <option value="all">Who can post: All Users</option>
                  <option value="pro">Who can post: Pro Users Only</option>
                  <option value="admin">Who can post: Admins Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: Authentication & User Security */}
          <div className="space-y-6">
            {/* Card 2: Login & Registration Policies */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
              <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Login & Registration</span>
              </h6>

              {/* User Registration */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">User Registration</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Allow new visitors to register on the site.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="user_registration" value="off" />
                  <input
                    type="checkbox"
                    name="user_registration"
                    value="on"
                    defaultChecked={configObj.user_registration !== "off"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Account Validation */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Email Activation</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Send an activation confirmation email before login.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="validation" value="off" />
                  <input
                    type="checkbox"
                    name="validation"
                    value="on"
                    defaultChecked={configObj.validation === "on"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Require verification OTP on user login.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="two_factor_setting" value="off" />
                  <input
                    type="checkbox"
                    name="two_factor_setting"
                    value="on"
                    defaultChecked={configObj.two_factor_setting === "on"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <hr className="border-[var(--admin-card-border)]" />

              {/* Delete Account */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Delete User Account</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Allow users to permanently delete their account and data.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="delete_account" value="off" />
                  <input
                    type="checkbox"
                    name="delete_account"
                    value="on"
                    defaultChecked={configObj.delete_account !== "off"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>
            </div>

            {/* Card 3: Security & Brute Force Prevention */}
            <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-lg p-5 shadow-xs space-y-4">
              <h6 className="text-sm font-bold text-[var(--admin-text-main)] border-b border-[var(--admin-card-border)] pb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Security & Rate Limiting</span>
              </h6>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[var(--admin-text-main)]">Prevent Bad Login Attempts</p>
                  <p className="text-[11px] text-[var(--admin-text-muted)]">Lock accounts after consecutive invalid password attempts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="hidden" name="prevent_system" value="0" />
                  <input
                    type="checkbox"
                    name="prevent_system"
                    value="1"
                    defaultChecked={configObj.prevent_system === "1"}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04abf2]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-main)]">Bad Login Limit</label>
                  <input
                    type="number"
                    name="bad_login_limit"
                    defaultValue={configObj.bad_login_limit || "5"}
                    className="w-full px-3 py-1.5 text-xs bg-[var(--admin-bg)] border border-[var(--admin-card-border)] rounded-md focus:outline-hidden focus:border-[#04abf2] text-[var(--admin-text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-main)]">Lockout Time (Minutes)</label>
                  <input
                    type="number"
                    name="lock_time"
                    defaultValue={configObj.lock_time || "10"}
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
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}

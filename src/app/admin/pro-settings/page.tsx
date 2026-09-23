import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Crown, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProSettingsPage() {
  const proKeys = [
    "go_pro",
    "pro_pkg_price_monthly",
    "pro_pkg_price_quarterly",
    "pro_pkg_price_yearly",
    "pro_upload_limit",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, proKeys));

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Crown className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text-main)] tracking-tight">
            PRO System Settings
          </h1>
          <p className="text-sm text-[var(--admin-text-muted)] mt-0.5">
            Configure VIP membership plans, prices, and upload quotas
          </p>
        </div>
      </div>

      <form action={handleSave} className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl p-6 shadow-xs space-y-6 transition-colors duration-200">
        <div>
          <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
            Enable PRO Membership System
          </label>
          <select
            name="go_pro"
            defaultValue={configObj.go_pro || "on"}
            className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="on" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Enabled (Users can buy PRO packages)</option>
            <option value="off" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Disabled (Hide PRO options)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              Star Plan Price ($ / Mo)
            </label>
            <input
              type="number"
              name="pro_pkg_price_monthly"
              defaultValue={configObj.pro_pkg_price_monthly || "19"}
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              Hot Plan Price ($ / 3-Mo)
            </label>
            <input
              type="number"
              name="pro_pkg_price_quarterly"
              defaultValue={configObj.pro_pkg_price_quarterly || "49"}
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              Ultimate Price ($ / Yr)
            </label>
            <input
              type="number"
              name="pro_pkg_price_yearly"
              defaultValue={configObj.pro_pkg_price_yearly || "99"}
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
            Max Upload Limit for PRO Users
          </label>
          <select
            name="pro_upload_limit"
            defaultValue={configObj.pro_upload_limit || "unlimited"}
            className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="1GB" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">1 GB</option>
            <option value="5GB" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">5 GB</option>
            <option value="10GB" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">10 GB</option>
            <option value="unlimited" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Unlimited Storage</option>
          </select>
        </div>

        <div className="pt-4 border-t border-[var(--admin-card-border)] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save PRO Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

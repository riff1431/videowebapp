import React from "react";
import { db } from "@/db";
import { siteConfig } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";
import { Mail, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEmailSettingsPage() {
  const emailKeys = [
    "smtp_or_mail",
    "smtp_host",
    "smtp_port",
    "smtp_username",
    "smtp_password",
    "smtp_encryption",
  ];

  const configs = await db
    .select()
    .from(siteConfig)
    .where(inArray(siteConfig.name, emailKeys));

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
          E-mail Setup
        </h3>
        <p className="text-xs text-[var(--admin-text-muted)] mt-1">
          Admin Panel &gt; Settings &gt; E-mail Setup
        </p>
      </div>

      <form action={handleSave} className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl p-6 shadow-xs space-y-6 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              Mailer Driver
            </label>
            <select
              name="smtp_or_mail"
              defaultValue={configObj.smtp_or_mail || "smtp"}
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)]"
            >
              <option value="smtp" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">SMTP (Recommended)</option>
              <option value="mail" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Server Mail</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              SMTP Port
            </label>
            <input
              type="text"
              name="smtp_port"
              defaultValue={configObj.smtp_port || "587"}
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              name="smtp_host"
              defaultValue={configObj.smtp_host || "smtp.mailgun.org"}
              placeholder="smtp.example.com"
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)] placeholder-[var(--admin-text-muted)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              name="smtp_username"
              defaultValue={configObj.smtp_username || ""}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)] placeholder-[var(--admin-text-muted)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              SMTP Password
            </label>
            <input
              type="password"
              name="smtp_password"
              defaultValue={configObj.smtp_password || ""}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--admin-text-main)] uppercase tracking-wider mb-1">
              Encryption
            </label>
            <select
              name="smtp_encryption"
              defaultValue={configObj.smtp_encryption || "tls"}
              className="w-full px-3.5 py-2 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--admin-text-main)]"
            >
              <option value="tls" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">TLS</option>
              <option value="ssl" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">SSL</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--admin-card-border)] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save E-mail Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

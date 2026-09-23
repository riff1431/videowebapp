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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            E-mail & SMTP Setup
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure outgoing mail server for user notifications, password resets, and digests
          </p>
        </div>
      </div>

      <form action={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mailer Driver
            </label>
            <select
              name="smtp_or_mail"
              defaultValue={configObj.smtp_or_mail || "smtp"}
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
            >
              <option value="smtp">SMTP (Recommended)</option>
              <option value="mail">Server Mail</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              SMTP Port
            </label>
            <input
              type="text"
              name="smtp_port"
              defaultValue={configObj.smtp_port || "587"}
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              name="smtp_host"
              defaultValue={configObj.smtp_host || "smtp.mailgun.org"}
              placeholder="smtp.example.com"
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              SMTP Username
            </label>
            <input
              type="text"
              name="smtp_username"
              defaultValue={configObj.smtp_username || ""}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              SMTP Password
            </label>
            <input
              type="password"
              name="smtp_password"
              defaultValue={configObj.smtp_password || ""}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Encryption
            </label>
            <select
              name="smtp_encryption"
              defaultValue={configObj.smtp_encryption || "tls"}
              className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--primary)] text-gray-900"
            >
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
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

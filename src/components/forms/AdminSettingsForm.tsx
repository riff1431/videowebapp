"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { updateAdminSettingsAction } from "@/modules/admin/admin.actions";

interface AdminSettingsFormProps {
  initialConfig: Record<string, string>;
}

export function AdminSettingsForm({ initialConfig }: AdminSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await updateAdminSettingsAction(formData);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Failed to update settings");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl p-6 shadow-xs space-y-6 text-[var(--admin-text-main)] transition-colors duration-200">
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Settings successfully updated in PostgreSQL database!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Website Info */}
      <div>
        <h3 className="text-sm font-bold text-[var(--admin-text-main)] mb-3 pb-2 border-b border-[var(--admin-card-border)]">
          Website Information & Branding
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Title</label>
            <input
              type="text"
              name="title"
              defaultValue={initialConfig.title || "PlayTube - Video Sharing Platform"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
            <span className="text-[11px] text-[var(--admin-text-muted)]">Appears on browser tabs and search engine results.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Name</label>
            <input
              type="text"
              name="name"
              defaultValue={initialConfig.name || "PlayTube"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
            <span className="text-[11px] text-[var(--admin-text-muted)]">Used in footers, branding bars, and emails.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Site Admin Email</label>
            <input
              type="email"
              name="email"
              defaultValue={initialConfig.email || "admin@playtube.local"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
            <span className="text-[11px] text-[var(--admin-text-muted)]">Receiver for administrative reports and notifications.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Active Theme</label>
            <input
              type="text"
              disabled
              defaultValue={initialConfig.theme || "youplay"}
              className="w-full text-xs bg-[var(--admin-card-hover)] border border-[var(--admin-card-border)] rounded-md px-3.5 py-2.5 text-[var(--admin-text-muted)] cursor-not-allowed"
            />
            <span className="text-[11px] text-[var(--admin-text-muted)]">Default 1:1 PlayTube theme.</span>
          </div>
        </div>
      </div>

      {/* SEO & Search */}
      <div className="pt-2 border-t border-[var(--admin-card-border)]">
        <h3 className="text-sm font-bold text-[var(--admin-text-main)] mb-3 pb-2 border-b border-[var(--admin-card-border)]">
          SEO & Meta Tags
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Meta Keywords</label>
            <input
              type="text"
              name="keyword"
              defaultValue={initialConfig.keyword || "playtube, video sharing, streaming, creators"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Meta Description</label>
            <textarea
              rows={3}
              name="description"
              defaultValue={initialConfig.description || "PlayTube is the premier video sharing and streaming platform."}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md p-3 focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* User & Community Settings */}
      <div className="pt-2 border-t border-[var(--admin-card-border)]">
        <h3 className="text-sm font-bold text-[var(--admin-text-main)] mb-3 pb-2 border-b border-[var(--admin-card-border)]">
          User & Feature Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">User Registration</label>
            <select
              name="user_registration"
              defaultValue={initialConfig.user_registration || "on"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            >
              <option value="on" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Enabled (Allow public sign-up)</option>
              <option value="off" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Disabled (Closed registration)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Account Validation</label>
            <select
              name="validation"
              defaultValue={initialConfig.validation || "off"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            >
              <option value="off" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Disabled (Instant activation)</option>
              <option value="on" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Enabled (Require email validation)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Watch History System</label>
            <select
              name="history_system"
              defaultValue={initialConfig.history_system || "on"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            >
              <option value="on" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Enabled</option>
              <option value="off" className="bg-[var(--admin-card-bg)] text-[var(--admin-text-main)]">Disabled</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--admin-text-main)]">Max Video Upload Size (MB)</label>
            <input
              type="number"
              name="max_upload"
              defaultValue={initialConfig.max_upload || "500"}
              className="w-full text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] text-[var(--admin-text-main)] rounded-md px-3.5 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--admin-card-border)] flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium text-xs px-5 py-2.5 rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>
    </form>
  );
}

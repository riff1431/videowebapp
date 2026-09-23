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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6">
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully updated in PostgreSQL database!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Website Info */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
          Website Information & Branding
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Site Title</label>
            <input
              type="text"
              name="title"
              defaultValue={initialConfig.title || "PlayTube - Video Sharing Platform"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
            <span className="text-[11px] text-gray-400">Appears on browser tabs and search engine results.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Site Name</label>
            <input
              type="text"
              name="name"
              defaultValue={initialConfig.name || "PlayTube"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
            <span className="text-[11px] text-gray-400">Used in footers, branding bars, and emails.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Site Admin Email</label>
            <input
              type="email"
              name="email"
              defaultValue={initialConfig.email || "admin@playtube.local"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
            <span className="text-[11px] text-gray-400">Receiver for administrative reports and notifications.</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Active Theme</label>
            <input
              type="text"
              disabled
              defaultValue={initialConfig.theme || "youplay"}
              className="w-full text-xs bg-gray-100 border border-gray-200 rounded-md px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
            />
            <span className="text-[11px] text-gray-400">Default 1:1 PlayTube theme.</span>
          </div>
        </div>
      </div>

      {/* SEO & Search */}
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
          SEO & Meta Tags
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Meta Keywords</label>
            <input
              type="text"
              name="keyword"
              defaultValue={initialConfig.keyword || "playtube, video sharing, streaming, creators"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2.5 focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Meta Description</label>
            <textarea
              rows={3}
              name="description"
              defaultValue={initialConfig.description || "PlayTube is the premier video sharing and streaming platform."}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md p-3 focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      {/* User & Community Settings */}
      <div className="pt-2 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
          User & Feature Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">User Registration</label>
            <select
              name="user_registration"
              defaultValue={initialConfig.user_registration || "on"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            >
              <option value="on">Enabled (Allow public sign-up)</option>
              <option value="off">Disabled (Closed registration)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Account Validation</label>
            <select
              name="validation"
              defaultValue={initialConfig.validation || "off"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            >
              <option value="off">Disabled (Instant activation)</option>
              <option value="on">Enabled (Require email validation)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Watch History System</label>
            <select
              name="history_system"
              defaultValue={initialConfig.history_system || "on"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            >
              <option value="on">Enabled</option>
              <option value="off">Disabled</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Max Video Upload Size (MB)</label>
            <input
              type="number"
              name="max_upload"
              defaultValue={initialConfig.max_upload || "500"}
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md px-3.5 py-2 focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
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

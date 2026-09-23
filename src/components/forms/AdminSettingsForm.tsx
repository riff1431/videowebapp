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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully updated in PostgreSQL database!</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Site Title</label>
          <input
            type="text"
            name="title"
            defaultValue={initialConfig.title || "PlayTube"}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Site Name</label>
          <input
            type="text"
            name="name"
            defaultValue={initialConfig.name || "PlayTube"}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Site Admin Email</label>
          <input
            type="email"
            name="email"
            defaultValue={initialConfig.email || "admin@playtube.local"}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Default Theme</label>
          <input
            type="text"
            disabled
            defaultValue={initialConfig.theme || "youplay"}
            className="w-full text-sm bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700">Meta Keywords</label>
        <input
          type="text"
          name="keyword"
          defaultValue={initialConfig.keyword || "playtube, video sharing"}
          className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-red-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700">Meta Description</label>
        <textarea
          rows={3}
          name="description"
          defaultValue={initialConfig.description || "PlayTube Video Sharing Platform"}
          className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-hidden focus:border-red-500"
        />
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
        </button>
      </div>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCustomProfileFieldAction } from "@/modules/admin/users.actions";

export function CreateProfileFieldClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [fieldType, setFieldType] = useState("textbox");
  const [placement, setPlacement] = useState("general");
  const [showReg, setShowReg] = useState("no");
  const [showProfile, setShowProfile] = useState("no");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("fieldType", fieldType);
    formData.set("placement", placement);
    formData.set("showOnRegistration", showReg);
    formData.set("showOnProfile", showProfile);

    const res = await createCustomProfileFieldAction(formData);
    if (res.success) {
      router.push("/admin/manage-profile-fields");
    } else {
      alert(res.error || "Failed to create custom field");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumbs matching Screenshot 1 */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Create New Custom Field
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Users</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Create New Custom Field</span>
        </nav>
      </div>

      {/* Main Card matching Screenshot 1 & 2 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-6">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
          Create New Custom Field
        </h6>

        {/* Info Banner */}
        <div className="p-3 bg-[#e0f4fc] dark:bg-[#008DD1]/15 border border-[#bae4f8] dark:border-[#008DD1]/30 rounded text-[#0288d1] dark:text-[#38bdf8] text-xs">
          Use &#123;&#123; LANG lang_variable &#125;&#125; to translate the field data. e.g: &#123;&#123; LANG first_name &#125;&#125;
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field Type */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Field Type
            </label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            >
              <option value="textbox">Textbox</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select list</option>
            </select>
          </div>

          {/* Field Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Field Name
            </label>
            <input
              type="text"
              name="fieldName"
              required
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* Field Length */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Field Length: <span className="text-neutral-500 font-normal">Default value is 32, and max value is 1000</span>
            </label>
            <input
              type="number"
              name="fieldLength"
              defaultValue={32}
              min={1}
              max={1000}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* Field Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Field Description: <span className="text-neutral-500 font-normal">The description will show under the field</span>
            </label>
            <textarea
              name="fieldDescription"
              rows={4}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* Field Placement matching Screenshot 1 */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Field placement
            </label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            >
              <option value="general">General settings</option>
              <option value="profile">Profile settings</option>
              <option value="social">Social links</option>
              <option value="none">Don't show the field in settings page</option>
            </select>
          </div>

          {/* Show On The Registration Page matching Screenshot 2 */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Show On The Registration Page
            </label>
            <select
              value={showReg}
              onChange={(e) => setShowReg(e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {/* Show On User Profile Page matching Screenshot 2 */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Show On User Profile Page
            </label>
            <select
              value={showProfile}
              onChange={(e) => setShowProfile(e.target.value)}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

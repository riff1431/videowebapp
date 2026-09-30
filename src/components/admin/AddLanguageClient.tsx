"use client";

import React, { useState } from "react";
import Link from "next/link";
import { addLanguageAction, addLanguageKeyAction } from "@/modules/admin/languages.actions";

export function AddLanguageClient() {
  const [langSubmitting, setLangSubmitting] = useState(false);
  const [keySubmitting, setKeySubmitting] = useState(false);
  const [langMsg, setLangMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [keyMsg, setKeyMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLanguageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLangSubmitting(true);
    setLangMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await addLanguageAction(formData);
    setLangSubmitting(false);

    if (res.success) {
      setLangMsg({ type: "success", text: "Language added successfully!" });
      form.reset();
    } else {
      setLangMsg({ type: "error", text: res.error || "Failed to add language" });
    }
  };

  const handleKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setKeySubmitting(true);
    setKeyMsg(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await addLanguageKeyAction(formData);
    setKeySubmitting(false);

    if (res.success) {
      setKeyMsg({ type: "success", text: "Key added successfully!" });
      form.reset();
    } else {
      setKeyMsg({ type: "error", text: res.error || "Failed to add key" });
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Add New Language & Key
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Languages</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Add New Language & Key</span>
        </nav>
      </div>

      {/* Two Columns Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Card: Add New Language */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
            Add New Language
          </h6>

          {langMsg && (
            <div
              className={`p-3 mb-4 text-xs rounded border ${
                langMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              {langMsg.text}
            </div>
          )}

          <form onSubmit={handleLanguageSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                Language Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Use only english letters, no spaces allowed. E.g: russian
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                Language ISO
              </label>
              <input
                type="text"
                name="iso"
                required
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Write the language ISO code. E.g for russian: ru
              </span>
            </div>

            <p className="text-xs text-neutral-700 dark:text-[#ced4da] pt-1">
              Note: This may take up to 5 minutes.
            </p>

            <button
              type="submit"
              disabled={langSubmitting}
              className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {langSubmitting ? "Adding..." : "Add Language"}
            </button>
          </form>
        </div>

        {/* Right Card: Add New Key */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
            Add New Key
          </h6>

          {keyMsg && (
            <div
              className={`p-3 mb-4 text-xs rounded border ${
                keyMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
              }`}
            >
              {keyMsg.text}
            </div>
          )}

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                Key Name
              </label>
              <input
                type="text"
                name="keyName"
                required
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Use only english letters, no spaces allowed, example: this_is_a_key
              </span>
            </div>

            <button
              type="submit"
              disabled={keySubmitting}
              className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {keySubmitting ? "Adding..." : "Add Key"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

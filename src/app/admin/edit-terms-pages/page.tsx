"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getTermsPageByTypeAction,
  saveTermsPageAction,
} from "@/modules/admin/pages.actions";

function EditTermsPagesInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "terms_of_use_page";

  const [pageName, setPageName] = useState("Terms of Use");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [languagesList, setLanguagesList] = useState<{ id: number; name: string; iso: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getTermsPageByTypeAction(typeParam);
        setPageName(data.name);
        setTranslations(data.translations || {});
        setLanguagesList(data.availableLanguages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [typeParam]);

  const handleTextChange = (langName: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [langName.toLowerCase()]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setNotice(null);

    const res = await saveTermsPageAction(typeParam, translations);
    setSaving(false);

    if (res.success) {
      setNotice({ type: "success", text: "Pages saved successfully" });
      setTimeout(() => setNotice(null), 3000);
    } else {
      setNotice({ type: "error", text: res.error || "Failed to save terms" });
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-400 text-xs">Loading terms pages...</div>;
  }

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching edit-terms-pagestype=terms_of_use_page/1.png */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Edit Terms Pages
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <Link href="/admin/manage-pages" className="hover:underline">
            Pages
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Edit Terms Pages</span>
        </nav>
      </div>

      {notice && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-md text-xs font-medium border ${
            notice.type === "success"
              ? "bg-[#18362d] border-[#1d4c3f] text-[#34d399]"
              : "bg-[#361818] border-[#4c1d1d] text-[#f87171]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Main Card (col-lg-8 col-md-8) */}
      <div className="max-w-4xl">
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-200 dark:border-[#292d33] pb-3">
            <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
              Edit Term Pages ({pageName})
            </h6>

            {/* Quick Switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              <Link
                href="/admin/edit-terms-pages?type=terms_of_use_page"
                className={`px-2 py-1 rounded text-[11px] ${
                  typeParam === "terms_of_use_page"
                    ? "bg-[#008DD1] text-white font-medium"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Terms
              </Link>
              <Link
                href="/admin/edit-terms-pages?type=privacy_policy_page"
                className={`px-2 py-1 rounded text-[11px] ${
                  typeParam === "privacy_policy_page"
                    ? "bg-[#008DD1] text-white font-medium"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Privacy
              </Link>
              <Link
                href="/admin/edit-terms-pages?type=about_page"
                className={`px-2 py-1 rounded text-[11px] ${
                  typeParam === "about_page"
                    ? "bg-[#008DD1] text-white font-medium"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                About
              </Link>
              <Link
                href="/admin/edit-terms-pages?type=refund_terms_page"
                className={`px-2 py-1 rounded text-[11px] ${
                  typeParam === "refund_terms_page"
                    ? "bg-[#008DD1] text-white font-medium"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Refund
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Renders textarea for each dynamically available language in the site */}
            {languagesList.map((lang) => {
              const langKey = lang.name.toLowerCase();
              const val = translations[langKey] || "";

              return (
                <div key={lang.id} className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {lang.name} (HTML Allowed)
                  </label>
                  <textarea
                    rows={6}
                    value={val}
                    onChange={(e) => handleTextChange(lang.name, e.target.value)}
                    placeholder={`Write ${pageName} content for ${lang.name}...`}
                    className="w-full p-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white font-mono leading-relaxed"
                  />
                </div>
              );
            })}

            {/* Save Button matching screenshot 6.png */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#008DD1] hover:bg-[#007cb8] active:bg-[#006da2] text-white font-medium text-xs rounded transition-colors shadow-xs cursor-pointer disabled:opacity-60"
              >
                {saving ? "Please wait.." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditTermsPages() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading terms editor...</div>}>
      <EditTermsPagesInner />
    </Suspense>
  );
}

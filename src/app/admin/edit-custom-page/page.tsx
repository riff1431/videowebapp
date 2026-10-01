"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCustomPageByNameAction,
  editCustomPageAction,
} from "@/modules/admin/pages.actions";

function EditCustomPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageNameParam = searchParams.get("id") || "";

  const [id, setId] = useState<number | null>(null);
  const [pageName, setPageName] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [pageType, setPageType] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      if (!pageNameParam) {
        setLoading(false);
        return;
      }
      const page = await getCustomPageByNameAction(pageNameParam);
      if (page) {
        setId(page.id);
        setPageName(page.pageName);
        setPageTitle(page.pageTitle);
        setPageContent(page.pageContent);
        setPageType(page.pageType);
      }
      setLoading(false);
    }
    load();
  }, [pageNameParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || saving) return;

    setSaving(true);
    setNotice(null);

    const res = await editCustomPageAction({
      id,
      pageName,
      pageTitle,
      pageContent,
      pageType,
    });

    setSaving(false);

    if (res.success) {
      setNotice({ type: "success", text: "Page updated successfully" });
      setTimeout(() => {
        router.push("/admin/manage-custom-pages");
      }, 1000);
    } else {
      setNotice({ type: "error", text: res.error || "Failed to update page" });
    }
  };

  if (loading) {
    return <div className="p-8 text-neutral-400 text-xs">Loading page details...</div>;
  }

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Edit Custom Page
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Pages</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Edit Custom Page</span>
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

      <div className="max-w-3xl">
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
            Edit Custom Page: {pageTitle || pageName}
          </h6>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                Page Name{" "}
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                  http://localhost:3000/site-pages/PAGE_NAME
                </span>
              </label>
              <input
                type="text"
                required
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                Page Name{" "}
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                  The page title that will show in the footer
                </span>
              </label>
              <input
                type="text"
                required
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                Page Content{" "}
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">
                  The page content (HTML allowed)
                </span>
              </label>
              <textarea
                required
                rows={6}
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                className="w-full p-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                Page Type
              </label>
              <select
                value={pageType}
                onChange={(e) => setPageType(Number(e.target.value))}
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value={1}>Include background and header</option>
                <option value={0}>Empty page</option>
              </select>
            </div>

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

export default function EditCustomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400 text-xs">Loading editor...</div>}>
      <EditCustomPageInner />
    </Suspense>
  );
}

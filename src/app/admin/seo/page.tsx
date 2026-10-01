"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getPagesSeoAction,
  updatePageSeoAction,
  type PageSeoItem,
} from "@/modules/admin/pages.actions";

export default function ManagePagesSeo() {
  const [pagesSeo, setPagesSeo] = useState<PageSeoItem[]>([]);
  const [openPageKey, setOpenPageKey] = useState<string>("404");
  const [formStates, setFormStates] = useState<
    Record<string, { title: string; metaKeywords: string; metaDescription: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ key: string; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getPagesSeoAction();
      setPagesSeo(data);

      const initialForms: Record<string, { title: string; metaKeywords: string; metaDescription: string }> = {};
      data.forEach((p) => {
        initialForms[p.key] = {
          title: p.title,
          metaKeywords: p.metaKeywords,
          metaDescription: p.metaDescription,
        };
      });
      setFormStates(initialForms);
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (key: string, field: "title" | "metaKeywords" | "metaDescription", value: string) => {
    setFormStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent, key: string) => {
    e.preventDefault();
    if (savingKey) return;

    setSavingKey(key);
    setNotice(null);

    const data = formStates[key] || { title: "", metaKeywords: "", metaDescription: "" };
    const res = await updatePageSeoAction({
      pageName: key,
      title: data.title,
      metaKeywords: data.metaKeywords,
      metaDescription: data.metaDescription,
    });

    setSavingKey(null);

    if (res.success) {
      setNotice({ key, text: `${key.toUpperCase()} SEO Settings updated successfully` });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const togglePage = (key: string) => {
    setOpenPageKey(openPageKey === key ? "" : key);
  };

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching design/pages/seo/1.png */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Manage Pages SEO
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Pages</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Manage Pages SEO</span>
        </nav>
      </div>

      {/* Main Accordion Card (col-lg-6 col-md-6) matching design/pages/seo/1.png */}
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-neutral-400 text-xs">Loading SEO pages...</div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {pagesSeo.map((item) => {
                const isOpen = openPageKey === item.key;
                const form = formStates[item.key] || {
                  title: "",
                  metaKeywords: "",
                  metaDescription: "",
                };

                return (
                  <div key={item.key} className="transition-colors">
                    {/* Page Tab Header matching uppercase styling in 1.png */}
                    <div
                      onClick={() => togglePage(item.key)}
                      className="px-6 py-4 cursor-pointer select-none flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#1f2227] transition-colors"
                    >
                      <h4 className="text-[13px] font-bold tracking-wide text-neutral-800 dark:text-neutral-200">
                        {item.name}
                      </h4>
                    </div>

                    {/* Expandable Form Body */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-neutral-100 dark:border-[#292d33]/60 bg-neutral-50/50 dark:bg-[#1e2025]/50">
                        {notice && notice.key === item.key && (
                          <div className="mb-4 px-3 py-2 rounded text-xs bg-[#18362d] border border-[#1d4c3f] text-[#34d399] flex items-center gap-1.5 font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{notice.text}</span>
                          </div>
                        )}

                        <form onSubmit={(e) => handleSave(e, item.key)} className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={form.title}
                              onChange={(e) => handleChange(item.key, "title", e.target.value)}
                              className="w-full h-9 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Keywords
                            </label>
                            <input
                              type="text"
                              value={form.metaKeywords}
                              onChange={(e) => handleChange(item.key, "metaKeywords", e.target.value)}
                              className="w-full h-9 px-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                              Description
                            </label>
                            <textarea
                              rows={3}
                              value={form.metaDescription}
                              onChange={(e) => handleChange(item.key, "metaDescription", e.target.value)}
                              className="w-full p-3 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded focus:outline-none focus:border-[#008DD1] text-neutral-900 dark:text-white font-mono"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={savingKey === item.key}
                            className="px-5 py-2 bg-[#008DD1] hover:bg-[#007cb8] active:bg-[#006da2] text-white font-medium text-xs rounded transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                          >
                            {savingKey === item.key ? "Please wait.." : "Save"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

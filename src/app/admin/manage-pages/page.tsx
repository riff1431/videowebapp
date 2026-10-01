"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getTermsPagesListAction,
  toggleTermsStatusAction,
} from "@/modules/admin/pages.actions";

export default function ManagePages() {
  const [terms, setTerms] = useState<{ type: string; name: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getTermsPagesListAction();
    setTerms(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (type: string, currentEnabled: boolean) => {
    const nextVal = !currentEnabled;
    const res = await toggleTermsStatusAction(type, nextVal);
    if (res.success) {
      setTerms((prev) =>
        prev.map((item) => (item.type === type ? { ...item, enabled: nextVal } : item))
      );
      setNotice("Page status updated.");
      setTimeout(() => setNotice(null), 2500);
    }
  };

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumbs matching design/pages/manage-pages/1.png */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Manage Terms Pages
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
          <span className="text-[#008DD1]">Manage Terms Pages</span>
        </nav>
      </div>

      {notice && (
        <div className="mb-4 px-4 py-2.5 rounded-md text-xs font-medium bg-[#18362d] border border-[#1d4c3f] text-[#34d399] flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{notice}</span>
        </div>
      )}

      {/* Main Card (col-lg-6 col-md-6) */}
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
            Manage Terms Pages
          </h6>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-t border-neutral-200 dark:border-[#292d33]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-[#292d33] text-neutral-800 dark:text-neutral-200">
                  <th className="py-3 px-4 font-semibold text-center w-1/2">PAGE NAME</th>
                  <th className="py-3 px-4 font-semibold text-center w-1/2">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-neutral-400">
                      Loading terms pages...
                    </td>
                  </tr>
                ) : (
                  terms.map((item) => (
                    <tr
                      key={item.type}
                      className="hover:bg-neutral-50 dark:hover:bg-[#1e2025] transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-neutral-800 dark:text-neutral-200 font-medium">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/edit-terms-pages?type=${item.type}`}
                            className="px-3 py-1 bg-[#28a745] hover:bg-[#218838] text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggle(item.type, item.enabled)}
                            className={`px-3 py-1 text-white rounded text-[11px] font-medium transition-colors cursor-pointer ${
                              item.enabled
                                ? "bg-[#17a2b8] hover:bg-[#138496]"
                                : "bg-[#6c757d] hover:bg-[#5a6268]"
                            }`}
                          >
                            {item.enabled ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

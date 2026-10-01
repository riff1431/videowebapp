"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getCustomDesignAction,
  saveCustomDesignAction,
} from "@/modules/admin/design.actions";
import { Home, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function CustomDesignPage() {
  const [headerJs, setHeaderJs] = useState("");
  const [footerJs, setFooterJs] = useState("");
  const [headerCss, setHeaderCss] = useState("");

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getCustomDesignAction();
      if (res.success) {
        setHeaderJs(res.data.headerJs);
        setFooterJs(res.data.footerJs);
        setHeaderCss(res.data.headerCss);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    startTransition(async () => {
      const res = await saveCustomDesignAction({
        headerJs,
        footerJs,
        headerCss,
      });

      if (res.success) {
        setNotice({ type: "success", text: res.message || "Custom design saved successfully!" });
      } else {
        setNotice({ type: "error", text: res.message || "Failed to save design" });
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Custom Design
        </h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          <Link href="/admin" className="hover:text-cyan-500 flex items-center gap-1">
            <Home className="w-4 h-4" />
            Admin Panel
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Design</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-700 dark:text-neutral-200 font-medium">Custom Design</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full">
        <div className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-6 space-y-5">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Custom JS / CSS
          </h2>

          {notice && (
            <div
              className={`p-3.5 rounded text-sm flex items-center gap-2.5 ${
                notice.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Header Custom JavaScript */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Header Custom JavaScript
              </label>
              <textarea
                value={headerJs}
                onChange={(e) => setHeaderJs(e.target.value)}
                disabled={loading}
                rows={5}
                placeholder={`/* \nAdd here your JavaScript Code.\nNote. the code entered here will be added in <head> tag\n*/`}
                className="w-full p-3 font-mono text-xs rounded-md bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#00adef]"
              />
            </div>

            {/* Footer Custom JavaScript */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Footer Custom JavaScript
              </label>
              <textarea
                value={footerJs}
                onChange={(e) => setFooterJs(e.target.value)}
                disabled={loading}
                rows={5}
                placeholder={`/* \nThe code entered here will be added in <footer> tag\n*/`}
                className="w-full p-3 font-mono text-xs rounded-md bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#00adef]"
              />
            </div>

            {/* Header CSS Style */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Header CSS Style
              </label>
              <textarea
                value={headerCss}
                onChange={(e) => setHeaderCss(e.target.value)}
                disabled={loading}
                rows={5}
                placeholder={`/* \nAdd here your custom css styles Example: p { text-align: center; color: red; }\n*/`}
                className="w-full p-3 font-mono text-xs rounded-md bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#00adef]"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending || loading}
                className="px-6 py-2.5 bg-[#00adef] hover:bg-[#0096d6] text-white font-medium text-sm rounded shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

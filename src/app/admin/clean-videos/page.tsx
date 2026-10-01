"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { cleanDeadVideosAction } from "@/modules/admin/tools.actions";
import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

export default function CleanDeadVideosPage() {
  const [timeRange, setTimeRange] = useState<"all" | "today" | "this_week" | "this_month" | "this_year">("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [btnText, setBtnText] = useState("Clean");
  const [isPending, startTransition] = useTransition();

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    setResultMsg(null);
    setShowConfirmModal(true);
  };

  const handleConfirmClean = () => {
    setShowConfirmModal(false);
    startTransition(async () => {
      setBtnText("Your database is being cleaned, check your site after few minutes.");
      const res = await cleanDeadVideosAction(timeRange);

      if (res.success) {
        setResultMsg({
          type: "success",
          text: res.message || "Database clean completed!",
        });
      } else {
        setResultMsg({ type: "error", text: res.message || "Failed to clean database" });
      }

      setTimeout(() => {
        setBtnText("Clean");
      }, 4000);
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clean Dead Videos</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            Admin Panel
          </Link>
          <span>›</span>
          <span>Tools</span>
          <span>›</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Clean Dead Videos</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full">
        <div className="bg-white dark:bg-[#22252a] border border-gray-200 dark:border-[#292d33] rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Clean Dead Videos</h2>

          {/* Explanatory Success/Info Banner */}
          <div className="p-3.5 rounded-lg text-sm bg-[#1e4635] text-emerald-100 border border-emerald-700/60 leading-relaxed">
            This tool will scan your database, run a cronjob process and find deleted youtube, dailymotion and vimeo videos then delete them from your database.
          </div>

          {/* Status Feedback */}
          {resultMsg && (
            <div
              className={`p-3.5 rounded-lg text-sm flex items-center gap-2.5 ${resultMsg.type === "success"
                ? "bg-[#275a43] text-emerald-100 border border-emerald-700/50"
                : "bg-red-900/40 text-red-200 border border-red-700/50"
                }`}
            >
              {resultMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleOpenModal} className="space-y-4">
            {/* Select Video Date (Optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Video Date (Optional)
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1c1e22] border border-gray-300 dark:border-[#292d33] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00adef] cursor-pointer"
              >
                <option value="all">All Videos</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="this_year">This Year</option>
              </select>
            </div>

            {/* Blue Alert Notice */}
            <div className="p-3.5 rounded-lg text-sm bg-[#1e3a5f]/40 dark:bg-[#152a42]/70 border border-blue-500/30 text-blue-300">
              This process might take some time, you can check for your site changes after few minutes.
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-[#e53935] hover:bg-[#d32f2f] text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{btnText}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#22252a] border border-gray-200 dark:border-[#292d33] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clean Dead Videos</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to clean your DB from dead videos? this action can't be undo.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-[#292d33] text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmClean}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                Yes, Clean it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { sendMassNotificationAction } from "@/modules/admin/tools.actions";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function MassNotificationsPage() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [usernames, setUsernames] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!url.trim() || !description.trim()) {
      setMessage({ type: "error", text: "Please enter both URL and Notification Text." });
      return;
    }

    startTransition(async () => {
      const res = await sendMassNotificationAction({
        url: url.trim(),
        description: description.trim(),
        usernames: usernames.trim() || undefined,
      });

      if (res.success) {
        setMessage({ type: "success", text: res.message || "Your notification has been successfully sent" });
        setUrl("");
        setDescription("");
        setUsernames("");
      } else {
        setMessage({ type: "error", text: res.message || "Failed to send notification" });
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Mass Notifications
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Tools</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Mass Notifications</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs p-6 space-y-5">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
          Send Site Notifications To Users
        </h6>

        {/* Alert Banner */}
        {message && (
          <div
            className={`p-3.5 rounded text-xs font-medium flex items-start gap-2.5 transition-all ${
              message.type === "success"
                ? "bg-[#18362d] text-[#34d399] border border-[#1d4c3f]"
                : "bg-[#361818] text-[#f87171] border border-[#4c1d1d]"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#34d399] mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171] mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              URL <span className="text-neutral-400 dark:text-[#8c96a3] text-[11px] font-normal">Link used when user clicks on the notification</span>
            </label>
            <input
              type="text"
              placeholder=""
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#008DD1]"
            />
          </div>

          {/* Notification Text */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notification Text
            </label>
            <textarea
              rows={5}
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#008DD1]"
            />
          </div>

          {/* Specific users */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Just Send To Those Users{" "}
              <span className="text-neutral-400 dark:text-[#8c96a3] text-[11px] font-normal">
                (If empty, notification will be sent to all users)
              </span>
            </label>
            <input
              type="text"
              placeholder=""
              value={usernames}
              onChange={(e) => setUsernames(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1c1e22] border border-neutral-300 dark:border-[#292d33] rounded text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#008DD1]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-[#00adef] hover:bg-[#009bd6] text-white font-medium text-xs rounded transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isPending ? "Please wait.." : "Send Notifications"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

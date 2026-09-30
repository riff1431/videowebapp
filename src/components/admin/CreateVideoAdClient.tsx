"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createVideoAdAction } from "@/modules/admin/video-ads.actions";

interface CreateVideoAdClientProps {
  type: "video" | "image" | "vast";
}

export function CreateVideoAdClient({ type }: CreateVideoAdClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [vastType, setVastType] = useState<"Vast" | "VPaid">("Vast");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("type", type === "vast" ? vastType.toLowerCase() : type);

    const res = await createVideoAdAction(formData);
    if (res.success) {
      router.push("/admin/manage-video-ads");
    } else {
      alert(res.error || "Failed to create ad");
      setSubmitting(false);
    }
  };

  const titleMap = {
    video: "Create New Video Ad",
    image: "Create New Image Ad",
    vast: "Create New Vast Ad",
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Create New Ad
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Advertisement</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <Link href="/admin/manage-video-ads" className="text-[#008DD1] hover:underline">
            Manage Video Ads
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Create New Ad</span>
        </nav>
      </div>

      {/* Main Card */}
      <div className="w-full bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-6">
          {titleMap[type]}
        </h6>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* 2. Media Link based on Type */}
          {type === "video" && (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                Hosted video file, e.g (http://site.com/video.mp4)
              </label>
              <input
                type="text"
                name="adMedia"
                required
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>
          )}

          {type === "image" && (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                Image link, e.g (http://site.com/image.png)
              </label>
              <input
                type="text"
                name="adMedia"
                required
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>
          )}

          {type === "vast" && (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                XML link, e.g (http://yourdomain.com/vast.xml)
              </label>
              <input
                type="text"
                name="adMedia"
                required
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>
          )}

          {/* 3. URL redirect link (only for video and image ads) */}
          {type !== "vast" && (
            <div className="space-y-1.5">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                URL redirect the user to this link after clicking on the ad
              </label>
              <input
                type="text"
                name="adUrl"
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>
          )}

          {/* 4. Skip Ad Seconds */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
              Skip Ad Seconds (0 = disabled)
            </label>
            <input
              type="number"
              name="duration"
              defaultValue={0}
              min={0}
              className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
          </div>

          {/* 5. Type Radios (for Vast/Vpaid) */}
          {type === "vast" && (
            <div className="space-y-2 pt-1">
              <label className="text-xs text-neutral-800 dark:text-[#ced4da] font-medium block">
                Type
              </label>
              <div className="flex items-center gap-4 text-xs text-neutral-800 dark:text-neutral-200">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vast_choice"
                    value="Vast"
                    checked={vastType === "Vast"}
                    onChange={() => setVastType("Vast")}
                    className="text-[#04abf2] focus:ring-0"
                  />
                  <span>Vast</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="vast_choice"
                    value="VPaid"
                    checked={vastType === "VPaid"}
                    onChange={() => setVastType("VPaid")}
                    className="text-[#04abf2] focus:ring-0"
                  />
                  <span>VPaid</span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getSystemStatusAction,
  SystemStatusIssue,
} from "@/modules/admin/system-status.actions";

export default function SystemStatusPage() {
  const [issues, setIssues] = useState<SystemStatusIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await getSystemStatusAction();
        setIssues(res);
      } catch (err) {
        console.error("Failed to load system status:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Title & Breadcrumb Header matching 3rd screenshot */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          System Requirements &amp; Status
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1]">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">System Requirements &amp; Status</span>
        </nav>
      </div>

      {/* Main Card (Matches screenshot 3) */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs max-w-full lg:max-w-4xl">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
          System Requirements &amp; Status
        </h6>

        {/* PlayTube System Status Purple Database/Search SVG Icon */}
        <div className="mb-4">
          <svg
            className="rounded-full"
            height="80"
            viewBox="0 0 32 32"
            width="80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m26 32h-20c-3.314 0-6-2.686-6-6v-20c0-3.314 2.686-6 6-6h20c3.314 0 6 2.686 6 6v20c0 3.314-2.686 6-6 6z"
              fill="#f5e6fe"
            />
            <path
              d="m23.805 22.862-1.693-1.693c.349-.527.555-1.157.555-1.835 0-1.838-1.496-3.333-3.333-3.333s-3.334 1.494-3.334 3.332 1.496 3.333 3.333 3.333c.678 0 1.308-.206 1.835-.555l1.693 1.693c.26.26.682.26.943 0 .262-.26.262-.682.001-.942zm-4.472-1.529c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2c.001 1.103-.897 2-2 2z"
              fill="#d9a4fc"
            />
            <g fill="#be63f9">
              <path d="m15.793 16.3c-.673.78-1.093 1.787-1.12 2.893-.933.133-1.807.14-2.007.14-.48 0-4.667-.047-4.667-1.667v-2.666c0 1.62 4.187 1.667 4.667 1.667.287 0 1.881-.014 3.127-.367z" />
              <path d="m17.333 13.667c0 1.62-4.189 1.667-4.667 1.667s-4.666-.048-4.666-1.667v-2.667c0 1.62 4.189 1.667 4.667 1.667s4.666-.047 4.666-1.667z" />
              <path d="m12.667 11.333c-.478 0-4.667-.047-4.667-1.666s4.189-1.667 4.667-1.667 4.667.047 4.667 1.667-4.19 1.666-4.667 1.666z" />
            </g>
          </svg>
        </div>

        <p className="text-[14px] text-neutral-600 dark:text-[#a0aec0] mb-5">
          Here you can check your system status, the system will show you if there are some problems on your website.
        </p>

        {/* Divider matching screenshot 3 */}
        <hr className="border-t border-neutral-200 dark:border-[#2d3139] my-5" />

        {/* List of server issues matching screenshot 3 exactly */}
        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading system status...</div>
        ) : issues.length > 0 ? (
          <div className="space-y-4">
            {issues.map((item, idx) => {
              const isError = item.type === "error";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-4 pb-4 ${
                    idx !== issues.length - 1
                      ? "border-b border-neutral-200 dark:border-[#2d3139]"
                      : ""
                  }`}
                >
                  {/* Warning / Error Triangle Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isError ? (
                      <svg
                        height="36"
                        viewBox="0 0 128 128"
                        width="36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <path
                            d="m57.362 26.54-37.262 64.535a7.666 7.666 0 0 0 6.639 11.5h74.518a7.666 7.666 0 0 0 6.639-11.5l-37.258-64.535a7.665 7.665 0 0 0 -13.276 0z"
                            fill="#ee404c"
                          />
                          <g fill="#fff7ed">
                            <rect height="29.377" rx="4.333" width="9.638" x="59.181" y="46.444" />
                            <circle cx="64" cy="87.428" r="4.819" />
                          </g>
                        </g>
                      </svg>
                    ) : (
                      <svg
                        height="36"
                        viewBox="0 0 128 128"
                        width="36"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g>
                          <path
                            d="m57.362 26.54-37.262 64.535a7.666 7.666 0 0 0 6.639 11.5h74.518a7.666 7.666 0 0 0 6.639-11.5l-37.258-64.535a7.665 7.665 0 0 0 -13.276 0z"
                            fill="#ffb400"
                          />
                          <g fill="#fcf4d9">
                            <rect height="29.377" rx="4.333" width="9.638" x="59.181" y="46.444" />
                            <circle cx="64" cy="87.428" r="4.819" />
                          </g>
                        </g>
                      </svg>
                    )}
                  </div>

                  {/* Issue Information */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-[16px] font-bold mb-1 leading-snug ${
                        isError ? "text-[#ef4c5d]" : "text-[#faa500]"
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed text-neutral-700 dark:text-[#c4cad4]">
                      {item.message}
                    </p>
                    {item.linkText && item.linkHref && (
                      <div className="mt-1">
                        <Link
                          href={item.linkHref}
                          className="text-[13px] text-[#008DD1] hover:underline"
                        >
                          {item.linkText}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-[#4caf50]">
            <svg
              className="mx-auto mb-4 w-20 h-20"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipRule="evenodd" fillRule="evenodd">
                <path
                  d="m256 0c-141.2 0-256 114.8-256 256s114.8 256 256 256 256-114.8 256-256-114.8-256-256-256z"
                  fill="#4bae4f"
                />
                <path
                  d="m379.8 169.7c6.2 6.2 6.2 16.4 0 22.6l-150 150c-3.1 3.1-7.2 4.7-11.3 4.7s-8.2-1.6-11.3-4.7l-75-75c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l63.7 63.7 138.7-138.7c6.2-6.3 16.4-6.3 22.6 0z"
                  fill="#fff"
                />
              </g>
            </svg>
            <p className="text-lg font-medium">All good, no issues found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

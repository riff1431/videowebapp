"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getSitemapInfoAction,
  generateSitemapAction,
} from "@/modules/admin/sitemap.actions";

export default function CreateSitemapPage() {
  const [sitemapUrl, setSitemapUrl] = useState<string>("http://localhost:3000/sitemap-main.xml");
  const [lastCreated, setLastCreated] = useState<string>("12-06-2018");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [btnText, setBtnText] = useState("Generate New Sitemap");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadInfo() {
      try {
        const info = await getSitemapInfoAction();
        if (info.sitemapUrl) setSitemapUrl(info.sitemapUrl);
        if (info.lastCreated) setLastCreated(info.lastCreated);
      } catch (err) {
        console.error("Failed to load sitemap info:", err);
      }
    }
    loadInfo();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generating) return;

    setGenerating(true);
    setShowProgress(true);
    setIsDone(false);
    setProgress(0);
    setBtnText("Please wait..");
    setNotice(null);

    // Smooth incremental animation while generating
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return 85;
        return prev + 15;
      });
    }, 180);

    try {
      const res = await generateSitemapAction();
      clearInterval(interval);

      if (res.success) {
        setProgress(100);
        setIsDone(true);
        setLastCreated(res.lastCreated);
        setBtnText("Generate New Sitemap");
        setNotice({
          type: "success",
          text: `Sitemap successfully generated! Added ${res.totalVideos} videos, ${res.totalArticles} articles, and core site links.`,
        });
      } else {
        setBtnText("Generate New Sitemap");
        setNotice({
          type: "error",
          text: `Failed to generate sitemap: ${res.error || "Unknown error"}`,
        });
      }
    } catch (err: any) {
      clearInterval(interval);
      setBtnText("Generate New Sitemap");
      setNotice({
        type: "error",
        text: `Error generating sitemap: ${err.message}`,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full font-sans antialiased text-[#212529] dark:text-[#8c96a3]">
      {/* Page Title & Breadcrumbs matching Image 2 */}
      <div className="mb-6">
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight mb-1">
          Create Sitemap
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
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Sitemap</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Create Sitemap</span>
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
      <div className="max-w-3xl">
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white mb-4">
            Generate New Sitemap
          </h6>

          {/* PlayTube Circular Cyan Vector SVG Icon */}
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
                fill="#e3f8fa"
              />
              <g fill="#26c6da">
                <path d="m22 8.667h-12c-1.103 0-2 .897-2 2v10.667c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-10.667c0-1.103-.897-2-2-2zm0 13.333h-12c-.368 0-.667-.299-.667-.667v-9.333h13.333v9.333c.001.368-.298.667-.666.667z" />
                <path d="m15.833 20c-.128 0-.256-.049-.354-.146-.195-.195-.195-.512 0-.707l2.333-2.333c.195-.195.512-.195.707 0s.195.512 0 .707l-2.333 2.333c-.097.097-.224.146-.353.146z" />
                <path d="m21.187 14.146c-.104-.104-.249-.157-.395-.145-1.485.122-2.514.569-3.438 1.493-.9.898-1.2 1.891-.916 3.035.044.18.185.32.365.365.097.024.193.039.288.055l1.93-1.93-1.101 1.946c.691-.076 1.328-.393 1.919-.986.925-.925 1.372-1.953 1.493-3.439.012-.145-.041-.29-.145-.394z" />
              </g>
              <path
                d="m15.833 20.667c-.312 0-.605-.121-.825-.342-.221-.22-.342-.513-.342-.825s.121-.605.342-.825l.678-.678c-.073-.999.254-1.917.981-2.738v-.759c0-.643-.523-1.167-1.167-1.167h-3.667c-.643 0-1.167.523-1.167 1.167v5.667c0 .643.523 1.167 1.167 1.167h3.667c.587 0 1.069-.437 1.15-1.002-.219.216-.508.335-.817.335z"
                fill="#8ce1eb"
              />
            </svg>
          </div>

          {/* The sitemap link row matching Image 2 */}
          <p className="flex items-center gap-1.5 text-[13px] text-neutral-800 dark:text-[#c4cad4] mb-3">
            <b className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z"
                />
              </svg>
              The sitemap link is:
            </b>{" "}
            <a
              href="/sitemap-main.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008DD1] hover:underline"
            >
              {sitemapUrl}
            </a>
          </p>

          {/* Form with Last Created Sitemap and button matching Image 2 */}
          <form onSubmit={handleGenerate} className="submit-sitemap-settings space-y-4">
            <p className="flex items-center gap-1.5 text-[13px] text-neutral-800 dark:text-[#c4cad4]">
              <b className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                >
                  <path
                    fill="currentColor"
                    d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
                  />
                </svg>
                Last created sitemap:
              </b>{" "}
              <span className="last-created font-normal">{lastCreated}</span>
            </p>

            {/* Progress bar matching PlayTube bg-cyan / bg-light-green */}
            {showProgress && (
              <div className="w-full bg-neutral-200 dark:bg-[#1a1c20] rounded-sm overflow-hidden h-4 shadow-inner">
                <div
                  className={`h-full text-[11px] leading-4 text-center text-white font-semibold transition-all duration-300 ${
                    isDone ? "bg-[#8bc34a]" : "bg-[#00bcd4] animate-pulse"
                  }`}
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={generating}
                className="px-5 py-2.5 bg-[#008DD1] hover:bg-[#007cb8] active:bg-[#006da2] text-white font-medium text-[13px] rounded shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {btnText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

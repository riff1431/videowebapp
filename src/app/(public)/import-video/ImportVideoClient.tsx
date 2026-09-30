"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Video, CheckCircle2, AlertCircle, ArrowRight, DownloadCloud, Sparkles } from "lucide-react";
import { importVideoAction } from "@/modules/videos/video.actions";

export default function ImportVideoPage() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("entertainment");
  const [thumbnail, setThumbnail] = useState("");
  const [importing, setImporting] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleUrlBlur = () => {
    if (!url.trim()) return;

    // Auto-detect YouTube thumbnail & suggest title
    if (url.includes("youtube.com/watch?v=")) {
      const vid = url.split("v=")[1]?.split("&")[0];
      if (vid && !thumbnail) {
        setThumbnail(`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`);
      }
      if (!title) {
        setTitle(`Imported YouTube Video (${vid})`);
      }
    } else if (url.includes("youtu.be/")) {
      const vid = url.split("youtu.be/")[1]?.split("?")[0];
      if (vid && !thumbnail) {
        setThumbnail(`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`);
      }
      if (!title) {
        setTitle(`Imported YouTube Video (${vid})`);
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      setError("Please provide a valid video URL and title");
      return;
    }

    setImporting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("url", url);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("categoryId", category);
      formData.set("thumbnail", thumbnail);

      const res = await importVideoAction(formData);
      if (res.success && res.videoId) {
        setCreatedVideoId(res.videoId);
      } else {
        setError(res.error || "Failed to import video");
      }
    } catch (err: any) {
      setError(err.message || "Import failed. Please check the URL.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-[var(--primary)]" />
          <span>Import Video from Web</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Paste any YouTube, Vimeo, Dailymotion, Facebook, or external video URL to publish directly to PlayTube
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[var(--border)] p-6 shadow-xs">
        {createdVideoId ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Video Successfully Imported & Published!
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Your external video stream is now embedded and ready for streaming on PlayTube.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href={`/watch/${createdVideoId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
              >
                <span>Watch Video</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setUrl("");
                  setTitle("");
                  setDescription("");
                  setThumbnail("");
                  setCreatedVideoId(null);
                }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Import Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImport} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* URL Input */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Video URL (YouTube or Vimeo) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full h-11 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] font-mono text-neutral-900 dark:text-white"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Tip: Paste URL and tab away to automatically detect thumbnail and title.
              </p>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title for the video"
                  className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Video Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video..."
                  className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                  >
                    <option value="entertainment">Entertainment</option>
                    <option value="music">Music</option>
                    <option value="gaming">Gaming</option>
                    <option value="tech">Science & Technology</option>
                    <option value="education">Education</option>
                    <option value="news">News & Politics</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={importing || !url || !title}
              className="w-full h-10 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {importing ? "Importing Video to PlayTube..." : "Import Video"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

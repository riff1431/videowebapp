"use client";

import React, { useState } from "react";
import { Upload, Film, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { uploadVideoAction } from "@/modules/videos/video.actions";
import Link from "next/link";

export default function UploadVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tech");
  const [privacy, setPrivacy] = useState(0);
  const [videoUrl, setVideoUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1280&auto=format&fit=crop&q=80");
  const [uploading, setUploading] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a video title");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("categoryId", category);
      formData.set("privacy", String(privacy));
      formData.set("videoLocation", videoUrl);
      formData.set("thumbnail", thumbnailUrl);

      const res = await uploadVideoAction(formData);
      if (res.success && res.videoId) {
        setCreatedVideoId(res.videoId);
      } else {
        setError(res.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-red-600" />
          <span>Upload New Video</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Share your video with millions of users across the platform
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[var(--border)] p-6 shadow-xs">
        {createdVideoId ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Video Uploaded & Published Successfully!
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Your video has been recorded into PostgreSQL and is now available to view and share across PlayTube.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href={`/watch/${createdVideoId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                <span>Watch Video</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setFile(null);
                  setTitle("");
                  setDescription("");
                  setCreatedVideoId(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-xs font-semibold rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:border-red-600 transition-colors bg-neutral-50 dark:bg-neutral-800/40">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                id="video-input"
                className="hidden"
              />
              <label htmlFor="video-input" className="cursor-pointer block">
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-3 text-neutral-600 dark:text-neutral-300">
                  <Film className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      Drag and drop video files to upload
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      MP4, WebM, or online direct video URLs supported
                    </p>
                    <span className="inline-block mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                      Select Files
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Details */}
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
                  placeholder="Enter video title"
                  className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-red-600 text-neutral-900 dark:text-white"
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
                  className="w-full p-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-red-600 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Direct Video Source URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-red-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-red-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-red-600 text-neutral-900 dark:text-white"
                  >
                    <option value="film">Film & Animation</option>
                    <option value="music">Music</option>
                    <option value="gaming">Gaming</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="news">News & Politics</option>
                    <option value="education">Education</option>
                    <option value="tech">Science & Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Privacy
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-red-600 text-neutral-900 dark:text-white"
                  >
                    <option value={0}>Public</option>
                    <option value={1}>Private</option>
                    <option value={2}>Unlisted</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !title}
              className="w-full h-10 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? "Publishing Video to PlayTube..." : "Publish Video"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

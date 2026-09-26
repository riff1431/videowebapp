"use client";

import React, { useState } from "react";
import { Upload, Film, CheckCircle2, AlertCircle, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadVideoAction } from "@/modules/videos/video.actions";
import { uploadToSupabaseStorage } from "@/lib/storage/supabase";
import Link from "next/link";

export default function UploadVideoPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tech");
  const [privacy, setPrivacy] = useState(0);
  const [isShort, setIsShort] = useState(false);
  const [directVideoUrl, setDirectVideoUrl] = useState("");
  const [directThumbnailUrl, setDirectThumbnailUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setVideoFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a video title");
      return;
    }

    if (!videoFile && !directVideoUrl) {
      setError("Please select a video file to upload to Supabase Storage or enter a video URL");
      return;
    }

    setUploading(true);
    setError("");

    try {
      let finalVideoUrl = directVideoUrl;
      let finalThumbnailUrl = directThumbnailUrl;

      // 1. Upload video file to Supabase Storage if selected
      if (videoFile) {
        setUploadStatus("Uploading video to Supabase Storage bucket (playtube-videos)...");
        const fileExt = videoFile.name.split(".").pop() || "mp4";
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `videos/${fileName}`;

        const uploadRes = await uploadToSupabaseStorage("playtube-videos", filePath, videoFile);
        if (uploadRes.error || !uploadRes.url) {
          throw new Error(`Video upload to Supabase Storage failed: ${uploadRes.error}`);
        }
        finalVideoUrl = uploadRes.url;
      }

      // 2. Upload thumbnail file to Supabase Storage if selected
      if (thumbnailFile) {
        setUploadStatus("Uploading thumbnail to Supabase Storage bucket (playtube-uploads)...");
        const fileExt = thumbnailFile.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}_thumb_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        const uploadRes = await uploadToSupabaseStorage("playtube-uploads", filePath, thumbnailFile);
        if (uploadRes.error || !uploadRes.url) {
          throw new Error(`Thumbnail upload to Supabase Storage failed: ${uploadRes.error}`);
        }
        finalThumbnailUrl = uploadRes.url;
      }

      // Default fallback if no thumbnail
      if (!finalThumbnailUrl) {
        finalThumbnailUrl = "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1280&auto=format&fit=crop&q=80";
      }

      // 3. Save metadata into Supabase Database via Server Action
      setUploadStatus("Recording video record in Supabase Database...");
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("categoryId", category);
      formData.set("privacy", String(privacy));
      formData.set("isShort", String(isShort));
      formData.set("videoLocation", finalVideoUrl);
      formData.set("thumbnail", finalThumbnailUrl);

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
      setUploadStatus("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-[var(--primary)]" />
          <span>Upload Video to Supabase</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Files are stored directly in Supabase Storage with metadata saved in Supabase PostgreSQL
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-[var(--border)] p-6 shadow-xs">
        {createdVideoId ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Video Uploaded & Published to Supabase!
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Your video file has been stored in Supabase Storage and registered in the Supabase PostgreSQL database.
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
                  setVideoFile(null);
                  setThumbnailFile(null);
                  setTitle("");
                  setDescription("");
                  setDirectVideoUrl("");
                  setDirectThumbnailUrl("");
                  setCreatedVideoId(null);
                }}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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

            {/* Video File Drop Zone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Select Video File (Supabase Storage: <code className="text-[var(--primary)] font-mono">playtube-videos</code>)
              </label>
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center hover:border-[var(--primary)] transition-colors bg-neutral-50 dark:bg-neutral-800/40">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  id="video-input"
                  className="hidden"
                />
                <label htmlFor="video-input" className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-3 text-neutral-600 dark:text-neutral-300">
                    <Film className="w-6 h-6" />
                  </div>
                  {videoFile ? (
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to upload to Supabase Storage
                      </p>
                      <span className="inline-block mt-2 px-3 py-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded">
                        Change File
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                        Drag and drop video files to upload to Supabase
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        MP4, WebM, MOV supported (or enter a direct URL below)
                      </p>
                      <span className="inline-block mt-3 px-4 py-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md transition-colors shadow-xs">
                        Select Video File
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Thumbnail File Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Custom Thumbnail (Supabase Storage: <code className="text-[var(--primary)] font-mono">playtube-uploads</code>)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    id="thumb-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="thumb-input"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-xs font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-neutral-500" />
                    <span>{thumbnailFile ? thumbnailFile.name : "Select Thumbnail"}</span>
                  </label>
                  {thumbnailFile && (
                    <span className="text-xs text-neutral-500">
                      {(thumbnailFile.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Or External Video URL (Optional fallback)
                </label>
                <input
                  type="url"
                  value={directVideoUrl}
                  onChange={(e) => setDirectVideoUrl(e.target.value)}
                  placeholder="https://... (if not uploading a file)"
                  className="w-full h-10 px-3 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] font-mono text-neutral-900 dark:text-white"
                />
              </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
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
                    className="w-full h-10 px-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-hidden focus:border-[var(--primary)] text-neutral-900 dark:text-white"
                  >
                    <option value={0}>Public</option>
                    <option value={1}>Private</option>
                    <option value={2}>Unlisted</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--border)] cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <input
                      type="checkbox"
                      checked={isShort}
                      onChange={(e) => setIsShort(e.target.checked)}
                      className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      PlayTube Short (Vertical 9:16)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {uploadStatus && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-blue-700 dark:text-blue-300 text-xs">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !title || (!videoFile && !directVideoUrl)}
              className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading to Supabase...</span>
                </>
              ) : (
                <span>Publish Video to Supabase</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

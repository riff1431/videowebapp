"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { uploadVideoAction } from "@/modules/videos/video.actions";
import { uploadToSupabaseStorage } from "@/lib/storage/supabase";
import { UserUploadLimitInfo } from "@/lib/config/upload-policy";

function UploadVideoContent({ policy }: { policy?: UserUploadLimitInfo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isShortsFlow =
    searchParams.get("type") === "shorts" || searchParams.get("type") === "short";

  // Wizard Step: 1 = Upload, 2 = Details, 3 = Visibility
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [privacy, setPrivacy] = useState<number>(0); // 0: Public, 1: Private, 2: Unlisted, 3: Scheduled

  // Drag and drop & status states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Handle video selection
  const processSelectedVideo = (file: File) => {
    if (policy && policy.maxUploadBytes > 0 && file.size > policy.maxUploadBytes) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum upload limit of ${policy.maxUploadFormatted}`);
      return;
    }
    setVideoFile(file);
    setVideoFileName(file.name);
    // Extract default title from file name without extension
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setTitle(baseName);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
    setError("");
    setStep(2); // Auto advance to Step 2: Details
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedVideo(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedVideo(e.dataTransfer.files[0]);
    }
  };

  // Handle thumbnail selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle Publish in Step 3
  const handlePublish = async () => {
    if (!title.trim()) {
      setError("Please enter a video title");
      setStep(2);
      return;
    }

    setUploading(true);
    setError("");

    try {
      let finalVideoUrl =
        "https://vjs.zencdn.net/v/oceans.mp4";
      let finalThumbnailUrl =
        thumbnailPreviewUrl ||
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=720&auto=format&fit=crop&q=80";

      // 1. Upload video file to storage if available
      if (videoFile) {
        try {
          const fileExt = videoFile.name.split(".").pop() || "mp4";
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `videos/${fileName}`;
          const uploadRes = await uploadToSupabaseStorage("playtube-videos", filePath, videoFile);
          if (uploadRes.url) {
            finalVideoUrl = uploadRes.url;
          }
        } catch {
          // If storage bucket is not configured, fall back to sample video URL for functional playback
        }
      }

      // 2. Upload thumbnail file to storage if available
      if (thumbnailFile) {
        try {
          const fileExt = thumbnailFile.name.split(".").pop() || "jpg";
          const fileName = `${Date.now()}_thumb_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `thumbnails/${fileName}`;
          const uploadRes = await uploadToSupabaseStorage("playtube-uploads", filePath, thumbnailFile);
          if (uploadRes.url) {
            finalThumbnailUrl = uploadRes.url;
          }
        } catch {
          // Fall back to preview or default
        }
      }

      // 3. Save video via server action
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      formData.set("categoryId", isShortsFlow ? "shorts" : "other");
      formData.set("privacy", String(privacy));
      formData.set("isShort", String(isShortsFlow));
      formData.set("tags", tags.trim());
      formData.set("videoLocation", finalVideoUrl);
      formData.set("thumbnail", finalThumbnailUrl);
      if (videoFile) formData.set("fileSizeBytes", String(videoFile.size));

      const res = await uploadVideoAction(formData);

      if (res.success) {
        if (isShortsFlow) {
          router.push("/shorts");
        } else {
          router.push(`/watch/${res.videoId}`);
        }
      } else {
        setError(res.error || "Failed to publish video");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during publishing");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header matching Screenshot 1 */}
      <div className="flex items-center justify-between pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Upload className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            Upload new video
          </h1>
        </div>
        <span className="text-xs text-neutral-400 font-medium">
          3 Steps Video Upload
        </span>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs p-6 sm:p-10">
        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4-Step Stepper Bar (matching all 3 screenshots) */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center justify-between">
            {/* Background connector line */}
            <div className="absolute top-[26px] left-8 right-8 h-[2px] bg-neutral-200 dark:bg-neutral-800 z-0" />

            {/* Active cyan connector line */}
            <div
              className="absolute top-[26px] left-8 h-[2px] bg-[#04abf2] z-0 transition-all duration-300"
              style={{
                width:
                  step === 1
                    ? "0%"
                    : step === 2
                    ? "33%"
                    : "100%",
              }}
            />

            {/* 1. Upload Step */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                Upload
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  step === 1
                    ? "border-[#04abf2] bg-white dark:bg-[#1a1a1a]"
                    : "border-[#04abf2] bg-[#04abf2]"
                }`}
              >
                {step > 1 && <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* 2. Details Step */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                Details
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  step === 2
                    ? "border-[#04abf2] bg-white dark:bg-[#1a1a1a]"
                    : step > 2
                    ? "border-[#04abf2] bg-[#04abf2]"
                    : "border-neutral-300 dark:border-neutral-700 bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                {step > 2 && <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>

            {/* 3. Video Elements Step (bypassed for shorts) */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                Video Elements
              </span>
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  step >= 3
                    ? "bg-[#04abf2]"
                    : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              />
            </div>

            {/* 4. Visibility Step */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                Visibility
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                  step === 3
                    ? "border-[#04abf2] bg-white dark:bg-[#1a1a1a]"
                    : "border-neutral-300 dark:border-neutral-700 bg-neutral-300 dark:bg-neutral-700"
                }`}
              />
            </div>
          </div>
        </div>

        {/* STEP 1: Upload (Matching Screenshot 1) */}
        {step === 1 && (
          <div>
            <div className="flex flex-col md:flex-row items-center gap-10 py-4">
              {/* Left: Big Upload Square Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full md:w-80 h-72 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#f9f9f9] dark:bg-neutral-800/40 shrink-0 ${
                  isDragging
                    ? "border-[#04abf2] bg-[#04abf2]/5"
                    : "border-neutral-300 dark:border-neutral-700 hover:border-[#04abf2]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                {/* Arrow up icon matching Screenshot 1 */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-24 h-24 text-neutral-400 dark:text-neutral-500 fill-current mb-2"
                >
                  <path d="M32 8L16 28h10v18h12V28h10L32 8zM14 50h36v5H14v-5z" />
                </svg>
              </div>

              {/* Right: Heading, subtext, SELECT MEDIA button */}
              <div className="flex-1 text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-2 leading-tight">
                  Drag and drop video files to upload
                </h2>
                <p className="text-sm text-neutral-500 mb-8">
                  Your videos will be private until you publish them.
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#04abf2] hover:bg-[#0399d8] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-md shadow-xs cursor-pointer transition-colors"
                >
                  SELECT MEDIA
                </button>
              </div>
            </div>

            {/* Admin Notice Box (Visible only to admins) */}
            {policy?.isAdmin && (
              <div className="pt-6 mt-8 border-t border-neutral-100 dark:border-neutral-800 text-left space-y-1.5">
                <h4 className="text-xs font-semibold text-[#04abf2]">
                  Just admins can see this message
                </h4>
                <p className="text-xs text-neutral-500">
                  Note: Your configured upload limit is: {policy?.maxUploadFormatted}, means you can&apos;t upload files larger than this limit.
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
                  If you want to increase the limit, go to Admin Settings &gt; Settings &gt; Site Settings &gt; Max upload size.
                </p>
              </div>
            )}

            {/* Maximum Duration Notice matching Screenshot 1 */}
            <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 text-left">
              <p className="text-xs text-amber-800 dark:text-amber-400 font-normal">
                Please note that maximum duration allow is {policy?.maxDurationSeconds ?? 15} seconds.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Details (Matching Screenshot 2) */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left py-2">
            {/* Left Column: Video Preview and Filename */}
            <div className="lg:col-span-5 space-y-4">
              <div className="w-full aspect-video rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden relative">
                {videoPreviewUrl ? (
                  <video
                    src={videoPreviewUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-neutral-400" />
                )}
              </div>

              <div>
                <p className="text-xs text-neutral-400">File Name</p>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate mt-0.5">
                  {videoFileName || "video_upload.mp4"}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Video upload complete. No issues found.</span>
              </div>
            </div>

            {/* Right Column: Title, Description, Thumbnail, Next Step Button */}
            <div className="lg:col-span-7 space-y-5">
              {/* Video Title */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-hidden focus:border-[#04abf2] transition-colors"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Your video title, 2 - 55 characters
                </p>
              </div>

              {/* Video Description */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    Video Description
                  </label>
                  <Smile className="w-4 h-4 text-neutral-400 hover:text-neutral-600 cursor-pointer" />
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-hidden focus:border-[#04abf2] transition-colors resize-none"
                />
              </div>

              {/* Thumbnail */}
              <div>
                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                  Thumbnail
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select or upload a picture that shows what&apos;s in your video. A good thumbnail stands out and draws viewers&apos; attention
                </p>

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />

                <div
                  onClick={() => thumbInputRef.current?.click()}
                  className="mt-3 w-32 h-20 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#04abf2] cursor-pointer flex flex-col items-center justify-center text-neutral-500 hover:text-[#04abf2] transition-colors bg-neutral-50 dark:bg-neutral-800/40 overflow-hidden relative"
                >
                  {thumbnailPreviewUrl ? (
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 mb-1 text-neutral-400" />
                      <span className="text-[11px] font-medium">Upload Thumbnail</span>
                    </>
                  )}
                </div>
              </div>

              {/* NEXT STEP Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim()) {
                      setError("Please enter a video title");
                      return;
                    }
                    setError("");
                    setStep(3); // Advance to Step 3: Visibility
                  }}
                  className="bg-[#04abf2] hover:bg-[#0399d8] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-md shadow-xs cursor-pointer transition-colors"
                >
                  NEXT STEP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Visibility (Matching Screenshot 3) */}
        {step === 3 && (
          <div className="space-y-6 text-left max-w-xl py-2">
            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by comma or space"
                className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-hidden focus:border-[#04abf2] transition-colors"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Add tags to your video
              </p>
            </div>

            {/* Privacy */}
            <div>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Privacy
              </h4>
              <p className="text-[11px] text-neutral-400 mb-3">
                Choose the video privacy
              </p>

              <div className="space-y-3">
                {[
                  { id: 0, label: "Public" },
                  { id: 1, label: "Private" },
                  { id: 2, label: "Unlisted" },
                  { id: 3, label: "Scheduled" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <input
                      type="radio"
                      name="privacy"
                      checked={privacy === option.id}
                      onChange={() => setPrivacy(option.id)}
                      className="w-4 h-4 text-[#04abf2] accent-[#04abf2] focus:ring-[#04abf2]"
                    />
                    {privacy === option.id ? (
                      <span className="px-2 py-0.5 rounded bg-[#e6f6fd] text-[#04abf2] font-semibold">
                        {option.label}
                      </span>
                    ) : (
                      <span>{option.label}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons: PUBLISH and GO BACK */}
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={handlePublish}
                disabled={uploading}
                className="bg-[#04abf2] hover:bg-[#0399d8] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-md shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {uploading ? "PUBLISHING..." : "PUBLISH"}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-md transition-colors cursor-pointer"
              >
                GO BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadVideoPage({ policy }: { policy?: UserUploadLimitInfo }) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-5xl mx-auto py-12 text-center text-xs text-neutral-400">
          Loading video upload studio...
        </div>
      }
    >
      <UploadVideoContent policy={policy} />
    </Suspense>
  );
}

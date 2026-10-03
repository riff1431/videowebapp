"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Camera, X, Loader2, AlertCircle } from "lucide-react";
import { createActivityPostAction } from "@/modules/activities/activity.actions";
import { uploadToSupabaseStorage } from "@/lib/storage/supabase";

export function CreatePostClient() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be under 10MB");
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setError("");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      setError("Please write a message or upload an image.");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      let finalImageUrl = "";
      if (imageFile) {
        // Try uploading to cloud/local storage
        try {
          const uploaded = await uploadToSupabaseStorage(
            "playtube-uploads",
            `posts/${Date.now()}-${imageFile.name}`,
            imageFile
          );
          if (uploaded?.url) {
            finalImageUrl = uploaded.url;
          }
        } catch {
          // Fallback to data URL
          finalImageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageFile);
          });
        }
      }

      const formData = new FormData();
      formData.set("text", text.trim());
      formData.set("image", finalImageUrl);

      const res = await createActivityPostAction(formData);

      if (res.success) {
        router.push(`/@${res.username}?page=activities`);
        router.refresh();
      } else {
        setError(res.error || "Failed to publish post.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4">
      {/* PlayTube Standard Create Post Card matching Screenshot 4 */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
        {/* Card Header with Cyan Circle Message Icon */}
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="w-7 h-7 rounded-full bg-[#04abf2] flex items-center justify-center text-white shrink-0 shadow-xs">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
            Create new post
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-md text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Message Textarea */}
            <div className="md:col-span-2">
              <label className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mb-1.5">
                Write a message..
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder=""
                className="w-full h-44 p-3.5 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 rounded-md text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:border-[#04abf2] focus:ring-1 focus:ring-[#04abf2]/20 transition-all resize-none"
              />
            </div>

            {/* Column 2: Image Dropzone */}
            <div className="md:col-span-1">
              <label className="block text-xs font-normal text-neutral-500 dark:text-neutral-400 mb-1.5">
                Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 bg-[#ececec] dark:bg-neutral-800/80 rounded-md flex flex-col items-center justify-center cursor-pointer border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#04abf2] transition-colors relative overflow-hidden group"
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-500 dark:text-neutral-400">
                    <Camera className="w-9 h-9 stroke-[1.5]" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Centered Publish Button matching Screenshot 4 */}
          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={publishing}
              className="bg-[#04abf2] hover:bg-[#0399d8] active:bg-[#028ec8] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-10 py-2.5 rounded-full transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 select-none"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

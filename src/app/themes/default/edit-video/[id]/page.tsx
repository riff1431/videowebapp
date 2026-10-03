import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { videos, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Film, Edit3, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { updateVideoAction } from "@/modules/videos/video.actions";
import { requireAuth } from "@/lib/auth/require-auth";

interface EditVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  await requireAuth("/manage-videos");
  const resolvedParams = await params;
  const videoDbId = parseInt(resolvedParams.id, 10);

  if (isNaN(videoDbId)) {
    notFound();
  }

  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoDbId))
    .limit(1);

  if (!video) {
    notFound();
  }

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  async function handleUpdate(formData: FormData) {
    "use server";
    formData.set("id", String(videoDbId));
    const res = await updateVideoAction(formData);
    if (res.success) {
      redirect("/manage-videos");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/manage-videos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Videos
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="pb-4 mb-6 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Edit Video: {video.title}
            </h1>
            <p className="text-xs text-neutral-500">
              Update title, description, category, thumbnail, or privacy settings
            </p>
          </div>
        </div>

        <form action={handleUpdate} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Video Title *
            </label>
            <input
              type="text"
              name="title"
              defaultValue={video.title}
              required
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={video.description || ""}
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 resize-none"
            />
          </div>

          {/* Category & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Category
              </label>
              <select
                name="categoryId"
                defaultValue={video.categoryId || (allCategories[0]?.key || "other")}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
              >
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Privacy
              </label>
              <select
                name="privacy"
                defaultValue={String(video.privacy ?? 0)}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
              >
                <option value="0">Public (Anyone can watch)</option>
                <option value="1">Private (Only you can watch)</option>
              </select>
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail"
              defaultValue={video.thumbnail || ""}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
            />
            {video.thumbnail && (
              <div className="mt-3 w-48 aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-neutral-100">
                <img src={video.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
            <Link
              href="/manage-videos"
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

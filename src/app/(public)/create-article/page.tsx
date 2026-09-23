"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Newspaper, Image as ImageIcon, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { createArticleAction } from "@/modules/articles/article.actions";
import Link from "next/link";

const CATEGORIES = [
  { id: "general", name: "General" },
  { id: "tech", name: "Technology" },
  { id: "entertainment", name: "Entertainment" },
  { id: "music", name: "Music" },
  { id: "gaming", name: "Gaming" },
  { id: "news", name: "News & Politics" },
];

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1280&auto=format&fit=crop&q=80");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !text.trim()) {
      setError("Please fill in all required fields (title, description, content).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("text", text);
      formData.set("category", category);
      formData.set("tags", tags);
      formData.set("image", imageUrl);

      const res = await createArticleAction(formData);
      if (res.success && res.articleId) {
        router.push(`/articles/read/${res.articleId}`);
      } else {
        setError(res.error || "Failed to publish article");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while publishing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="pb-4 mb-6 border-b border-[var(--border)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Create New Article
            </h1>
            <p className="text-xs text-neutral-500">
              Publish rich stories, editorial analysis, and announcements
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Article Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your article a clear, captivating title..."
              required
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Short Description / Summary *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary shown in feeds and search results..."
              required
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none"
            />
          </div>

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tech, streaming, guides"
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Featured Image Cover URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Featured Image URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100"
              />
            </div>
            {imageUrl && (
              <div className="mt-3 w-48 h-28 rounded-lg overflow-hidden border border-[var(--border)] bg-neutral-100">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Full Article Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
              Article Content *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder="Write your story, formatting paragraphs with spacing..."
              required
              className="w-full px-4 py-3 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-[var(--primary)] text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 font-sans leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? "Publishing..." : "Publish Article"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

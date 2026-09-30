"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  ImagePlus,
  Undo2,
  Redo2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link2,
  Image as ImageIcon,
  Eye,
  Video,
  MoreHorizontal,
  ChevronDown,
  X,
  AlertCircle,
} from "lucide-react";
import { createArticleAction } from "@/modules/articles/article.actions";

const CATEGORIES = [
  "Category",
  "Film & Animation",
  "Music",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
  "Gaming",
  "People & Blogs",
  "Comedy",
  "Entertainment",
  "News & Politics",
  "How-to & Style",
  "Non-profits & Activism",
  "Other",
];

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [category, setCategory] = useState("Film & Animation");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tags, setTags] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText || "";
      setContentHtml(html);
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  };

  const executeEditorCommand = (command: string, value: string | undefined = undefined) => {
    if (typeof document !== "undefined") {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      handleEditorInput();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an article title.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide an article description.");
      return;
    }
    const plainContent = editorRef.current?.innerText?.trim() || "";
    if (!plainContent || plainContent.length < 10) {
      setError("Please write at least a few sentences for the article body.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("text", editorRef.current?.innerHTML || plainContent);
      formData.set("category", category === "Category" ? "general" : category.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      formData.set("tags", tags);
      if (thumbnailPreview) {
        formData.set("image", thumbnailPreview);
      }

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200/90 dark:border-neutral-800 rounded-xl p-6 sm:p-8 shadow-xs">
        {/* Header matching PlayTube Screenshot */}
        <div className="flex items-center gap-2 pb-3 mb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <Pencil className="w-5 h-5 text-neutral-800 dark:text-neutral-100" />
          <h1 className="text-base md:text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Create new article
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#141414] border border-neutral-300 dark:border-neutral-700/80 rounded-md outline-none focus:border-[#04abf2] transition-colors placeholder:text-neutral-400"
            />
          </div>

          {/* Description Fieldset */}
          <fieldset className="border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-1.5 focus-within:border-[#04abf2] transition-colors">
            <legend className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 px-1 ml-1">
              Description
            </legend>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent resize-y outline-none text-sm text-neutral-800 dark:text-neutral-100 pt-1"
            />
          </fieldset>

          {/* The Article (Rich Text WYSIWYG Editor) */}
          <fieldset className="border border-neutral-300 dark:border-neutral-700/80 rounded-md focus-within:border-[#04abf2] transition-colors overflow-hidden">
            <legend className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 px-1 ml-1">
              The article
            </legend>

            {/* Toolbar Buttons Row */}
            <div className="flex flex-wrap items-center gap-1 px-2.5 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20 text-neutral-600 dark:text-neutral-300">
              <button
                type="button"
                onClick={() => executeEditorCommand("undo")}
                title="Undo"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("redo")}
                title="Redo"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <span className="text-xs px-2 py-0.5 text-neutral-600 dark:text-neutral-300 font-medium">
                Paragraph
              </span>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <button
                type="button"
                onClick={() => executeEditorCommand("bold")}
                title="Bold"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded font-bold transition-colors"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("italic")}
                title="Italic"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded italic transition-colors"
              >
                <Italic className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <button
                type="button"
                onClick={() => executeEditorCommand("justifyLeft")}
                title="Align Left"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("justifyCenter")}
                title="Align Center"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("justifyRight")}
                title="Align Right"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("justifyFull")}
                title="Justify"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <button
                type="button"
                onClick={() => executeEditorCommand("insertUnorderedList")}
                title="Bullet List"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("insertOrderedList")}
                title="Numbered List"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("outdent")}
                title="Decrease Indent"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Outdent className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("indent")}
                title="Increase Indent"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Indent className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter hyperlink URL:");
                  if (url) executeEditorCommand("createLink", url);
                }}
                title="Insert Link"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) executeEditorCommand("insertImage", url);
                }}
                title="Insert Image"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Preview"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Insert Video"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="More"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Content Area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="w-full min-h-[300px] p-4 outline-none text-sm text-neutral-800 dark:text-neutral-100 leading-relaxed overflow-y-auto"
            />

            {/* Status Bar */}
            <div className="border-t border-neutral-200 dark:border-neutral-800 px-3 py-1 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>p</span>
              <span className="uppercase tracking-wider">{wordCount} WORDS POWERED BY TINY</span>
            </div>
          </fieldset>

          {/* Category Dropdown (Exact Screenshot 2 Parity) */}
          <div className="relative" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              className={`w-full px-3.5 py-2.5 text-sm text-left flex items-center justify-between bg-white dark:bg-[#141414] border rounded-md transition-colors ${categoryOpen
                ? "border-[#04abf2] ring-1 ring-[#04abf2]"
                : "border-neutral-300 dark:border-neutral-700/80"
                }`}
            >
              <span className={category === "Category" ? "text-neutral-400" : "text-neutral-800 dark:text-neutral-100"}>
                {category}
              </span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>

            {categoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white dark:bg-[#1a1a1a] border border-[#04abf2] rounded-md shadow-xl z-50 py-1 text-sm">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <div
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setCategoryOpen(false);
                      }}
                      className={`px-3.5 py-2 cursor-pointer transition-colors ${isSelected
                        ? "bg-[#04abf2] text-white font-medium"
                        : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                    >
                      {cat}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tags Fieldset */}
          <fieldset className="border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-1.5 focus-within:border-[#04abf2] transition-colors">
            <legend className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 px-1 ml-1">
              Tags
            </legend>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-neutral-800 dark:text-neutral-100"
            />
          </fieldset>

          {/* Thumbnail Dropzone Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700/80 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#04abf2] transition-colors bg-neutral-50/40 dark:bg-neutral-800/10 group relative"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {thumbnailPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="max-h-48 rounded-lg object-cover shadow-sm"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumbnailPreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <ImagePlus className="w-14 h-14 text-neutral-700 dark:text-neutral-300 stroke-[1.5] mb-2 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Browse To Upload Thumbnail
                </span>
              </>
            )}
          </div>

          {/* Publish Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "PUBLISHING..." : "PUBLISH"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Undo,
  Redo,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Link as LinkIcon,
  Smile,
  ChevronDown,
} from "lucide-react";
import { updateArticleAction } from "@/modules/admin/articles.actions";

interface CategoryOption {
  id: number;
  key: string;
  name: string;
}

interface ArticleData {
  id: number;
  title: string;
  description: string;
  text: string;
  category: string;
  tags: string;
  image: string;
  active: boolean;
}

interface EditArticleClientProps {
  article: ArticleData;
  categories: CategoryOption[];
}

export function EditArticleClient({ article, categories }: EditArticleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(article.title);
  const [description, setDescription] = useState(article.description);
  const [text, setText] = useState(article.text);
  const [category, setCategory] = useState(article.category);
  const [tags, setTags] = useState(article.tags);
  const [status, setStatus] = useState(article.active ? "1" : "0");
  const [imagePreview, setImagePreview] = useState<string | null>(article.image);

  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== article.text) {
      editorRef.current.innerHTML = article.text;
    }
  }, [article.text]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setImagePreview(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteCommand = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setText(editorRef.current.innerHTML);
    }
  };

  const calculateWordCount = (content: string) => {
    const clean = content.replace(/<[^>]*>?/gm, "").trim();
    if (!clean) return 0;
    return clean.split(/\s+/).filter(Boolean).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setAlert({ type: "error", message: "Please enter an article title." });
      return;
    }

    setAlert(null);
    startTransition(async () => {
      const res = await updateArticleAction(article.id, {
        title,
        description,
        text,
        category,
        tags,
        image: imagePreview || article.image,
        active: status === "1",
      });

      if (res.success) {
        setAlert({
          type: "success",
          message: "Article updated successfully!",
        });
        setTimeout(() => {
          router.push("/admin/manage-articles");
          router.refresh();
        }, 1200);
      } else {
        setAlert({
          type: "error",
          message: res.error || "Failed to update article.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Breadcrumb */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Edit article
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span className="hover:underline">Articles</span>
          <span>&gt;</span>
          <span className="text-[#04abf2] font-semibold">Edit article</span>
        </nav>
      </div>

      {/* Main Form Container Card */}
      <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-sm p-6">
        <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-5">
          Edit article
        </h6>

        {/* Alert Feedback */}
        {alert && (
          <div
            className={`p-3.5 mb-5 rounded text-xs flex items-center gap-2 ${
              alert.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Title, Description, WYSIWYG Editor */}
            <div className="lg:col-span-8 space-y-4">
              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Type a title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type a title"
                  className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#04abf2] transition-colors placeholder-neutral-400 dark:placeholder-neutral-500"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Type a description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type a description"
                  className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#04abf2] transition-colors placeholder-neutral-400 dark:placeholder-neutral-500 resize-y"
                />
              </div>

              {/* WYSIWYG Editor Container matching TinyMCE */}
              <div className="border border-neutral-300 dark:border-[#2f343b] rounded overflow-hidden bg-white text-neutral-900">
                {/* Menu Bar: File Edit View Insert Format Tools Table */}
                <div className="bg-[#f0f0f0] border-b border-[#ddd] px-3 py-1 text-[11px] text-neutral-700 flex flex-wrap items-center gap-4 select-none">
                  <span className="hover:text-black cursor-pointer">File</span>
                  <span className="hover:text-black cursor-pointer">Edit</span>
                  <span className="hover:text-black cursor-pointer">View</span>
                  <span className="hover:text-black cursor-pointer">Insert</span>
                  <span className="hover:text-black cursor-pointer">Format</span>
                  <span className="hover:text-black cursor-pointer">Tools</span>
                  <span className="hover:text-black cursor-pointer">Table</span>
                </div>

                {/* Toolbar */}
                <div className="bg-[#f8f8f8] border-b border-[#ddd] px-2 py-1.5 flex flex-wrap items-center gap-1 select-none text-neutral-700">
                  {/* Undo / Redo */}
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("undo")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Undo"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("redo")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Redo"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  {/* Formats Dropdown */}
                  <div className="relative inline-flex items-center">
                    <select
                      onChange={(e) => handleExecuteCommand("formatBlock", e.target.value)}
                      className="h-6 text-[11px] bg-white border border-neutral-300 rounded px-1.5 text-neutral-700 focus:outline-none cursor-pointer"
                      defaultValue="p"
                    >
                      <option value="p">Paragraph</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                      <option value="blockquote">Quote</option>
                    </select>
                  </div>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  {/* Bold / Italic */}
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("bold")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("italic")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  {/* Alignments */}
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("justifyLeft")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("justifyCenter")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("justifyRight")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("justifyFull")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Justify"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  {/* Lists */}
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("insertUnorderedList")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Bullet list"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("insertOrderedList")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Numbered list"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("outdent")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Outdent"
                  >
                    <Outdent className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("indent")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Indent"
                  >
                    <Indent className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-neutral-300 mx-1" />

                  {/* Link & Image */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter hyperlink URL:");
                      if (url) handleExecuteCommand("createLink", url);
                    }}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) handleExecuteCommand("insertImage", url);
                    }}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Insert Image"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExecuteCommand("insertText", "😊")}
                    className="p-1 hover:bg-neutral-200 rounded text-neutral-700 cursor-pointer"
                    title="Emoticons"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Editable Content Area */}
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  className="p-4 min-h-[360px] max-h-[550px] overflow-y-auto text-xs text-neutral-800 leading-relaxed focus:outline-none bg-white font-sans"
                />

                {/* Status bar: Powered by TinyMCE / Word counter */}
                <div className="bg-[#f8f8f8] border-t border-[#ddd] px-3 py-1 flex items-center justify-between text-[10px] text-neutral-500 select-none">
                  <span>p</span>
                  <span>{calculateWordCount(text)} WORDS POWERED BY TINYMCE</span>
                </div>
              </div>
            </div>

            {/* Right Column: Select Image Box, Category, Status, Tags, Submit Button */}
            <div className="lg:col-span-4 space-y-4">
              {/* Image Upload Box */}
              <div className="space-y-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-neutral-400 dark:border-neutral-600 hover:border-[#04abf2] dark:hover:border-[#04abf2] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden bg-neutral-50/50 dark:bg-[#121316]/50 group"
                >
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Article Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 group-hover:text-[#04abf2]">
                      <div className="p-1.5 bg-neutral-200 dark:bg-[#25282e] rounded group-hover:bg-[#04abf2]/10 transition-colors">
                        <ImageIcon className="w-4 h-4 text-inherit" />
                      </div>
                      <span className="text-xs font-semibold">Select Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#04abf2] transition-colors appearance-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#04abf2] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder=""
                  className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-[#04abf2] transition-colors"
                />
              </div>

              {/* Save / Update Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save"}
                </button>

                <Link
                  href="/admin/manage-articles"
                  className="px-4 py-2 bg-neutral-200 dark:bg-[#25282e] hover:bg-neutral-300 dark:hover:bg-[#2d3138] text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded shadow-xs transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

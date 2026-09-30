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
  Check,
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

  // Tags pill state
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Editor selection reference
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Modals state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Link Modal State
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkTarget, setLinkTarget] = useState<"_self" | "_blank">("_self");
  const [linkTargetOpen, setLinkTargetOpen] = useState(false);

  // Image Modal State
  const [imageSource, setImageSource] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [imageLocked, setImageLocked] = useState(true);
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  // Media Modal State
  const [mediaTab, setMediaTab] = useState<"general" | "embed" | "advanced">("general");
  const [mediaSource, setMediaSource] = useState("");
  const [mediaWidth, setMediaWidth] = useState("560");
  const [mediaHeight, setMediaHeight] = useState("315");
  const [mediaEmbedCode, setMediaEmbedCode] = useState("");
  const [mediaAltSource, setMediaAltSource] = useState("");
  const [mediaPoster, setMediaPoster] = useState("");
  const [mediaLocked, setMediaLocked] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const linkTargetDropdownRef = useRef<HTMLDivElement>(null);

  // Close category & link dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (linkTargetDropdownRef.current && !linkTargetDropdownRef.current.contains(e.target as Node)) {
        setLinkTargetOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for Escape key to close modals
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowLinkModal(false);
        setShowImageModal(false);
        setShowMediaModal(false);
        setShowPreviewModal(false);
        setLinkTargetOpen(false);
        setCategoryOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Pre-calculate image aspect ratio when image source changes
  useEffect(() => {
    if (!imageSource.trim()) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const ratio = img.naturalWidth / img.naturalHeight;
        setImageRatio(ratio);
        if (!imageWidth && !imageHeight) {
          setImageWidth(String(img.naturalWidth));
          setImageHeight(String(img.naturalHeight));
        }
      }
    };
    img.src = imageSource.trim();
  }, [imageSource, imageWidth, imageHeight]);

  const saveSelection = () => {
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        setSavedRange(sel.getRangeAt(0));
      }
    }
  };

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

  const insertHtmlAtCursor = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (savedRange && sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedRange);
          document.execCommand("insertHTML", false, html);
        } catch {
          editorRef.current.innerHTML += html;
        }
      } else {
        editorRef.current.innerHTML += html;
      }
      handleEditorInput();
    }
  };

  // Image Modal Width / Height change with lock
  const handleImageWidthChange = (val: string) => {
    setImageWidth(val);
    const num = parseFloat(val);
    if (imageLocked && !isNaN(num) && imageRatio && imageRatio > 0) {
      setImageHeight(String(Math.round(num / imageRatio)));
    }
  };

  const handleImageHeightChange = (val: string) => {
    setImageHeight(val);
    const num = parseFloat(val);
    if (imageLocked && !isNaN(num) && imageRatio && imageRatio > 0) {
      setImageWidth(String(Math.round(num * imageRatio)));
    }
  };

  // Media Modal Width / Height change with lock (default 16:9)
  const MEDIA_RATIO = 16 / 9;
  const handleMediaWidthChange = (val: string) => {
    setMediaWidth(val);
    const num = parseFloat(val);
    if (mediaLocked && !isNaN(num) && num > 0) {
      setMediaHeight(String(Math.round(num / MEDIA_RATIO)));
    }
  };

  const handleMediaHeightChange = (val: string) => {
    setMediaHeight(val);
    const num = parseFloat(val);
    if (mediaLocked && !isNaN(num) && num > 0) {
      setMediaWidth(String(Math.round(num * MEDIA_RATIO)));
    }
  };

  // Link Modal Submit
  const handleSaveLink = () => {
    if (!linkUrl.trim()) return;
    const text = linkText.trim() || linkUrl.trim();
    const targetAttr = linkTarget === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : "";
    const titleAttr = linkTitle.trim() ? ` title="${linkTitle.trim()}"` : "";
    const html = `<a href="${linkUrl.trim()}"${titleAttr}${targetAttr} style="color:#04abf2; text-decoration:underline;">${text}</a>`;
    insertHtmlAtCursor(html);
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    setLinkTitle("");
    setLinkTarget("_self");
    setLinkTargetOpen(false);
  };

  // Image Modal Submit
  const handleSaveImage = () => {
    if (!imageSource.trim()) return;
    const widthAttr = imageWidth.trim() ? ` width="${imageWidth.trim()}"` : "";
    const heightAttr = imageHeight.trim() ? ` height="${imageHeight.trim()}"` : "";
    const html = `<img src="${imageSource.trim()}" alt="${imageAlt.trim()}"${widthAttr}${heightAttr} style="max-width:100%; height:auto; border-radius:6px; margin:10px 0;" />`;
    insertHtmlAtCursor(html);
    setShowImageModal(false);
    setImageSource("");
    setImageAlt("");
    setImageWidth("");
    setImageHeight("");
  };

  // Media Modal Submit
  const handleSaveMedia = () => {
    let html = "";
    if (mediaTab === "embed" && mediaEmbedCode.trim()) {
      html = `<div style="margin:16px 0; max-width:100%;">${mediaEmbedCode.trim()}</div>`;
    } else if (mediaSource.trim()) {
      const src = mediaSource.trim();
      const w = mediaWidth.trim() || "560";
      const h = mediaHeight.trim() || "315";

      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        let videoId = "";
        if (src.includes("youtu.be/")) {
          videoId = src.split("youtu.be/")[1]?.split("?")[0] || "";
        } else if (src.includes("watch?v=")) {
          videoId = src.split("watch?v=")[1]?.split("&")[0] || "";
        }
        html = `<div style="position:relative; width:${w}px; max-width:100%; aspect-ratio:16/9; margin:16px 0;"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:6px;"></iframe></div>`;
      } else if (src.includes("vimeo.com")) {
        const vimeoId = src.split("/").pop() || "";
        html = `<div style="position:relative; width:${w}px; max-width:100%; aspect-ratio:16/9; margin:16px 0;"><iframe width="100%" height="100%" src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:6px;"></iframe></div>`;
      } else {
        html = `<video controls width="${w}" height="${h}" src="${src}" ${mediaPoster ? `poster="${mediaPoster}"` : ""} style="max-width:100%; border-radius:6px; margin:16px 0;"></video>`;
      }
    }

    if (html) {
      insertHtmlAtCursor(html);
    }
    setShowMediaModal(false);
    setMediaSource("");
    setMediaEmbedCode("");
    setMediaAltSource("");
    setMediaPoster("");
  };

  // Tags Pill Management (Space separated words become tags)
  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!tagsList.includes(trimmed)) {
      setTagsList((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (indexToRemove: number) => {
    setTagsList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tagsList.length > 0) {
      // Remove last tag when backspacing on empty input
      setTagsList((prev) => prev.slice(0, -1));
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
      // Collect any residual tag in input
      const finalTags = [...tagsList];
      if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
        finalTags.push(tagInput.trim());
      }

      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("text", editorRef.current?.innerHTML || plainContent);
      formData.set(
        "category",
        category === "Category" ? "general" : category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      );
      formData.set("tags", finalTags.join(","));
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
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("redo")}
                title="Redo"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
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
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded font-bold transition-colors cursor-pointer"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("italic")}
                title="Italic"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded italic transition-colors cursor-pointer"
              >
                <Italic className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <button
                type="button"
                onClick={() => executeEditorCommand("justifyLeft")}
                title="Align Left"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("justifyCenter")}
                title="Align Center"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("justifyRight")}
                title="Align Right"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("justifyFull")}
                title="Justify"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <AlignJustify className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              <button
                type="button"
                onClick={() => executeEditorCommand("insertUnorderedList")}
                title="Bullet List"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("insertOrderedList")}
                title="Numbered List"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("outdent")}
                title="Decrease Indent"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <Outdent className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => executeEditorCommand("indent")}
                title="Increase Indent"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <Indent className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700 mx-1" />

              {/* Insert Link Button */}
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  const selected = window.getSelection()?.toString() || "";
                  setLinkText(selected);
                  setShowLinkModal(true);
                }}
                title="Insert Link"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <Link2 className="w-4 h-4" />
              </button>

              {/* Insert Image Button */}
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowImageModal(true);
                }}
                title="Insert Image"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Insert Media / Video Button */}
              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setShowMediaModal(true);
                }}
                title="Insert Video / Media"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
              </button>

              {/* Preview Button (Opens Full Screen Dialog) */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                title="Preview Article (Full Screen)"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer text-[#04abf2]"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                type="button"
                title="More"
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Content Area */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onKeyUp={saveSelection}
              onMouseUp={saveSelection}
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
              className={`w-full px-3.5 py-2.5 text-sm text-left flex items-center justify-between bg-white dark:bg-[#141414] border rounded-md transition-colors ${
                categoryOpen
                  ? "border-[#04abf2] ring-1 ring-[#04abf2]"
                  : "border-neutral-300 dark:border-neutral-700/80"
              }`}
            >
              <span
                className={
                  category === "Category"
                    ? "text-neutral-400"
                    : "text-neutral-800 dark:text-neutral-100"
                }
              >
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
                      className={`px-3.5 py-2 cursor-pointer transition-colors ${
                        isSelected
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

          {/* Tags Fieldset (Space-separated words become tags matching screenshot) */}
          <fieldset
            onClick={() => tagInputRef.current?.focus()}
            className="border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3 py-1.5 focus-within:border-[#04abf2] transition-colors cursor-text"
          >
            <legend className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 px-1 ml-1">
              Tags
            </legend>
            <div className="flex flex-wrap items-center gap-1.5 py-0.5">
              {tagsList.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#04abf2] text-white text-xs px-2.5 py-1 rounded-[3px] flex items-center gap-1.5 shadow-xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(idx);
                    }}
                    className="hover:opacity-75 cursor-pointer text-white font-bold leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-neutral-800 dark:text-neutral-100 py-1"
                placeholder={tagsList.length === 0 ? "Type tag and press space..." : ""}
              />
            </div>
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

      {/* ========================================================================= */}
      {/* 1. Insert/Edit Link Dialog (Exact Screenshot 3 Parity)                    */}
      {/* ========================================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#202328] border border-[#d0d5dd] dark:border-neutral-700 shadow-[0_12px_28px_rgba(0,0,0,0.18)] rounded-[4px] w-full max-w-[490px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Header (No line under header matching screenshot) */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-normal text-[#222f3e] dark:text-neutral-100">
                Insert/Edit Link
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkTargetOpen(false);
                }}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pt-1 pb-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                  URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                  Text to display
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                />
              </div>

              <div>
                <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                  Title
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                />
              </div>

              {/* Custom Open link in... Dropdown (Screenshot 3 Parity) */}
              <div className="relative" ref={linkTargetDropdownRef}>
                <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                  Open link in...
                </label>
                <button
                  type="button"
                  onClick={() => setLinkTargetOpen(!linkTargetOpen)}
                  className="w-full flex items-center justify-between border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#15171a] outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] transition-all cursor-pointer"
                >
                  <span>{linkTarget === "_blank" ? "New window" : "Current window"}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>

                {linkTargetOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#202328] border border-neutral-200 dark:border-neutral-700 rounded-[3px] shadow-lg z-30 py-1 text-[13px]">
                    <div
                      onClick={() => {
                        setLinkTarget("_self");
                        setLinkTargetOpen(false);
                      }}
                      className="px-3.5 py-2 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-700/50 cursor-pointer text-neutral-800 dark:text-neutral-200"
                    >
                      <span>Current window</span>
                      {linkTarget === "_self" && (
                        <Check className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                      )}
                    </div>
                    <div
                      onClick={() => {
                        setLinkTarget("_blank");
                        setLinkTargetOpen(false);
                      }}
                      className="px-3.5 py-2 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-700/50 cursor-pointer text-neutral-800 dark:text-neutral-200"
                    >
                      <span>New window</span>
                      {linkTarget === "_blank" && (
                        <Check className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with top border */}
            <div className="border-t border-[#dee2e6] dark:border-neutral-700/80 px-6 py-3.5 flex items-center justify-end gap-2.5 bg-white dark:bg-[#202328]">
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkTargetOpen(false);
                }}
                className="px-4 py-2 text-[13px] font-bold text-[#212529] dark:text-neutral-200 bg-[#e9ecef] hover:bg-[#dee2e6] dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-[4px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="px-5 py-2 text-[13px] font-bold text-white bg-[#207ab7] hover:bg-[#1b6699] rounded-[4px] transition-colors cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Insert/Edit Image Dialog (Exact Screenshot 1 Parity)                   */}
      {/* ========================================================================= */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#202328] border border-[#d0d5dd] dark:border-neutral-700 shadow-[0_12px_28px_rgba(0,0,0,0.18)] rounded-[4px] w-full max-w-[490px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Header (No line under header) */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-normal text-[#222f3e] dark:text-neutral-100">
                Insert/Edit Image
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pt-1 pb-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                  Source
                </label>
                <input
                  type="text"
                  value={imageSource}
                  onChange={(e) => setImageSource(e.target.value)}
                  className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                  Alternative description
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                />
              </div>

              {/* Width & Height & Lock Button side by side */}
              <div className="flex items-center gap-3">
                <div className="w-[150px]">
                  <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                    Width
                  </label>
                  <input
                    type="text"
                    value={imageWidth}
                    onChange={(e) => handleImageWidthChange(e.target.value)}
                    className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                  />
                </div>
                <div className="w-[150px]">
                  <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                    Height
                  </label>
                  <input
                    type="text"
                    value={imageHeight}
                    onChange={(e) => handleImageHeightChange(e.target.value)}
                    className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageLocked(!imageLocked)}
                  title={imageLocked ? "Constrain proportions (locked)" : "Free proportions (unlocked)"}
                  className="mt-6 p-1 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded cursor-pointer transition-colors"
                >
                  {imageLocked ? (
                    <svg className="w-4 h-4 fill-neutral-800 dark:fill-neutral-200" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 fill-neutral-800 dark:fill-neutral-200" viewBox="0 0 24 24">
                      <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5-2.28 0-4.27 1.54-4.84 3.75-.14.54.18 1.08.72 1.23.53.14 1.08-.18 1.22-.72C9.44 3.86 10.61 3 12 3c1.66 0 3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#dee2e6] dark:border-neutral-700/80 px-6 py-3.5 flex items-center justify-end gap-2.5 bg-white dark:bg-[#202328]">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 text-[13px] font-bold text-[#212529] dark:text-neutral-200 bg-[#e9ecef] hover:bg-[#dee2e6] dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-[4px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                className="px-5 py-2 text-[13px] font-bold text-white bg-[#207ab7] hover:bg-[#1b6699] rounded-[4px] transition-colors cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Insert/Edit Media Dialog (Exact Screenshot 2 Parity)                   */}
      {/* ========================================================================= */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#202328] border border-[#d0d5dd] dark:border-neutral-700 shadow-[0_12px_28px_rgba(0,0,0,0.18)] rounded-[4px] w-full max-w-[540px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Header (No line under header) */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-normal text-[#222f3e] dark:text-neutral-100">
                Insert/Edit Media
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body with Left Navigation Tabs */}
            <div className="px-6 pt-1 pb-4 flex gap-6 text-xs">
              {/* Left Tab List */}
              <div className="w-24 shrink-0 space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMediaTab("general")}
                  className={`block text-left text-[13px] transition-colors cursor-pointer ${
                    mediaTab === "general"
                      ? "text-[#207ab7] font-semibold border-b-2 border-[#207ab7] pb-0.5 inline-block"
                      : "text-[#595f69] dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab("embed")}
                  className={`block text-left text-[13px] transition-colors cursor-pointer ${
                    mediaTab === "embed"
                      ? "text-[#207ab7] font-semibold border-b-2 border-[#207ab7] pb-0.5 inline-block"
                      : "text-[#595f69] dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Embed
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab("advanced")}
                  className={`block text-left text-[13px] transition-colors cursor-pointer ${
                    mediaTab === "advanced"
                      ? "text-[#207ab7] font-semibold border-b-2 border-[#207ab7] pb-0.5 inline-block"
                      : "text-[#595f69] dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  Advanced
                </button>
              </div>

              {/* Right Tab Content */}
              <div className="flex-1 space-y-3.5">
                {mediaTab === "general" && (
                  <>
                    <div>
                      <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                        Source
                      </label>
                      <input
                        type="text"
                        value={mediaSource}
                        onChange={(e) => setMediaSource(e.target.value)}
                        placeholder="https://..."
                        className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-[120px]">
                        <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                          Width
                        </label>
                        <input
                          type="text"
                          value={mediaWidth}
                          onChange={(e) => handleMediaWidthChange(e.target.value)}
                          className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                        />
                      </div>
                      <div className="w-[120px]">
                        <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                          Height
                        </label>
                        <input
                          type="text"
                          value={mediaHeight}
                          onChange={(e) => handleMediaHeightChange(e.target.value)}
                          className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setMediaLocked(!mediaLocked)}
                        title={mediaLocked ? "Constrain proportions" : "Free proportions"}
                        className="mt-6 p-1 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded cursor-pointer transition-colors"
                      >
                        {mediaLocked ? (
                          <svg className="w-4 h-4 fill-neutral-800 dark:fill-neutral-200" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 fill-neutral-800 dark:fill-neutral-200" viewBox="0 0 24 24">
                            <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5-2.28 0-4.27 1.54-4.84 3.75-.14.54.18 1.08.72 1.23.53.14 1.08-.18 1.22-.72C9.44 3.86 10.61 3 12 3c1.66 0 3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {mediaTab === "embed" && (
                  <div>
                    <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                      Paste your embed code below:
                    </label>
                    <textarea
                      rows={5}
                      value={mediaEmbedCode}
                      onChange={(e) => setMediaEmbedCode(e.target.value)}
                      placeholder="<iframe src='...'></iframe>"
                      className="w-full font-mono border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                    />
                  </div>
                )}

                {mediaTab === "advanced" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                        Alternative source URL
                      </label>
                      <input
                        type="text"
                        value={mediaAltSource}
                        onChange={(e) => setMediaAltSource(e.target.value)}
                        className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-normal text-[#495057] dark:text-neutral-300 mb-1.5 block">
                        Media poster (image URL)
                      </label>
                      <input
                        type="text"
                        value={mediaPoster}
                        onChange={(e) => setMediaPoster(e.target.value)}
                        placeholder="https://.../poster.jpg"
                        className="w-full border border-[#ced4da] dark:border-neutral-600 rounded-[3px] px-3 py-1.5 text-[13px] text-neutral-800 dark:text-neutral-100 outline-none focus:border-[#207ab7] focus:ring-1 focus:ring-[#207ab7] bg-white dark:bg-[#15171a] transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#dee2e6] dark:border-neutral-700/80 px-6 py-3.5 flex items-center justify-end gap-2.5 bg-white dark:bg-[#202328]">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 text-[13px] font-bold text-[#212529] dark:text-neutral-200 bg-[#e9ecef] hover:bg-[#dee2e6] dark:bg-neutral-700 dark:hover:bg-neutral-600 rounded-[4px] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMedia}
                className="px-5 py-2 text-[13px] font-bold text-white bg-[#207ab7] hover:bg-[#1b6699] rounded-[4px] transition-colors cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Fullscreen Preview Dialog (Live Full Fidelity Article Preview)          */}
      {/* ========================================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-[#f4f5f7] dark:bg-[#0f1115] flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Top Fullscreen Header Bar */}
          <div className="bg-white dark:bg-[#1c1f24] border-b border-neutral-200 dark:border-neutral-800 px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#04abf2]/10 flex items-center justify-center text-[#04abf2]">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">
                  Article Preview
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Full screen live reading view of your article
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close Preview</span>
              </button>
            </div>
          </div>

          {/* Full Page Content Preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-10">
            <article className="max-w-3xl mx-auto bg-white dark:bg-[#1a1d22] rounded-xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-12 shadow-md">
              {/* Category */}
              <div className="mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#04abf2]/10 text-[#04abf2]">
                  {category || "General"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-4 leading-tight">
                {title || "Untitled Article"}
              </h1>

              {/* Description Quote */}
              {description && (
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 italic border-l-3 border-[#04abf2] pl-3 py-1 mb-6 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-r-md">
                  {description}
                </p>
              )}

              {/* Thumbnail Header Image */}
              {thumbnailPreview && (
                <div className="mb-6 rounded-xl overflow-hidden shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview}
                    alt="Article thumbnail"
                    className="w-full max-h-[420px] object-cover"
                  />
                </div>
              )}

              {/* Rendered HTML Content */}
              <div
                className="text-sm sm:text-base leading-relaxed text-neutral-800 dark:text-neutral-200 space-y-4 break-words"
                dangerouslySetInnerHTML={{
                  __html:
                    editorRef.current?.innerHTML ||
                    "<p class='text-neutral-400 italic'>Article body is empty. Type in the editor to see preview.</p>",
                }}
              />

              {/* Tags */}
              {(tagsList.length > 0 || tagInput.trim()) && (
                <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-neutral-500 font-medium mr-1">Tags:</span>
                  {[...tagsList, ...(tagInput.trim() ? [tagInput.trim()] : [])].map(
                    (tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#04abf2] text-white text-xs px-2.5 py-1 rounded-[3px] font-medium"
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              )}
            </article>
          </div>
        </div>
      )}
    </div>
  );
}

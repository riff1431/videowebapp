"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { sendNewsletterAction } from "@/modules/admin/tools.actions";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Smile,
  Eye,
  Type,
  Palette,
} from "lucide-react";

export default function NewslettersPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [btnText, setBtnText] = useState("Send");
  const [isPending, startTransition] = useTransition();

  const insertFormatting = (tag: string) => {
    setMessage((prev) => `${prev}<${tag}>Your text</${tag}>`);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!subject.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Please provide both Subject and Message" });
      return;
    }

    startTransition(async () => {
      setBtnText("Please wait..");
      const res = await sendNewsletterAction({
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text: res.message || "Message Sent!",
        });
        setSubject("");
        setMessage("");
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to send newsletter",
        });
      }

      setBtnText("Send");
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletters</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            Admin Panel
          </Link>
          <span>›</span>
          <span>Tools</span>
          <span>›</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Newsletters</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full">
        <div className="bg-white dark:bg-[#22252a] border border-gray-200 dark:border-[#292d33] rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Newsletters</h2>

          {/* Alert / Feedback message */}
          {feedback && (
            <div
              className={`p-3.5 rounded-lg text-sm flex items-center gap-2.5 ${
                feedback.type === "success"
                  ? "bg-[#275a43] text-emerald-100 border border-emerald-700/50"
                  : "bg-red-900/40 text-red-200 border border-red-700/50"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                placeholder="Enter newsletter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-[#1c1e22] border border-gray-300 dark:border-[#292d33] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00adef]"
              />
            </div>

            {/* Message (HTML Allowed) with WYSIWYG Styling Toolbar */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message (HTML Allowed)
              </label>

              {/* TinyMCE-like visual toolbar */}
              <div className="border border-gray-300 dark:border-[#292d33] rounded-lg overflow-hidden bg-white dark:bg-[#1c1e22]">
                {/* Top menubar items */}
                <div className="flex items-center gap-4 px-3 py-1.5 border-b border-gray-200 dark:border-[#292d33] text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#1c1e22]">
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">File</span>
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">Edit</span>
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">View</span>
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">Insert</span>
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">Format</span>
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">Tools</span>
                  <span className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer">Table</span>
                </div>

                {/* Icon buttons toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-[#292d33] bg-gray-50/70 dark:bg-[#1c1e22] text-gray-600 dark:text-gray-300 text-sm">
                  <button
                    type="button"
                    onClick={() => insertFormatting("b")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("i")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("u")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("p align='left'")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Align Left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("p align='center'")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("p align='right'")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Align Right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("p align='justify'")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Justify"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("ul><li>Item 1</li><li>Item 2</li></ul")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("ol><li>Item 1</li><li>Item 2</li></ol")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-1" />
                  <button
                    type="button"
                    onClick={() => insertFormatting("a href='https://...'")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Insert Link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("span style='color:#00bcd4;'")}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Text Color"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage((prev) => `${prev} 😊`)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                    title="Emoticon"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  rows={12}
                  placeholder="Write your email body or HTML content here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 text-sm bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 font-mono resize-y"
                />

                {/* Footer status */}
                <div className="px-4 py-1.5 border-t border-gray-200 dark:border-[#292d33] text-[11px] text-gray-400 text-right bg-gray-50/50 dark:bg-[#1c1e22]">
                  {message.trim() ? message.trim().split(/\s+/).length : 0} WORDS POWERED BY TINYMCE
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-[#00adef] hover:bg-[#0096d6] text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{btnText}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

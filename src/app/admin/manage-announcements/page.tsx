"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAnnouncementsAction,
  createAnnouncementAction,
  toggleAnnouncementAction,
  deleteAnnouncementAction,
  type AnnouncementItem,
} from "@/modules/admin/tools.actions";
import {
  Home,
  ChevronRight,
  Clock,
  Eye,
  X,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Smile,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ManageAnnouncementsPage() {
  const [activeList, setActiveList] = useState<AnnouncementItem[]>([]);
  const [inactiveList, setInactiveList] = useState<AnnouncementItem[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncementsAction();
      if (res.success) {
        setActiveList(res.active);
        setInactiveList(res.inactive);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || text.trim().length < 5) {
      setNotice({ type: "error", text: "Please enter announcement text (at least 5 characters)" });
      return;
    }

    setSubmitting(true);
    setNotice(null);

    try {
      const res = await createAnnouncementAction(text);
      if (res.success) {
        setNotice({ type: "success", text: "Announcement created successfully!" });
        setText("");
        fetchAnnouncements();
      } else {
        setNotice({ type: "error", text: res.message || "Failed to create announcement" });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleAnnouncementAction(id);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncementAction(id);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper formatting insert
  const insertFormatting = (tag: string) => {
    setText((prev) => `${prev}<${tag}>Your text</${tag}>`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Announcements
        </h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          <Link href="/admin" className="hover:text-cyan-500 flex items-center gap-1">
            <Home className="w-4 h-4" />
            Admin Panel
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-700 dark:text-neutral-200 font-medium">Announcements</span>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Manage Announcements (Editor) */}
        <div className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-5 flex flex-col">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Manage Announcements
          </h2>

          {notice && (
            <div
              className={`p-3 rounded text-sm mb-4 flex items-center gap-2 ${
                notice.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 flex-1 flex flex-col">
            {/* Visual Editor Toolbar */}
            <div className="border border-neutral-200 dark:border-[#292d33] rounded-md overflow-hidden bg-neutral-50 dark:bg-[#1c1e22]">
              <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-200 dark:border-[#292d33] bg-neutral-100 dark:bg-[#1c1e22] text-neutral-600 dark:text-neutral-400">
                <button
                  type="button"
                  onClick={() => insertFormatting("b")}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("i")}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("u")}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition"
                  title="Underline"
                >
                  <Underline className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("p")}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition"
                  title="Paragraph"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setText((p) => p + "<ul><li>Item</li></ul>")}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setText((p) => p + "<a href='#'>Link</a>")}
                  className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Create New Announcement (HTML Allowed)..."
                rows={14}
                className="w-full p-4 bg-white dark:bg-[#1c1e22] text-neutral-800 dark:text-neutral-200 text-sm focus:outline-none resize-none font-sans"
              />
              <div className="px-3 py-1.5 bg-neutral-50 dark:bg-[#1c1e22] border-t border-neutral-200 dark:border-[#292d33] text-[11px] text-neutral-400 text-right">
                HTML SUPPORTED
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#00adef] hover:bg-[#0096d6] text-white rounded font-medium text-sm transition shadow-sm disabled:opacity-50"
              >
                {submitting ? "Please wait..." : "Create"}
              </button>
            </div>
          </form>
        </div>

        {/* Column 2: Active Announcements */}
        <div className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-5">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Active Announcements
          </h2>

          <div className="space-y-3">
            {loading ? (
              <div className="text-neutral-500 text-sm py-8 text-center">Loading announcements...</div>
            ) : activeList.length === 0 ? (
              <div className="text-neutral-500 dark:text-neutral-400 text-sm py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                No active announcements
              </div>
            ) : (
              activeList.map((ann) => (
                <div
                  key={ann.id}
                  className="relative p-4 rounded-md bg-[#25523b] text-white shadow-sm group transition"
                >
                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(ann.id)}
                      title="Deactivate / Close"
                      className="p-1 hover:bg-black/20 rounded text-neutral-300 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      title="Delete Announcement"
                      className="p-1 hover:bg-black/20 rounded text-neutral-300 hover:text-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Announcement Content */}
                  <div
                    className="text-sm font-medium leading-relaxed pr-14 break-words"
                    dangerouslySetInnerHTML={{ __html: ann.text }}
                  />

                  {/* Time and Views */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ann.time}</span>
                    <span className="mx-1">·</span>
                    <span>{ann.views} Views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Inactive Announcements */}
        <div className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-5">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            Inactive Announcements
          </h2>

          <div className="space-y-3">
            {loading ? (
              <div className="text-neutral-500 text-sm py-8 text-center">Loading announcements...</div>
            ) : inactiveList.length === 0 ? (
              <div className="text-neutral-500 dark:text-neutral-400 text-sm py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                No inactive announcements
              </div>
            ) : (
              inactiveList.map((ann) => (
                <div
                  key={ann.id}
                  className="relative p-4 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm group border border-neutral-200 dark:border-neutral-700 transition"
                >
                  {/* Action Icons */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(ann.id)}
                      title="Activate"
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 hover:text-emerald-500 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      title="Delete Announcement"
                      className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded text-neutral-500 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Announcement Content */}
                  <div
                    className="text-sm leading-relaxed pr-14 break-words opacity-80"
                    dangerouslySetInnerHTML={{ __html: ann.text }}
                  />

                  {/* Time and Views */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ann.time}</span>
                    <span className="mx-1">·</span>
                    <span>{ann.views} Views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

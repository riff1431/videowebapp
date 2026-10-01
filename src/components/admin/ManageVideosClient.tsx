"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteVideoAction,
  bulkDeleteVideosAction,
  toggleApproveVideoAction,
  addFakeViewsAction,
} from "@/modules/admin/videos.actions";
import {
  Video as VideoIcon,
  Trash2,
  ExternalLink,
  Edit,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface AdminVideoItem {
  id: number;
  videoId: string;
  title: string;
  thumbnail: string;
  categoryId: string | null;
  videoType: string | null;
  privacy: number | null;
  isApproved: boolean | null;
  price: number | null;
  views: number | null;
  duration: string | null;
  createdAt: Date;
  user: {
    id: number;
    username: string;
    avatar: string | null;
  } | null;
}

interface ManageVideosClientProps {
  initialVideos: AdminVideoItem[];
  categoriesList: { key: string; name: string }[];
}

export function ManageVideosClient({
  initialVideos,
  categoriesList,
}: ManageVideosClientProps) {
  const [videosList, setVideosList] = useState<AdminVideoItem[]>(initialVideos);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [limitFilter, setLimitFilter] = useState("50");
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("0");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [actionType, setActionType] = useState<"approve" | "disapprove" | "delete">("approve");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Fake views modal state
  const [fakeModalVideoId, setFakeModalVideoId] = useState<number | null>(null);
  const [fakeViewsInput, setFakeViewsInput] = useState("100");
  const [fakeLikesInput, setFakeLikesInput] = useState("10");
  const [fakeSuccessMessage, setFakeSuccessMessage] = useState(false);

  // Single delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filter videos
  const filtered = videosList.filter((v) => {
    // Keyword, ID, Title
    const matchesKeyword =
      !search ||
      v.id.toString() === search.trim() ||
      v.videoId.toLowerCase().includes(search.toLowerCase()) ||
      v.title.toLowerCase().includes(search.toLowerCase());

    // Source
    let matchesSource = true;
    if (sourceFilter === "uploaded") {
      matchesSource = v.videoType !== "youtube" && v.videoType !== "dailymotion" && v.videoType !== "vimeo";
    } else if (sourceFilter !== "all") {
      matchesSource = v.videoType === sourceFilter;
    }

    // Privacy
    let matchesPrivacy = true;
    if (privacyFilter !== "all") {
      matchesPrivacy = v.privacy?.toString() === privacyFilter;
    }

    // Category
    let matchesCategory = true;
    if (categoryFilter !== "0") {
      matchesCategory = v.categoryId === categoryFilter;
    }

    // Type (Paid / Free / Review)
    let matchesType = true;
    if (typeFilter === "paid") {
      matchesType = (v.price ?? 0) > 0;
    } else if (typeFilter === "free") {
      matchesType = (v.price ?? 0) === 0;
    } else if (typeFilter === "review") {
      matchesType = v.isApproved === false;
    }

    return matchesKeyword && matchesSource && matchesPrivacy && matchesCategory && matchesType;
  });

  const limitNumber = parseInt(limitFilter, 10) || 50;
  const totalPages = Math.max(1, Math.ceil(filtered.length / limitNumber));
  const paginated = filtered.slice(
    (currentPage - 1) * limitNumber,
    currentPage * limitNumber
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length && paginated.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map((v) => v.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkSubmit = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one video");
      return;
    }

    if (
      !confirm(
        `Are you sure that you want to ${actionType} the selected ${selectedIds.length} video(s)?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      if (actionType === "delete") {
        const res = await bulkDeleteVideosAction(selectedIds);
        if (res.success) {
          setVideosList((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
          setSelectedIds([]);
        } else {
          alert(res.error || "Failed to delete videos");
        }
      } else {
        const approve = actionType === "approve";
        for (const id of selectedIds) {
          await toggleApproveVideoAction(id, approve);
        }
        setVideosList((prev) =>
          prev.map((v) =>
            selectedIds.includes(v.id) ? { ...v, isApproved: approve } : v
          )
        );
        setSelectedIds([]);
      }
    });
  };

  const handleSingleDelete = (id: number) => {
    startTransition(async () => {
      const res = await deleteVideoAction(id);
      if (res.success) {
        setVideosList((prev) => prev.filter((v) => v.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert(res.error || "Failed to delete video");
      }
    });
  };

  const handleToggleApprove = (id: number, currentApproved: boolean) => {
    startTransition(async () => {
      const res = await toggleApproveVideoAction(id, !currentApproved);
      if (res.success) {
        setVideosList((prev) =>
          prev.map((v) => (v.id === id ? { ...v, isApproved: !currentApproved } : v))
        );
      }
    });
  };

  const handleFakeViewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeModalVideoId) return;
    const viewsNum = parseInt(fakeViewsInput, 10) || 0;

    startTransition(async () => {
      const res = await addFakeViewsAction(fakeModalVideoId, viewsNum);
      if (res.success) {
        setVideosList((prev) =>
          prev.map((v) =>
            v.id === fakeModalVideoId ? { ...v, views: (v.views ?? 0) + viewsNum } : v
          )
        );
        setFakeSuccessMessage(true);
        setTimeout(() => {
          setFakeSuccessMessage(false);
          setFakeModalVideoId(null);
        }, 1500);
      }
    });
  };

  const getPrivacyLabel = (privacy: number | null) => {
    if (privacy === 1) return "Private";
    if (privacy === 2) return "Unlisted";
    return "Public";
  };

  const getSourceLabel = (type: string | null) => {
    if (type === "youtube") return "YouTube";
    if (type === "dailymotion") return "Dailymotion";
    if (type === "vimeo") return "Vimeo";
    return "Uploaded";
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Breadcrumb */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage Videos
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="text-[#04abf2] hover:underline">
            Admin Panel
          </Link>
          <span>/</span>
          <span>Videos</span>
          <span>/</span>
          <span className="text-neutral-700 dark:text-neutral-200">
            Manage Videos
          </span>
        </nav>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs">
        {/* Card Header matching screenshot */}
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide uppercase">
            Manage & Edit Videos
          </h6>
          <button
            onClick={() => {
              setSearch("");
              setSourceFilter("all");
              setLimitFilter("50");
              setPrivacyFilter("all");
              setCategoryFilter("0");
              setTypeFilter("all");
              setCurrentPage(1);
            }}
            className="px-6 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors cursor-pointer"
          >
            All
          </button>
        </div>

        {/* Filters and Search Bar matching Screenshot 1 */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Keyword */}
            <div className="md:col-span-4 space-y-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Keyword, ID, Title"
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>

            {/* Source */}
            <div className="md:col-span-2 space-y-1">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="all">All (Default)</option>
                <option value="uploaded">Uploaded</option>
                <option value="youtube">YouTube</option>
                <option value="dailymotion">Dailymotion</option>
                <option value="vimeo">Vimeo</option>
              </select>
            </div>

            {/* Limit Per Page */}
            <div className="md:col-span-2 space-y-1">
              <select
                value={limitFilter}
                onChange={(e) => {
                  setLimitFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50 (Default)</option>
                <option value="100">100</option>
                <option value="500">500</option>
              </select>
            </div>

            {/* Privacy */}
            <div className="md:col-span-2 space-y-1">
              <select
                value={privacyFilter}
                onChange={(e) => setPrivacyFilter(e.target.value)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="all">All Videos</option>
                <option value="0">Public</option>
                <option value="1">Private</option>
                <option value="2">Unlisted</option>
              </select>
            </div>

            {/* Category */}
            <div className="md:col-span-2 space-y-1">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="0">Category</option>
                {categoriesList.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="md:col-span-3 space-y-1">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="all">Paid & Free</option>
                <option value="paid">Paid Videos</option>
                <option value="free">Free Videos</option>
                <option value="review">Under Review</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <button
                onClick={() => setCurrentPage(1)}
                className="w-full py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Table matching Screenshot 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider bg-neutral-50/50 dark:bg-[#181a1d]/50">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === paginated.length && paginated.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-16 border-r border-neutral-200 dark:border-[#292d33]">
                  ID
                </th>
                <th className="py-3 px-4 border-r border-neutral-200 dark:border-[#292d33]">
                  VIDEO ID
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  TITLE
                </th>
                <th className="py-3 px-4 border-r border-neutral-200 dark:border-[#292d33]">
                  CATEGORY
                </th>
                <th className="py-3 px-4 border-r border-neutral-200 dark:border-[#292d33]">
                  SOURCE
                </th>
                <th className="py-3 px-4 border-r border-neutral-200 dark:border-[#292d33]">
                  PRIVACY
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  ADDED BY
                </th>
                <th className="py-3 px-6 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-neutral-500 dark:text-neutral-400 text-xs"
                  >
                    No videos found
                  </td>
                </tr>
              ) : (
                paginated.map((v) => {
                  const isChecked = selectedIds.includes(v.id);
                  const isApproved = v.isApproved !== false;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(v.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {v.id}
                      </td>
                      <td className="py-3 px-4 font-mono border-r border-neutral-200 dark:border-[#292d33]">
                        <Link
                          href={`/watch/${v.videoId}`}
                          target="_blank"
                          className="text-[#04abf2] hover:underline"
                        >
                          {v.videoId}
                        </Link>
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        <div className="flex items-center gap-2 max-w-[240px]">
                          {v.thumbnail && (
                            <img
                              src={v.thumbnail}
                              alt=""
                              className="w-10 h-6 object-cover rounded shrink-0 border border-neutral-200 dark:border-neutral-800"
                            />
                          )}
                          <span
                            className="font-medium text-neutral-800 dark:text-neutral-200 truncate"
                            title={v.title}
                          >
                            {v.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 border-r border-neutral-200 dark:border-[#292d33]">
                        {v.categoryId || "General"}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 border-r border-neutral-200 dark:border-[#292d33]">
                        {getSourceLabel(v.videoType)}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 border-r border-neutral-200 dark:border-[#292d33]">
                        {getPrivacyLabel(v.privacy)}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        <div className="flex items-center gap-2">
                          <img
                            src={v.user?.avatar || "/upload/photos/d-avatar.jpg"}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                            {v.user?.username || "Admin"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Approve / Disapprove Button */}
                          <button
                            onClick={() => handleToggleApprove(v.id, isApproved)}
                            className={`px-2.5 py-1 text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer ${
                              isApproved
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-emerald-500 hover:bg-emerald-600"
                            }`}
                          >
                            {isApproved ? (
                              <>
                                <X className="w-3.5 h-3.5" /> Disapprove
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" /> Approve
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <Link
                            href={`/edit-video/${v.id}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Link>

                          {/* Fake Views Button */}
                          <button
                            onClick={() => {
                              setFakeModalVideoId(v.id);
                              setFakeViewsInput("100");
                              setFakeLikesInput("10");
                            }}
                            className="px-2.5 py-1 bg-[#04abf2] hover:bg-[#0396d5] text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Fake views
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirmId(v.id)}
                            className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination & Bulk Action */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#292d33] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing {paginated.length > 0 ? (currentPage - 1) * limitNumber + 1 : 0} to{" "}
            {Math.min(currentPage * limitNumber, filtered.length)} of {filtered.length} entries
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>

        {/* Bulk Actions Form matching Screenshot 1 */}
        <div className="p-4 bg-neutral-50/50 dark:bg-[#181a1d]/40 border-t border-neutral-200 dark:border-[#292d33]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-neutral-600 dark:text-neutral-300 font-semibold">
              Action
            </span>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              className="bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
            >
              <option value="approve">Approve</option>
              <option value="disapprove">Disapprove</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkSubmit}
              disabled={selectedIds.length === 0 || isPending}
              className="px-5 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              {isPending ? "Submitting..." : `Submit (${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Fake Views & Likes Modal */}
      {fakeModalVideoId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
              <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
                Generate Fake Views And Likes
              </h5>
              <button
                onClick={() => setFakeModalVideoId(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFakeViewsSubmit} className="p-5 space-y-4">
              {fakeSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-xs font-medium">
                  Views and Likes are being generated, please check your site after few mins.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                  How many views you want to generate?
                </label>
                <input
                  type="number"
                  value={fakeViewsInput}
                  onChange={(e) => setFakeViewsInput(e.target.value)}
                  className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                  How many likes you want to generate?
                </label>
                <input
                  type="number"
                  value={fakeLikesInput}
                  onChange={(e) => setFakeLikesInput(e.target.value)}
                  className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFakeModalVideoId(null)}
                  className="px-4 py-2 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
                >
                  {isPending ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Video Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full shadow-2xl overflow-hidden p-5 space-y-4">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Video?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleSingleDelete(deleteConfirmId)}
                disabled={isPending}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

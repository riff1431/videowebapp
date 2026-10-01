"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  getAdminInvitationsAction,
  generateAdminInvitationAction,
  deleteAdminInvitationAction,
  deleteMultipleAdminInvitationsAction,
} from "@/modules/admin/tools.actions";
import type { AdminInvitationItem } from "@/modules/admin/tools.actions";
import {
  Search,
  Trash2,
  Calendar,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  AlertCircle,
  Copy,
  Check,
  Plus,
} from "lucide-react";

export default function ManageInvitationKeysPage() {
  const [invitations, setInvitations] = useState<AdminInvitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRange, setCurrentRange] = useState("All");
  const [sortOrder, setSortOrder] = useState<"DESC_i" | "ASC_i" | "DESC_t" | "ASC_t">("DESC_i");
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  // Modals & Action
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadData = async (query = searchQuery, range = currentRange, sort = sortOrder) => {
    setLoading(true);
    const res = await getAdminInvitationsAction({ query, range, sort });
    if (res.success && res.data) {
      setInvitations(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentRange, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateAdminInvitationAction();
      if (res.success && res.data) {
        setInvitations((prev) => [res.data!, ...prev]);
      }
    });
  };

  const handleCopy = (inv: AdminInvitationItem) => {
    const fullUrl = `${window.location.origin}${inv.inviteUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(invitations.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmSingleDelete = () => {
    if (!deleteModalId) return;
    startTransition(async () => {
      const res = await deleteAdminInvitationAction(deleteModalId);
      if (res.success) {
        setInvitations((prev) => prev.filter((i) => i.id !== deleteModalId));
        setSelectedIds((prev) => prev.filter((id) => id !== deleteModalId));
      }
      setDeleteModalId(null);
    });
  };

  const handleConfirmMultiDelete = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const res = await deleteMultipleAdminInvitationsAction(selectedIds);
      if (res.success) {
        setInvitations((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
        setSelectedIds([]);
      }
      setShowMultiDeleteModal(false);
    });
  };

  const toggleSortId = () => {
    setSortOrder((prev) => (prev === "DESC_i" ? "ASC_i" : "DESC_i"));
  };

  const toggleSortCreated = () => {
    setSortOrder((prev) => (prev === "DESC_t" ? "ASC_t" : "DESC_t"));
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Invitation Codes
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="hover:underline">Tools</span>
          <span className="text-neutral-400 dark:text-[#555a64]">&gt;</span>
          <span className="text-[#008DD1]">Invitation Codes</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs p-6 space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage Invitation Codes
          </h6>

          {/* Date Range Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="px-4 py-1.5 border border-neutral-300 dark:border-[#292d33] rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#1c1e22] hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 shadow-sm transition"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{currentRange}</span>
              <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
            </button>

            {isRangeOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded shadow-lg py-1 z-30">
                {["All", "Today", "Yesterday", "This Week", "This Month", "Last Month", "This Year"].map(
                  (range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setCurrentRange(range);
                        setIsRangeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition ${
                        currentRange === range
                          ? "bg-cyan-500 text-white font-medium"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {range}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Generate Button & Subtitle */}
        <div className="space-y-2">
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="px-5 py-2.5 bg-[#00adef] hover:bg-[#009bd6] text-white font-medium text-xs rounded shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isPending ? "Generating..." : "Generate New Code"}</span>
          </button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            This system is used to invite users to your site if the registration system is turned off.
          </p>
        </div>

        {/* Search Bar */}
        <div>
          <form onSubmit={handleSearchSubmit} className="flex items-end gap-3 max-w-lg">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Search for code
              </label>
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#1c1e22] border border-neutral-200 dark:border-[#292d33] rounded text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00adef] hover:bg-[#009bd6] text-white rounded font-medium text-sm transition shadow-sm shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="border border-neutral-200 dark:border-[#292d33] rounded overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-[#1c1e22]">
                <th className="p-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={invitations.length > 0 && selectedIds.length === invitations.length}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-cyan-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-20">
                  <button
                    onClick={toggleSortId}
                    className="flex items-center gap-1 hover:text-cyan-500 transition"
                  >
                    <span>ID</span>
                    {sortOrder === "ASC_i" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-500" />
                    ) : sortOrder === "DESC_i" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="p-3 w-36">
                  <button
                    onClick={toggleSortCreated}
                    className="flex items-center gap-1 hover:text-cyan-500 transition"
                  >
                    <span>CREATED</span>
                    {sortOrder === "ASC_t" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-500" />
                    ) : sortOrder === "DESC_t" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="p-3 min-w-[280px]">INVITATION CODE</th>
                <th className="p-3 w-28">STATUS</th>
                <th className="p-3 w-44 text-right pr-6">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 text-sm">
                    Loading invitation codes...
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 text-sm">
                    No Invitation Codes found
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-[#1e2025] transition text-neutral-700 dark:text-neutral-300"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inv.id)}
                        onChange={() => handleSelectOne(inv.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-cyan-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-neutral-500 dark:text-neutral-400 font-mono text-xs">
                      {inv.id}
                    </td>
                    <td className="p-3 text-neutral-500 dark:text-neutral-400 text-xs">
                      {inv.time}
                    </td>
                    <td className="p-3 font-mono text-xs text-neutral-900 dark:text-neutral-200">
                      {inv.code}
                    </td>
                    <td className="p-3">
                      {inv.status === 0 ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Invited
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs cursor-pointer"
                        >
                          {copiedId === inv.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteModalId(inv.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors shadow-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => setShowMultiDeleteModal(true)}
            disabled={selectedIds.length === 0 || isPending}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors shadow-xs ${
              selectedIds.length > 0
                ? "bg-[#00adef] hover:bg-[#009bd6] text-white cursor-pointer"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
            }`}
          >
            Delete Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
          </button>

          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Total {invitations.length} codes
          </span>
        </div>
      </div>

      {/* Single Delete Modal */}
      {deleteModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Delete Code?</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Are you sure you want to remove this Code?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#292d33] text-neutral-700 dark:text-neutral-300 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isPending}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium shadow-xs transition"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Delete Modal */}
      {showMultiDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Delete Selected Codes?</h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Are you sure that you want to remove the {selectedIds.length} selected Code(s)?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowMultiDeleteModal(false)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#292d33] text-neutral-700 dark:text-neutral-300 rounded text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmMultiDelete}
                disabled={isPending}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium shadow-xs transition"
              >
                {isPending ? "Please wait..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

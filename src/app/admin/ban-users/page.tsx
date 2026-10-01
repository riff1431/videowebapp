"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getBannedIpsAction,
  banIpAction,
  deleteBannedIpAction,
  deleteMultipleBannedIpsAction,
  type BannedIpItem,
} from "@/modules/admin/tools.actions";
import {
  Home,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const RANGE_OPTIONS = [
  "All",
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Last Month",
  "This Year",
];

export default function BanUsersPage() {
  const [bannedList, setBannedList] = useState<BannedIpItem[]>([]);
  const [ipInput, setIpInput] = useState("");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("All");
  const [sortField, setSortField] = useState("DESC_i");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [banning, setBanning] = useState(false);
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteMultipleModalOpen, setDeleteMultipleModalOpen] = useState(false);

  const fetchBannedIps = async (q = search, r = range, s = sortField) => {
    setLoading(true);
    try {
      const res = await getBannedIpsAction({ query: q, range: r, sort: s });
      if (res.success) {
        setBannedList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedIps();
  }, [range]);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipInput.trim()) {
      setNotice({ type: "error", text: "Please Check Your Details" });
      return;
    }

    setBanning(true);
    setNotice(null);
    try {
      const res = await banIpAction(ipInput);
      if (res.success) {
        setNotice({ type: "success", text: "IP / Email has been banned successfully" });
        setIpInput("");
        fetchBannedIps();
      } else {
        setNotice({ type: "error", text: res.message || "Failed to ban" });
      }
    } catch (err: any) {
      setNotice({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setBanning(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBannedIps(search, range, sortField);
  };

  const handleSort = (field: "id" | "time" | "ip") => {
    let next = "DESC_i";
    if (field === "id") next = sortField === "DESC_i" ? "ASC_i" : "DESC_i";
    else if (field === "time") next = sortField === "DESC_t" ? "ASC_t" : "DESC_t";
    else if (field === "ip") next = sortField === "DESC_ip" ? "ASC_ip" : "DESC_ip";

    setSortField(next);
    fetchBannedIps(search, range, next);
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(bannedList.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckItem = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteBannedIpAction(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchBannedIps();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deleteMultipleBannedIpsAction(selectedIds);
      setDeleteMultipleModalOpen(false);
      setSelectedIds([]);
      fetchBannedIps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Ban Users
        </h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          <Link href="/admin" className="hover:text-cyan-500 flex items-center gap-1">
            <Home className="w-4 h-4" />
            Admin Panel
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-700 dark:text-neutral-200 font-medium">Ban Users</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#22252a] rounded-lg shadow-sm border border-neutral-200 dark:border-[#292d33] p-6 space-y-6">
        {/* Card Header & Range Picker */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            Manage & Edit Banned Users
          </h2>

          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="px-4 py-1.5 border border-neutral-300 dark:border-[#292d33] rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#1c1e22] hover:bg-neutral-50 dark:hover:bg-neutral-800 flex items-center gap-2 shadow-sm transition"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>{range}</span>
            </button>

            {rangeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded shadow-lg py-1 z-30">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setRange(opt);
                      setRangeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition ${
                      range === opt
                        ? "bg-cyan-500 text-white font-medium"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            className={`p-3 rounded text-sm flex items-center gap-2 ${
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

        {/* Top Forms: Ban Form (Left) & Search Form (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          {/* Ban IP / Email Form */}
          <form onSubmit={handleBan} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                IP Address , E-mail range
              </label>
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#1c1e22] border border-neutral-200 dark:border-[#292d33] rounded text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={banning}
              className="px-5 py-2 bg-[#00adef] hover:bg-[#009bd6] text-white rounded font-medium text-sm transition shadow-sm shrink-0"
            >
              {banning ? "Banning..." : "Ban"}
            </button>
          </form>

          {/* Search keyword Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Search for keyword
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder=""
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
                    checked={
                      bannedList.length > 0 && selectedIds.length === bannedList.length
                    }
                    onChange={handleCheckAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-cyan-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-24">
                  <button
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-1.5 hover:text-cyan-500 transition"
                  >
                    <span>ID</span>
                    {sortField === "ASC_i" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-500" />
                    ) : sortField === "DESC_i" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("time")}
                    className="flex items-center gap-1.5 hover:text-cyan-500 transition"
                  >
                    <span>BANNED</span>
                    {sortField === "ASC_t" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-500" />
                    ) : sortField === "DESC_t" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="p-3">
                  <button
                    onClick={() => handleSort("ip")}
                    className="flex items-center gap-1.5 hover:text-cyan-500 transition"
                  >
                    <span>VALUE</span>
                    {sortField === "ASC_ip" ? (
                      <ArrowUp className="w-3.5 h-3.5 text-cyan-500" />
                    ) : sortField === "DESC_ip" ? (
                      <ArrowDown className="w-3.5 h-3.5 text-cyan-500" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="p-3 w-32">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 text-sm">
                    Loading banned users...
                  </td>
                </tr>
              ) : bannedList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 text-sm">
                    No banned users found
                  </td>
                </tr>
              ) : (
                bannedList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-[#1e2025] transition text-neutral-700 dark:text-neutral-300"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheckItem(item.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-cyan-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 text-neutral-500 dark:text-neutral-400 font-mono text-xs">
                      {item.id}
                    </td>
                    <td className="p-3 text-neutral-500 dark:text-neutral-400 text-xs">
                      {item.time}
                    </td>
                    <td className="p-3 font-medium text-neutral-800 dark:text-neutral-200">
                      {item.ipAddress}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setItemToDelete(item.id);
                          setDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setDeleteMultipleModalOpen(true)}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-[#00adef] hover:bg-[#009bd6] text-white rounded text-xs font-medium transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Delete Single Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Unban IP / User</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to remove this IP from the ban list?
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Selected Modal */}
      {deleteMultipleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Delete Selected</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to remove all selected {selectedIds.length} banned records?
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteMultipleModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={confirmDeleteSelected}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

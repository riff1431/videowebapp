"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { bulkUserAction, deleteSingleUserAction } from "@/modules/admin/users.actions";
import {
  AdminDateRangePicker,
  DateRangeOption,
  filterByDateRange,
} from "@/components/admin/AdminDateRangePicker";

export interface AdminUserItem {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  active: boolean | null;
  isPro: boolean | null;
  ipAddress: string | null;
  createdAt?: Date;
}

interface ManageUsersClientProps {
  initialUsers: AdminUserItem[];
  onlineCount: number;
}

export function ManageUsersClient({ initialUsers, onlineCount }: ManageUsersClientProps) {
  const [usersList, setUsersList] = useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeOption>("All");
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>();
  const [memberFilter, setMemberFilter] = useState<"all" | "free" | "pro">("all");
  const [onlineFilter, setOnlineFilter] = useState<"all" | "online" | "offline">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"activate" | "deactivate" | "delete">("activate");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [, startTransition] = useTransition();

  // Filtered users
  const dateFiltered = filterByDateRange(usersList, dateRange, customRange);

  const filtered = dateFiltered.filter((u) => {
    const matchesSearch =
      u.id.toString().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesMember =
      memberFilter === "all" ||
      (memberFilter === "free" && !u.isPro) ||
      (memberFilter === "pro" && u.isPro);

    // Online status mock / simulated
    const isOnline = u.id === 1; // Simulated active session
    const matchesOnline =
      onlineFilter === "all" ||
      (onlineFilter === "online" && isOnline) ||
      (onlineFilter === "offline" && !isOnline);

    return matchesSearch && matchesMember && matchesOnline;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkSubmit = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one user");
      return;
    }

    if (
      confirm(
        `Are you sure you want to ${bulkAction} ${selectedIds.length} selected user(s)?`
      )
    ) {
      startTransition(async () => {
        const res = await bulkUserAction(selectedIds, bulkAction);
        if (res.success) {
          if (bulkAction === "delete") {
            setUsersList((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
          } else {
            const newActive = bulkAction === "activate";
            setUsersList((prev) =>
              prev.map((u) =>
                selectedIds.includes(u.id) ? { ...u, active: newActive } : u
              )
            );
          }
          setSelectedIds([]);
        } else {
          alert(res.error || "Action failed");
        }
      });
    }
  };

  const handleDeleteOne = (id: number, username: string) => {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
      startTransition(async () => {
        const res = await deleteSingleUserAction(id);
        if (res.success) {
          setUsersList((prev) => prev.filter((u) => u.id !== id));
          setSelectedIds((prev) => prev.filter((i) => i !== id));
        } else {
          alert(res.error || "Failed to delete user");
        }
      });
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot 1 */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Users
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Users</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage Users</span>
        </nav>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        {/* Card Header with All Date Range Button */}
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage & Edit Users ({onlineCount} Online Users)
          </h6>
          <AdminDateRangePicker
            value={dateRange}
            onChange={(val, custom) => {
              setDateRange(val);
              setCustomRange(custom);
            }}
          />
        </div>

        {/* Filters and Search Bar matching Screenshot 1/2 */}
        <div className="p-5 pb-4 space-y-2">
          <label className="text-xs text-neutral-700 dark:text-[#ced4da] font-medium block">
            Search for ID, Keyword, E-mail, Username, First Name, Last Name
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder=""
              className="flex-1 min-w-[240px] bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />

            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value as any)}
              className="w-48 bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
            >
              <option value="all">All Members</option>
              <option value="free">Free Members</option>
              <option value="pro">Pro Members</option>
            </select>

            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value as any)}
              className="w-36 bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
            >
              <option value="all">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <button
              onClick={() => setCurrentPage(1)}
              className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-y border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-16 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>ID</span>
                    <span className="text-[10px]">▲</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>USERNAME</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>E-MAIL</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  IP ADDRESS
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>STATUS</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 text-center w-40">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  const isActive = user.active !== false;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2226] transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(user.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {user.id}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar || "/upload/photos/d-avatar.jpg"}
                            alt={user.username}
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-[#2f343b]"
                          />
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {user.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-neutral-700 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {user.email}
                      </td>
                      <td className="py-3 px-6 text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33] font-mono text-[11px]">
                        {user.ipAddress || "172.18.0.1"}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        <span className={isActive ? "text-neutral-800 dark:text-white" : "text-red-500"}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/manage-users?edit=${user.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <span>🖊</span>
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteOne(user.id, user.username)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <span>🗑</span>
                            <span>Delete</span>
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
      </div>

      {/* Bottom Action Section and Pagination matching Screenshot 1/3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs text-neutral-700 dark:text-[#ced4da]">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </div>
          <div className="space-y-1">
            <span className="text-xs text-neutral-700 dark:text-[#ced4da] block">Action</span>
            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as any)}
                className="w-44 bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button
                type="button"
                onClick={handleBulkSubmit}
                className="px-6 py-2 bg-[#4cc3f5] hover:bg-[#38b7ed] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1 self-start sm:self-center">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 border border-neutral-200 dark:border-[#2f343b] rounded text-neutral-600 dark:text-neutral-400 text-xs hover:bg-neutral-100 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="w-7 h-7 bg-[#04abf2] text-white rounded-full text-xs font-bold flex items-center justify-center">
            {currentPage}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 border border-neutral-200 dark:border-[#2f343b] rounded text-neutral-600 dark:text-neutral-400 text-xs hover:bg-neutral-100 dark:hover:bg-[#181a1d] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

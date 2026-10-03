"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { bulkVerificationRequestAction } from "@/modules/admin/users.actions";

export interface VerificationRequestItem {
  id: number;
  username: string;
  avatar: string | null;
  status: string;
  createdAt: string;
}

interface ManageVerificationRequestsClientProps {
  initialRequests: VerificationRequestItem[];
}

export function ManageVerificationRequestsClient({
  initialRequests,
}: ManageVerificationRequestsClientProps) {
  const [requests, setRequests] = useState<VerificationRequestItem[]>(initialRequests);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [action, setAction] = useState<"verify" | "delete">("verify");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const paginatedRequests = requests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one request");
      return;
    }

    if (
      confirm(
        `Are you sure you want to ${action.toUpperCase()} ${selectedIds.length} request(s)?`
      )
    ) {
      startTransition(async () => {
        const res = await bulkVerificationRequestAction(selectedIds, action);
        if (res.success) {
          if (action === "delete") {
            setRequests((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
          } else {
            setRequests((prev) =>
              prev.map((r) =>
                selectedIds.includes(r.id) ? { ...r, status: "verified" } : r
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

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Verification Reqeusts
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
          <span className="text-neutral-500 dark:text-gray-400">Manage Verification Reqeusts</span>
        </nav>
      </div>

      {/* Main Table Card matching Screenshot */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage Verification Requests
          </h6>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === requests.length && requests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-20 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>ID</span>
                    <span className="text-[10px]">▲</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  USERNAME
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>REQUESTED</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  STATUS
                </th>
                <th className="py-3 px-6 text-center w-36">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No verification requests found.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req) => {
                  const isSelected = selectedIds.includes(req.id);
                  return (
                    <tr key={req.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2226] transition-colors">
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(req.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {req.id}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                        <div className="flex items-center gap-2">
                          <img
                            src={req.avatar || "/upload/photos/d-avatar.jpg"}
                            alt={req.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {req.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {req.createdAt}
                      </td>
                      <td className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33] capitalize">
                        <span className={req.status === "verified" ? "text-emerald-500 font-medium" : "text-neutral-700 dark:text-[#ced4da]"}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Delete this verification request?")) {
                              startTransition(async () => {
                                await bulkVerificationRequestAction([req.id], "delete");
                                setRequests((prev) => prev.filter((r) => r.id !== req.id));
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded text-[11px] font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Action Section and Pagination matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs text-neutral-700 dark:text-[#ced4da]">
            Showing {requests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, requests.length)} of {requests.length} entries
          </div>
          <div className="space-y-1">
            <span className="text-xs text-neutral-700 dark:text-[#ced4da] block">Action</span>
            <div className="flex items-center gap-2">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-44 bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2] cursor-pointer"
              >
                <option value="verify">VERIFY</option>
                <option value="delete">Delete</option>
              </select>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#4cc3f5] hover:bg-[#38b7ed] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Pagination */}
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

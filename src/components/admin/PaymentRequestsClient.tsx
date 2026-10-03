"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ListFilter, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { processPaymentRequestsAction } from "@/modules/admin/payment-requests.actions";

interface PaymentRequestRow {
  id: number;
  userId: number;
  userName: string;
  paypalEmail: string;
  amount: number;
  currency: string;
  status: number; // 0: pending, 1: paid, 2: declined
  requested: string;
}

interface PaymentRequestsClientProps {
  initialRequests: PaymentRequestRow[];
}

export function PaymentRequestsClient({ initialRequests }: PaymentRequestsClientProps) {
  const [requests, setRequests] = useState<PaymentRequestRow[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchAction, setBatchAction] = useState<"Paid" | "Declined" | "Delete">("Paid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [, startTransition] = useTransition();

  const totalCount = requests.length;
  const paidCount = requests.filter((r) => r.status === 1).length;
  const declinedCount = requests.filter((r) => r.status === 2).length;
  const pendingCount = requests.filter((r) => r.status === 0).length;

  const filtered = requests.filter((r) =>
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.paypalEmail.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      alert("Please select at least one payment request.");
      return;
    }

    startTransition(async () => {
      await processPaymentRequestsAction(selectedIds, batchAction);
      if (batchAction === "Delete") {
        setRequests((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      } else {
        const nextStatus = batchAction === "Paid" ? 1 : 2;
        setRequests((prev) =>
          prev.map((r) =>
            selectedIds.includes(r.id) ? { ...r, status: nextStatus } : r
          )
        );
      }
      setSelectedIds([]);
    });
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Payment Requests
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Advertisement</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Payment Requests</span>
        </nav>
      </div>

      {/* 4 Metric Cards matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-[#04abf2] flex items-center justify-center text-xl font-bold">
            <ListFilter className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              TOTAL REQUESTS
            </p>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{totalCount}</h4>
          </div>
        </div>

        {/* Paid Requests */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              PAID REQUESTS
            </p>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{paidCount}</h4>
          </div>
        </div>

        {/* Declined Requests */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              DECLINED REQUESTS
            </p>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{declinedCount}</h4>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center text-xl font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              PENDING REQUESTS
            </p>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mt-0.5">{pendingCount}</h4>
          </div>
        </div>
      </div>

      {/* Main Table Card matching Screenshot */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage Payment Requests
          </h6>
          <span className="px-4 py-1.5 border border-neutral-200 dark:border-[#292d33] rounded text-xs text-neutral-600 dark:text-neutral-300 font-medium">
            All
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-5 pb-3">
          <label className="text-xs text-neutral-700 dark:text-[#ced4da] block mb-1.5 font-medium">
            Search for Keyword
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
            />
            <button
              onClick={() => setCurrentPage(1)}
              className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>

        {/* Yellow Notice Banner */}
        <div className="mx-5 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 rounded text-xs">
          Payments are made from your paypal account, after the payment is made, mark the request as paid.
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-5 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">ID <span>↑</span></span>
                </th>
                <th className="py-3 px-4">USERNAME</th>
                <th className="py-3 px-4">PAYPAL E-MAIL</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">AMOUNT <span>↓</span></span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">REQUESTED <span>↓</span></span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">STATUS <span>↓</span></span>
                </th>
                <th className="py-3 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-xs text-neutral-400 dark:text-[#8c96a3]">
                    No payment requests found
                  </td>
                </tr>
              ) : (
                filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors">
                    <td className="py-3.5 px-5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(req.id)}
                        onChange={() => toggleSelectOne(req.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                      {req.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">
                      {req.userName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                      {req.paypalEmail || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      ${req.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      {req.requested}
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Pending
                        </span>
                      )}
                      {req.status === 1 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Paid
                        </span>
                      )}
                      {req.status === 2 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {req.status === 0 ? "Review Required" : "Processed"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions matching Screenshot */}
        <div className="p-5 border-t border-neutral-200 dark:border-[#292d33] flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleActionSubmit} className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Action
              </span>
              <select
                value={batchAction}
                onChange={(e) => setBatchAction(e.target.value as any)}
                className="bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-hidden focus:border-[#04abf2] min-w-[130px]"
              >
                <option value="Paid">Paid</option>
                <option value="Declined">Declined</option>
                <option value="Delete">Delete</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-5 px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              Submit
            </button>
          </form>

          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-[#8c96a3]">
            <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} className="px-2 py-1 rounded border border-neutral-200 dark:border-[#292d33] hover:bg-neutral-100 dark:hover:bg-[#181a1d] ml-2 disabled:opacity-40 disabled:cursor-not-allowed">
              &lsaquo;
            </button>
            <span className="px-2.5 py-1 rounded bg-[#04abf2] text-white font-semibold">
              {currentPage} / {Math.max(1, Math.ceil(filtered.length / pageSize))}
            </span>
            <button disabled={currentPage >= Math.ceil(filtered.length / pageSize)} onClick={() => setCurrentPage((p) => p + 1)} className="px-2 py-1 rounded border border-neutral-200 dark:border-[#292d33] hover:bg-neutral-100 dark:hover:bg-[#181a1d] disabled:opacity-40 disabled:cursor-not-allowed">
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

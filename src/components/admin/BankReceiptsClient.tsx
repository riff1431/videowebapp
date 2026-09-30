"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { Check, X, Trash2, ExternalLink } from "lucide-react";
import {
  approveBankReceiptAction,
  declineBankReceiptAction,
  deleteBankReceiptAction,
} from "@/modules/admin/bank-receipts.actions";

interface BankReceiptItem {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  receiptImg: string;
  price: number;
  mode: string;
  status: number; // 0: pending, 1: approved, 2: disapproved
  createdAt: string;
}

interface BankReceiptsClientProps {
  receipts: BankReceiptItem[];
  approvedCount: number;
  disapprovedCount: number;
}

export function BankReceiptsClient({
  receipts,
  approvedCount,
  disapprovedCount,
}: BankReceiptsClientProps) {
  const [, startTransition] = useTransition();

  const handleApprove = (id: number) => {
    startTransition(async () => {
      await approveBankReceiptAction(id);
    });
  };

  const handleDecline = (id: number) => {
    startTransition(async () => {
      await declineBankReceiptAction(id);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      startTransition(async () => {
        await deleteBankReceiptAction(id);
      });
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full max-w-full font-sans antialiased">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Bank Receipts
        </h3>
        <nav className="flex items-center gap-1.5 text-xs text-[#008DD1] mt-1">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span>Admin Panel</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-[#008DD1]">Payments &amp; Ads</span>
          <span className="text-gray-400 dark:text-gray-500">&gt;</span>
          <span className="text-neutral-500 dark:text-gray-400">Manage Bank Receipts</span>
        </nav>
      </div>

      {/* Top 2 Metric Cards matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Approved receipts card */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v16H4V4zm2 4v8h12V8H6zm6 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white">{approvedCount}</h4>
            <p className="text-xs text-neutral-500 dark:text-[#8c96a3] mt-0.5">Approved receipts</p>
          </div>
        </div>

        {/* Disapproved receipts card */}
        <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-5 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-rose-100 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center text-2xl font-bold">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white">{disapprovedCount}</h4>
            <p className="text-xs text-neutral-500 dark:text-[#8c96a3] mt-0.5">Disapproved receipts</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
            Manage bank receipts
          </h6>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-5">USER</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">PRICE</th>
                <th className="py-3 px-4">CREATED</th>
                <th className="py-3 px-4">RECEIPT</th>
                <th className="py-3 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#2a2e36]">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-neutral-400 dark:text-[#8c96a3]">
                    No data available in table
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors">
                    <td className="py-3.5 px-5 flex items-center gap-2">
                      <img
                        src={r.userAvatar}
                        alt={r.userName}
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                      <span className="font-semibold text-neutral-800 dark:text-white">{r.userName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-600 dark:text-neutral-300 capitalize">
                      {r.mode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      ${r.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={r.receiptImg}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#04abf2] hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {r.status === 0 && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              title="Approve"
                              className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDecline(r.id)}
                              title="Decline"
                              className="p-1 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {r.status === 1 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Approved
                          </span>
                        )}
                        {r.status === 2 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            Disapproved
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete"
                          className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination bar matching Screenshot */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#292d33] flex items-center justify-between text-xs text-neutral-500 dark:text-[#8c96a3]">
          <span>Showing 1 out of 1</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-neutral-200 dark:border-[#292d33] hover:bg-neutral-100 dark:hover:bg-[#181a1d]">
              &lsaquo;
            </button>
            <button className="px-2.5 py-1 rounded bg-[#04abf2] text-white font-semibold">
              1
            </button>
            <button className="px-2 py-1 rounded border border-neutral-200 dark:border-[#292d33] hover:bg-neutral-100 dark:hover:bg-[#181a1d]">
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

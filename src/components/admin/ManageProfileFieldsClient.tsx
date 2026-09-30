"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { deleteCustomProfileFieldsAction } from "@/modules/admin/users.actions";

export interface CustomFieldItem {
  id: number;
  fieldName: string;
  fieldType: string;
  fieldLength: number;
  placement: string;
}

interface ManageProfileFieldsClientProps {
  initialFields: CustomFieldItem[];
}

export function ManageProfileFieldsClient({ initialFields }: ManageProfileFieldsClientProps) {
  const [fields, setFields] = useState<CustomFieldItem[]>(initialFields);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [, startTransition] = useTransition();

  const toggleSelectAll = () => {
    if (selectedIds.length === fields.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(fields.map((f) => f.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} field(s)?`)) {
      startTransition(async () => {
        const res = await deleteCustomProfileFieldsAction(selectedIds);
        if (res.success) {
          setFields((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
          setSelectedIds([]);
        } else {
          alert(res.error || "Failed to delete custom field(s)");
        }
      });
    }
  };

  return (
    <div className="space-y-6 text-neutral-800 dark:text-[#adb5bd] w-full font-sans antialiased">
      {/* Breadcrumb Header matching Screenshot 1 */}
      <div>
        <h3 className="text-[22px] font-semibold text-neutral-900 dark:text-white tracking-tight">
          Manage Custom Profile Fields
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
          <span className="text-neutral-500 dark:text-gray-400">Manage Custom Profile Fields</span>
        </nav>
      </div>

      {/* Main Table Card matching Screenshot 1 */}
      <div className="bg-white dark:bg-[#22252a] border border-neutral-200 dark:border-[#292d33] rounded-lg p-6 shadow-xs space-y-5">
        <h6 className="text-[15px] font-bold text-neutral-900 dark:text-white">
          Manage & Edit Custom Profile Fields
        </h6>

        <div>
          <Link
            href="/admin/manage-profile-fields/create"
            className="inline-flex items-center px-5 py-2.5 bg-[#2bbcd4] hover:bg-[#25a9bf] text-white text-xs font-semibold rounded shadow-xs transition-colors"
          >
            Create New Custom Field
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-neutral-200 dark:border-[#292d33] rounded">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-white dark:bg-[#22252a] border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === fields.length && fields.length > 0}
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
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>FIELD NAME</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>TYPE</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>LENGTH</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>PLACEMENT</span>
                    <span className="text-[10px]">▼</span>
                  </div>
                </th>
                <th className="py-3 px-6 text-center w-32">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                    No custom profile fields created yet.
                  </td>
                </tr>
              ) : (
                fields.map((f) => {
                  const isSelected = selectedIds.includes(f.id);
                  return (
                    <tr key={f.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2226] transition-colors">
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(f.id)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {f.id}
                      </td>
                      <td className="py-3 px-6 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {f.fieldName}
                      </td>
                      <td className="py-3 px-6 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33] capitalize">
                        {f.fieldType}
                      </td>
                      <td className="py-3 px-6 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33]">
                        {f.fieldLength}
                      </td>
                      <td className="py-3 px-6 text-neutral-800 dark:text-[#ced4da] border-r border-neutral-200 dark:border-[#292d33] capitalize">
                        {f.placement}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete field ${f.fieldName}?`)) {
                              startTransition(async () => {
                                await deleteCustomProfileFieldsAction([f.id]);
                                setFields((prev) => prev.filter((item) => item.id !== f.id));
                              });
                            }
                          }}
                          className="px-2 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 rounded text-[11px] font-medium transition-colors"
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

        {/* Delete Selected Button matching Screenshot 1 */}
        <div>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="px-5 py-2 bg-[#4cc3f5] hover:bg-[#38b7ed] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
}

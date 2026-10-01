"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  addSubCategoryAction,
  updateSubCategoryAction,
  deleteSubCategoryAction,
  bulkDeleteSubCategoriesAction,
} from "@/modules/admin/categories.actions";
import { Edit, Trash2, Home, Check, AlertCircle, ChevronDown } from "lucide-react";

export interface CategoryParentOption {
  key: string;
  name: string;
}

export interface SubCategoryItem {
  id: number;
  categoryKey: string;
  key: string;
  name: string;
  translations: Record<string, string>;
}

interface ManageSubCategoriesClientProps {
  parentCategories: CategoryParentOption[];
  initialSubCategories: SubCategoryItem[];
  availableLanguages: string[];
}

export function ManageSubCategoriesClient({
  parentCategories,
  initialSubCategories,
  availableLanguages,
}: ManageSubCategoriesClientProps) {
  const [selectedParentKey, setSelectedParentKey] = useState<string>(
    parentCategories.length > 0 ? parentCategories[0].key : "film_animation"
  );
  const [filterParentKey, setFilterParentKey] = useState<string>(
    parentCategories.length > 0 ? parentCategories[0].key : "film_animation"
  );
  const [activeFilterKey, setActiveFilterKey] = useState<string>(
    parentCategories.length > 0 ? parentCategories[0].key : "film_animation"
  );

  const [subCategoriesList, setSubCategoriesList] = useState<SubCategoryItem[]>(
    initialSubCategories
  );
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [addForm, setAddForm] = useState<Record<string, string>>({});
  const [editItem, setEditItem] = useState<SubCategoryItem | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter subcategories by active selected parent category
  const filtered = subCategoriesList.filter((s) => s.categoryKey === activeFilterKey);

  const toggleSelectAll = () => {
    if (selectedKeys.length === filtered.length && filtered.length > 0) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filtered.map((s) => s.key));
    }
  };

  const toggleSelectOne = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm["english"]?.trim()) {
      setAlertMsg({ type: "error", text: "English sub category name is required" });
      return;
    }

    startTransition(async () => {
      const res = await addSubCategoryAction(selectedParentKey, addForm);
      if (res.success) {
        const englishName = addForm["english"].trim();
        const key =
          englishName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") || `sub_${Date.now()}`;

        setSubCategoriesList((prev) => [
          ...prev,
          {
            id: Date.now(),
            categoryKey: selectedParentKey,
            key,
            name: englishName,
            translations: { ...addForm },
          },
        ]);
        setAddForm({});
        setAlertMsg({ type: "success", text: "Sub Category added successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to add sub category" });
      }
    });
  };

  const handleEditOpen = (item: SubCategoryItem) => {
    setEditItem(item);
    const initialValues: Record<string, string> = { ...item.translations };
    if (!initialValues["english"]) {
      initialValues["english"] = item.name;
    }
    setEditForm(initialValues);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    if (!editForm["english"]?.trim()) {
      alert("English sub category name is required");
      return;
    }

    startTransition(async () => {
      const res = await updateSubCategoryAction(editItem.key, editForm);
      if (res.success) {
        const newName = editForm["english"].trim();
        setSubCategoriesList((prev) =>
          prev.map((s) =>
            s.key === editItem.key
              ? {
                  ...s,
                  name: newName,
                  translations: { ...editForm },
                }
              : s
          )
        );
        setEditItem(null);
        setAlertMsg({ type: "success", text: "Sub Category updated successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert(res.error || "Failed to update sub category");
      }
    });
  };

  const handleDeleteOne = (key: string) => {
    startTransition(async () => {
      const res = await deleteSubCategoryAction(key);
      if (res.success) {
        setSubCategoriesList((prev) => prev.filter((s) => s.key !== key));
        setSelectedKeys((prev) => prev.filter((k) => k !== key));
        setDeleteConfirmKey(null);
        setAlertMsg({ type: "success", text: "Sub Category deleted successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert(res.error || "Failed to delete sub category");
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedKeys.length === 0) return;
    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = () => {
    startTransition(async () => {
      const res = await bulkDeleteSubCategoriesAction(selectedKeys);
      if (res.success) {
        setSubCategoriesList((prev) => prev.filter((s) => !selectedKeys.includes(s.key)));
        setSelectedKeys([]);
        setShowBulkDeleteModal(false);
        setAlertMsg({ type: "success", text: "Selected sub categories deleted successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert(res.error || "Failed to delete sub categories");
      }
    });
  };

  const handleShowFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilterKey(filterParentKey);
    setSelectedKeys([]);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb matching Screenshot 4 */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage sub Categories
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span className="hover:underline">Category</span>
          <span>&gt;</span>
          <span className="text-[#04abf2] font-semibold">
            Manage sub Categories
          </span>
        </nav>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded text-xs font-medium flex items-center gap-2 ${
            alertMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
              : "bg-red-500/10 border border-red-500/20 text-red-500"
          }`}
        >
          {alertMsg.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* 1. Add Sub Category Card matching Screenshot 4 */}
      <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-wide">
            Add Sub Category
          </h6>
        </div>

        <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Category Dropdown Selector */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedParentKey}
                  onChange={(e) => setSelectedParentKey(e.target.value)}
                  className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2] appearance-none cursor-pointer"
                >
                  {parentCategories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Language inputs */}
            {availableLanguages.map((lang) => {
              const langKey = lang.toLowerCase();
              return (
                <div key={langKey} className="space-y-1">
                  <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                    {lang}
                  </label>
                  <input
                    type="text"
                    value={addForm[langKey] || ""}
                    onChange={(e) =>
                      setAddForm({ ...addForm, [langKey]: e.target.value })
                    }
                    className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2] transition-colors"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Manage Sub Categories Card matching Screenshot 4 */}
      <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-wide">
            Manage Sub Categories
          </h6>
        </div>

        {/* Category Filter selector and Show Button */}
        <div className="p-5 pb-4">
          <form onSubmit={handleShowFilter} className="flex flex-wrap items-center gap-3 max-w-md">
            <div className="relative flex-1 min-w-[180px]">
              <select
                value={filterParentKey}
                onChange={(e) => setFilterParentKey(e.target.value)}
                className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2] appearance-none cursor-pointer"
              >
                {parentCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-6 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Show
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-t border-neutral-200 dark:border-[#292d33]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider bg-neutral-50/50 dark:bg-[#181a1d]/50">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={
                      selectedKeys.length === filtered.length && filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 accent-[#04abf2] rounded cursor-pointer"
                  />
                </th>
                <th className="py-3 px-6 w-32 border-r border-neutral-200 dark:border-[#292d33]">
                  ID
                </th>
                <th className="py-3 px-6 border-r border-neutral-200 dark:border-[#292d33]">
                  SUB CATEGORY NAME
                </th>
                <th className="py-3 px-6 text-center w-48">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-[#292d33]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-neutral-500 dark:text-neutral-400 text-xs"
                  >
                    No sub categories found for this category
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isChecked = selectedKeys.includes(item.key);

                  return (
                    <tr
                      key={item.key}
                      className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2227]/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(item.key)}
                          className="w-3.5 h-3.5 accent-[#04abf2] rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-6 text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {item.key}
                      </td>
                      <td className="py-3 px-6 font-medium text-neutral-800 dark:text-neutral-200 border-r border-neutral-200 dark:border-[#292d33]">
                        {item.name}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEditOpen(item)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmKey(item.key)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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

        {/* Bulk Delete Button matching Screenshot 4 */}
        <div className="p-4 bg-neutral-50/50 dark:bg-[#181a1d]/40 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            type="button"
            disabled={selectedKeys.length === 0 || isPending}
            onClick={handleBulkDelete}
            className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] disabled:opacity-50 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* Edit Sub Category Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-2xl w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Edit Sub Category: {editItem.name}
            </h5>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableLanguages.map((lang) => {
                  const langKey = lang.toLowerCase();
                  return (
                    <div key={langKey} className="space-y-1">
                      <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
                        {lang}
                      </label>
                      <input
                        type="text"
                        value={editForm[langKey] || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, [langKey]: e.target.value })
                        }
                        className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-[#292d33]">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Sub Category?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this sub Category?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmKey(null)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDeleteOne(deleteConfirmKey)}
                className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Sub Category?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure that you want to remove the selected sub Category(s)?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-1.5 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={executeBulkDelete}
                className="px-4 py-1.5 bg-[#04abf2] hover:bg-[#0396d5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
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

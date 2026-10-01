"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  addCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  bulkDeleteCategoriesAction,
} from "@/modules/admin/categories.actions";
import { Edit, Trash2, Home, Check, AlertCircle } from "lucide-react";

export interface CategoryItem {
  id: number;
  key: string;
  name: string;
  translations: Record<string, string>;
}

interface ManageCategoriesClientProps {
  initialCategories: CategoryItem[];
  availableLanguages: string[];
}

export function ManageCategoriesClient({
  initialCategories,
  availableLanguages,
}: ManageCategoriesClientProps) {
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(initialCategories);
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [addForm, setAddForm] = useState<Record<string, string>>({});
  const [editCategory, setEditCategory] = useState<CategoryItem | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = categoriesList.filter((c) => {
    if (!activeQuery.trim()) return true;
    const q = activeQuery.toLowerCase();
    const matchesKeyOrName = c.key.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    const matchesTranslations = Object.values(c.translations || {}).some((val) =>
      val.toLowerCase().includes(q)
    );
    return matchesKeyOrName || matchesTranslations;
  });

  const toggleSelectAll = () => {
    if (selectedKeys.length === filtered.length && filtered.length > 0) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(filtered.map((c) => c.key));
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
      setAlertMsg({ type: "error", text: "English category name is required" });
      return;
    }

    startTransition(async () => {
      const res = await addCategoryAction(addForm);
      if (res.success) {
        const englishName = addForm["english"].trim();
        const key =
          englishName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") || `cat_${Date.now()}`;

        setCategoriesList((prev) => [
          ...prev,
          {
            id: Date.now(),
            key,
            name: englishName,
            translations: { ...addForm },
          },
        ]);
        setAddForm({});
        setAlertMsg({ type: "success", text: "Category added successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        setAlertMsg({ type: "error", text: res.error || "Failed to add category" });
      }
    });
  };

  const handleEditOpen = (cat: CategoryItem) => {
    setEditCategory(cat);
    const initialValues: Record<string, string> = { ...cat.translations };
    if (!initialValues["english"]) {
      initialValues["english"] = cat.name;
    }
    setEditForm(initialValues);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    if (!editForm["english"]?.trim()) {
      alert("English category name is required");
      return;
    }

    startTransition(async () => {
      const res = await updateCategoryAction(editCategory.key, editForm);
      if (res.success) {
        const newName = editForm["english"].trim();
        setCategoriesList((prev) =>
          prev.map((c) =>
            c.key === editCategory.key
              ? {
                  ...c,
                  name: newName,
                  translations: { ...editForm },
                }
              : c
          )
        );
        setEditCategory(null);
        setAlertMsg({ type: "success", text: "Category updated successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert(res.error || "Failed to update category");
      }
    });
  };

  const handleDeleteOne = (key: string) => {
    startTransition(async () => {
      const res = await deleteCategoryAction(key);
      if (res.success) {
        setCategoriesList((prev) => prev.filter((c) => c.key !== key));
        setSelectedKeys((prev) => prev.filter((k) => k !== key));
        setDeleteConfirmKey(null);
        setAlertMsg({ type: "success", text: "Category deleted successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert(res.error || "Failed to delete category");
      }
    });
  };

  const handleBulkDelete = () => {
    const validKeys = selectedKeys.filter((k) => k !== "other");
    if (validKeys.length === 0) {
      alert("Please select at least one deletable category ('other' cannot be deleted)");
      return;
    }

    setShowBulkDeleteModal(true);
  };

  const executeBulkDelete = () => {
    const validKeys = selectedKeys.filter((k) => k !== "other");
    startTransition(async () => {
      const res = await bulkDeleteCategoriesAction(validKeys);
      if (res.success) {
        setCategoriesList((prev) => prev.filter((c) => !validKeys.includes(c.key)));
        setSelectedKeys([]);
        setShowBulkDeleteModal(false);
        setAlertMsg({ type: "success", text: "Selected categories deleted successfully!" });
        setTimeout(() => setAlertMsg(null), 3000);
      } else {
        alert(res.error || "Failed to delete categories");
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb matching Screenshot 2 */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage Categories
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
            Manage Categories
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

      {/* 1. Add Category Card matching Screenshot 2 */}
      <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-wide">
            Add Category
          </h6>
        </div>

        <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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

          <div className="pt-2 flex justify-end">
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

      {/* 2. Manage Categories Card matching Screenshot 2 & 3 */}
      <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg shadow-sm">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-wide">
            Manage Categories
          </h6>
        </div>

        {/* Search for Keyword */}
        <div className="p-5 pb-4">
          <form onSubmit={handleSearchSubmit} className="space-y-1 max-w-xl">
            <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
              Search for Keyword
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder=""
                  className="w-full bg-white dark:bg-[#121316] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#04abf2] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>
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
                  CATEGORY NAME
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
                    No categories found
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const isChecked = selectedKeys.includes(cat.key);

                  return (
                    <tr
                      key={cat.key}
                      className="hover:bg-neutral-50/50 dark:hover:bg-[#1f2227]/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(cat.key)}
                          className="w-3.5 h-3.5 accent-[#04abf2] rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-6 text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {cat.key}
                      </td>
                      <td className="py-3 px-6 font-medium text-neutral-800 dark:text-neutral-200 border-r border-neutral-200 dark:border-[#292d33]">
                        {cat.name}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleEditOpen(cat)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>

                          {/* Delete Button (disabled for 'other') */}
                          {cat.key !== "other" && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmKey(cat.key)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bulk Delete Button matching Screenshot 3 */}
        <div className="p-4 bg-neutral-50/50 dark:bg-[#181a1d]/40 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            type="button"
            disabled={selectedKeys.filter((k) => k !== "other").length === 0 || isPending}
            onClick={handleBulkDelete}
            className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] active:bg-[#0288c5] disabled:opacity-50 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1a1c20] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-2xl w-full shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Edit Category: {editCategory.name}
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
                  onClick={() => setEditCategory(null)}
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
              Delete Category?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this Category?
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
              Delete Category?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Are you sure that you want to remove the selected Category(s)?
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

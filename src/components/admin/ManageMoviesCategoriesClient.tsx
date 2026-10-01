"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  addMovieCategoryAction,
  updateMovieCategoryAction,
  deleteMovieCategoryAction,
  bulkDeleteMovieCategoriesAction,
} from "@/modules/admin/movies.actions";
import { Edit, Trash2, Home, Check, AlertCircle } from "lucide-react";

export interface MovieCategoryItem {
  id: number;
  key: string;
  name: string;
  translations: Record<string, string>;
}

interface ManageMoviesCategoriesClientProps {
  initialCategories: MovieCategoryItem[];
  availableLanguages: string[];
}

export function ManageMoviesCategoriesClient({
  initialCategories,
  availableLanguages,
}: ManageMoviesCategoriesClientProps) {
  const [categoriesList, setCategoriesList] = useState<MovieCategoryItem[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [addForm, setAddForm] = useState<Record<string, string>>({});
  const [editCategory, setEditCategory] = useState<MovieCategoryItem | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = categoriesList.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.key.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
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
      const res = await addMovieCategoryAction(addForm);
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

  const handleEditOpen = (cat: MovieCategoryItem) => {
    setEditCategory(cat);
    const initialValues: Record<string, string> = { ...cat.translations };
    if (!initialValues["english"]) {
      initialValues["english"] = cat.name;
    }
    setEditForm(initialValues);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    if (!editForm["english"]?.trim()) {
      alert("English category name is required");
      return;
    }

    startTransition(async () => {
      const res = await updateMovieCategoryAction(editCategory.key, editForm);
      if (res.success) {
        setCategoriesList((prev) =>
          prev.map((c) =>
            c.key === editCategory.key
              ? {
                  ...c,
                  name: editForm["english"].trim(),
                  translations: { ...editForm },
                }
              : c
          )
        );
        setEditCategory(null);
      } else {
        alert(res.error || "Failed to update category");
      }
    });
  };

  const handleSingleDelete = (key: string) => {
    startTransition(async () => {
      const res = await deleteMovieCategoryAction(key);
      if (res.success) {
        setCategoriesList((prev) => prev.filter((c) => c.key !== key));
        setDeleteConfirmKey(null);
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

    if (
      !confirm(
        `Are you sure that you want to remove the selected ${validKeys.length} Category(s)?`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await bulkDeleteMovieCategoriesAction(validKeys);
      if (res.success) {
        setCategoriesList((prev) => prev.filter((c) => !validKeys.includes(c.key)));
        setSelectedKeys([]);
      } else {
        alert(res.error || "Failed to delete categories");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb matching Screenshot 3 */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
          Manage Movies Categories
        </h3>
        <nav className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
          <Link href="/admin" className="text-[#04abf2] hover:underline flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </Link>
          <span>&gt;</span>
          <span>Movies</span>
          <span>&gt;</span>
          <span className="text-neutral-700 dark:text-neutral-200 font-semibold">
            Manage Movies Categories
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

      {/* 1. Add Category Card matching Screenshot 3 */}
      <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide uppercase">
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
                    className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
            >
              {isPending ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Manage Categories Card matching Screenshot 3 & 4 */}
      <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-sm shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#292d33]">
          <h6 className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide uppercase">
            Manage Categories
          </h6>
        </div>

        {/* Search for Keyword */}
        <div className="p-5 pb-4 space-y-1">
          <label className="text-xs text-neutral-600 dark:text-neutral-300 font-medium block">
            Search for Keyword
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-80 max-w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder=""
                className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
              />
            </div>
            <button
              type="button"
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
              <tr className="border-y border-neutral-200 dark:border-[#292d33] text-[11px] font-semibold text-neutral-500 dark:text-[#ced4da] uppercase tracking-wider bg-neutral-50/50 dark:bg-[#181a1d]/50">
                <th className="py-3 px-4 w-12 text-center border-r border-neutral-200 dark:border-[#292d33]">
                  <input
                    type="checkbox"
                    checked={
                      selectedKeys.length === filtered.length && filtered.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
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
                      className="hover:bg-neutral-50 dark:hover:bg-[#181a1d] transition-colors"
                    >
                      <td className="py-3 px-4 text-center border-r border-neutral-200 dark:border-[#292d33]">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(cat.key)}
                          className="rounded border-neutral-300 dark:border-neutral-700 text-[#04abf2] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-6 font-mono text-neutral-600 dark:text-neutral-400 border-r border-neutral-200 dark:border-[#292d33]">
                        {cat.key}
                      </td>
                      <td className="py-3 px-6 font-medium text-neutral-800 dark:text-neutral-200 border-r border-neutral-200 dark:border-[#292d33]">
                        {cat.name}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditOpen(cat)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold rounded inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>

                          {/* Delete Button (disabled for 'other') */}
                          {cat.key !== "other" && (
                            <button
                              onClick={() => setDeleteConfirmKey(cat.key)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-semibold rounded inline-flex items-center gap-1 transition-colors cursor-pointer"
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

        {/* Bulk Delete Button matching Screenshot 4 */}
        <div className="p-4 bg-neutral-50/50 dark:bg-[#181a1d]/40 border-t border-neutral-200 dark:border-[#292d33]">
          <button
            onClick={handleBulkDelete}
            disabled={selectedKeys.length === 0 || isPending}
            className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
          >
            {isPending ? "Deleting..." : `Delete Selected ${selectedKeys.length > 0 ? `(${selectedKeys.length})` : ""}`}
          </button>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-neutral-200 dark:border-[#292d33] flex items-center justify-between">
              <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
                Edit Category ({editCategory.key})
              </h5>
              <button
                onClick={() => setEditCategory(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
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
                        className="w-full bg-white dark:bg-[#181a1d] border border-neutral-300 dark:border-[#2f343b] text-neutral-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-hidden focus:border-[#04abf2]"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-[#292d33] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditCategory(null)}
                  className="px-4 py-2 border border-neutral-300 dark:border-[#2f343b] text-neutral-700 dark:text-neutral-300 rounded text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-[#181a1d] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#04abf2] hover:bg-[#0396d5] text-white text-xs font-semibold rounded transition-colors shadow-xs cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Category Confirmation Modal */}
      {deleteConfirmKey !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1f2227] border border-neutral-200 dark:border-[#292d33] rounded-lg max-w-sm w-full shadow-2xl overflow-hidden p-5 space-y-4">
            <h5 className="font-bold text-sm text-neutral-800 dark:text-white">
              Delete Category?
            </h5>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
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
                onClick={() => handleSingleDelete(deleteConfirmKey)}
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

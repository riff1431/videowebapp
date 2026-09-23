import React from "react";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { FolderTree, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categoriesList = await db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder);

  async function createCategoryAction(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const key = (formData.get("key") as string) || name.toLowerCase().replace(/\s+/g, "_");

    if (name && key) {
      await db.insert(categories).values({
        name,
        key,
        sortOrder: categoriesList.length + 1,
      });
      revalidatePath("/admin/categories");
      revalidatePath("/");
    }
  }

  async function deleteCategoryAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (id) {
      const { eq } = await import("drizzle-orm");
      await db.delete(categories).where(eq(categories.id, id));
      revalidatePath("/admin/categories");
      revalidatePath("/");
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Categories</h1>
          <p className="text-xs text-gray-500 mt-1">
            Organize video categorization, discovery pills, and search filters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Plus className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-bold text-gray-800">Add New Category</h3>
          </div>

          <form action={createCategoryAction} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Comedy"
                className="w-full h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Category Key (Slug)
              </label>
              <input
                type="text"
                name="key"
                placeholder="e.g. comedy"
                className="w-full h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-[var(--primary)] font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full h-9 mt-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold rounded-md transition-colors shadow-xs cursor-pointer"
            >
              Save Category
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">
              Categories List ({categoriesList.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug / Key</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoriesList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No categories defined yet.
                    </td>
                  </tr>
                ) : (
                  categoriesList.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-gray-400 font-mono">{cat.id}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{cat.name}</td>
                      <td className="py-3 px-4 text-gray-500 font-mono">{cat.key}</td>
                      <td className="py-3 px-4 text-right">
                        <form action={deleteCategoryAction} className="inline">
                          <input type="hidden" name="id" value={cat.id} />
                          <button
                            type="submit"
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileCode, Plus, Trash2, Edit2, Search, ExternalLink } from "lucide-react";

interface CustomPage {
  id: string;
  name: string;
  title: string;
  slug: string;
  updatedAt: string;
}

const INITIAL_PAGES: CustomPage[] = [
  {
    id: "1",
    name: "terms",
    title: "Terms of Use",
    slug: "terms",
    updatedAt: "2026-09-01",
  },
  {
    id: "2",
    name: "privacy",
    title: "Privacy Policy",
    slug: "privacy",
    updatedAt: "2026-09-01",
  },
  {
    id: "3",
    name: "about",
    title: "About Us",
    slug: "about",
    updatedAt: "2026-09-10",
  },
  {
    id: "4",
    name: "refund",
    title: "Refund Policy",
    slug: "refund",
    updatedAt: "2026-09-12",
  },
];

export default function ManageCustomPages() {
  const [pages, setPages] = useState<CustomPage[]>(INITIAL_PAGES);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState("");

  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this custom page?")) {
      setPages((prev) => prev.filter((p) => p.id !== id));
      setMsg("Custom page deleted successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTitle) return;

    const newP: CustomPage = {
      id: String(Date.now()),
      name: newName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title: newTitle,
      slug: newName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    setPages([...pages, newP]);
    setNewName("");
    setNewTitle("");
    setNewContent("");
    setShowAddModal(false);
    setMsg("Custom page created successfully!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold text-white">Manage Custom Pages</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Pages</span>
          <span>/</span>
          <span className="text-[#04abf2]">Manage Custom Pages</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg">
          {msg}
        </div>
      )}

      {/* Main Container */}
      <div className="bg-[#1b1e22] border border-[#2c3136] rounded-xl overflow-hidden shadow-lg">
        {/* Search Bar & Create Button */}
        <div className="p-4 border-b border-[#2c3136] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search custom pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2] placeholder-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Custom Page</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-300">
            <thead className="bg-[#16191c] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#2c3136]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">ID</th>
                <th className="px-4 py-3">Page Name</th>
                <th className="px-4 py-3">Page Title</th>
                <th className="px-4 py-3">URL Slug</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3136]">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-[#212529] transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-neutral-400">{page.id}</td>
                  <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[#04abf2]" />
                    <span>{page.name}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{page.title}</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">/terms/{page.slug}</td>
                  <td className="px-4 py-3 text-neutral-400">{page.updatedAt}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/terms/${page.slug}`}
                        target="_blank"
                        title="View Page"
                        className="p-1 hover:bg-[#2c3136] rounded text-emerald-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        title="Edit Page"
                        className="p-1 hover:bg-[#2c3136] rounded text-sky-400 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Page"
                        onClick={() => handleDelete(page.id)}
                        className="p-1 hover:bg-[#2c3136] rounded text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Page */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1b1e22] border border-[#2c3136] rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Custom Page</h3>
            <form onSubmit={handleAddPage} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Page Name (Internal Identifier)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cookie-policy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Page Title (Heading)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cookie & Tracking Policy"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Page Content (HTML / Markdown)
                </label>
                <textarea
                  rows={5}
                  placeholder="Write page content here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-xs bg-[#2c3136] hover:bg-[#383f46] text-white rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#04abf2] hover:bg-[#039be5] text-white font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

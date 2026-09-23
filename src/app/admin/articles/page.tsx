"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2, Edit2, Search, Eye, Calendar, User } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  views: number;
  createdAt: string;
  status: "published" | "draft";
}

const INITIAL_ARTICLES: Article[] = [
  {
    id: "1",
    title: "The Ultimate Guide to Video Content Creation in 2026",
    category: "Technology",
    author: "admin",
    views: 450,
    createdAt: "2026-09-15",
    status: "published",
  },
  {
    id: "2",
    title: "Best Studio Microphones for YouTube & Podcasting",
    category: "Audio",
    author: "admin",
    views: 890,
    createdAt: "2026-09-18",
    status: "published",
  },
];

export default function ManageArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setMsg("Article deleted successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold text-white">Manage Articles</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Articles</span>
          <span>/</span>
          <span className="text-[#04abf2]">Manage Articles</span>
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
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#16191c] border border-[#2c3136] rounded-md text-white focus:outline-none focus:border-[#04abf2] placeholder-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
          </div>

          <Link
            href="/create-article"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Article</span>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-neutral-300">
            <thead className="bg-[#16191c] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-[#2c3136]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2c3136]">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-[#212529] transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-neutral-400">{article.id}</td>
                  <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>{article.title}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{article.category}</td>
                  <td className="px-4 py-3 text-neutral-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-neutral-500" />
                    <span>{article.author}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-neutral-500" />
                    <span>{article.views}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>{article.createdAt}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Edit Article"
                        className="p-1 hover:bg-[#2c3136] rounded text-sky-400 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Article"
                        onClick={() => handleDelete(article.id)}
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
    </div>
  );
}

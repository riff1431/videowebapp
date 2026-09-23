"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, Plus, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";

interface Language {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
  count: number;
}

const INITIAL_LANGUAGES: Language[] = [
  { id: "1", name: "English", code: "english", status: "active", count: 2840 },
  { id: "2", name: "Arabic", code: "arabic", status: "active", count: 2840 },
  { id: "3", name: "Dutch", code: "dutch", status: "active", count: 2840 },
  { id: "4", name: "French", code: "french", status: "active", count: 2840 },
  { id: "5", name: "German", code: "german", status: "active", count: 2840 },
  { id: "6", name: "Italian", code: "italian", status: "active", count: 2840 },
  { id: "7", name: "Portuguese", code: "portuguese", status: "active", count: 2840 },
  { id: "8", name: "Russian", code: "russian", status: "active", count: 2840 },
  { id: "9", name: "Spanish", code: "spanish", status: "active", count: 2840 },
  { id: "10", name: "Turkish", code: "turkish", status: "active", count: 2840 },
];

export default function ManageLanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>(INITIAL_LANGUAGES);
  const [newLangName, setNewLangName] = useState("");
  const [newLangCode, setNewLangCode] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [msg, setMsg] = useState("");

  const handleToggleStatus = (id: string) => {
    setLanguages((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: l.status === "active" ? "inactive" : "active" }
          : l
      )
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this language?")) {
      setLanguages((prev) => prev.filter((l) => l.id !== id));
      setMsg("Language deleted successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangName || !newLangCode) return;
    const newL: Language = {
      id: String(Date.now()),
      name: newLangName,
      code: newLangCode.toLowerCase(),
      status: "active",
      count: 2840,
    };
    setLanguages((prev) => [...prev, newL]);
    setNewLangName("");
    setNewLangCode("");
    setShowAddModal(false);
    setMsg("New language added successfully!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-[var(--admin-text-main)]">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold text-[var(--admin-text-main)]">Manage Languages</h3>
        <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)] mt-1">
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Languages</span>
          <span>/</span>
          <span className="text-[#04abf2]">Manage Languages</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-lg">
          {msg}
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl overflow-hidden shadow-xs transition-colors duration-200">
        <div className="p-4 border-b border-[var(--admin-card-border)] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[var(--admin-text-main)]">Manage & Edit Languages</h4>
            <p className="text-xs text-[var(--admin-text-muted)]">Total Languages: {languages.length}</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#04abf2] hover:bg-[#039be5] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Language</span>
          </button>
        </div>

        {/* Languages Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-[var(--admin-text-main)]">
            <thead className="bg-[var(--admin-card-hover)] text-[var(--admin-text-muted)] uppercase text-[10px] tracking-wider border-b border-[var(--admin-card-border)]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">#</th>
                <th className="px-4 py-3">Language Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Keys Count</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-card-border)]">
              {languages.map((lang, index) => (
                <tr key={lang.id} className="hover:bg-[var(--admin-card-hover)] transition-colors">
                  <td className="px-4 py-3 text-center font-mono text-[var(--admin-text-muted)]">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--admin-text-main)] flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#04abf2]" />
                    <span>{lang.name}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--admin-text-muted)]">{lang.code}</td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">{lang.count} keys</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(lang.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                        lang.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      {lang.status === "active" ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Edit Language"
                        className="p-1 hover:bg-neutral-500/10 rounded text-sky-500 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {lang.code !== "english" && (
                        <button
                          title="Delete Language"
                          onClick={() => handleDelete(lang.id)}
                          className="p-1 hover:bg-neutral-500/10 rounded text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Language */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[var(--admin-card-bg)] border border-[var(--admin-card-border)] rounded-xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--admin-text-main)]">Add New Language</h3>
            <form onSubmit={handleAddLanguage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1">
                  Language Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Russian, Japanese"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-md text-[var(--admin-text-main)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[#04abf2]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-muted)] mb-1">
                  Language Code (ISO 2-letter or lowercase)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ru, ja"
                  value={newLangCode}
                  onChange={(e) => setNewLangCode(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-md text-[var(--admin-text-main)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[#04abf2]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 text-xs bg-[var(--admin-card-hover)] hover:opacity-80 text-[var(--admin-text-main)] rounded-md transition-colors cursor-pointer border border-[var(--admin-card-border)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#04abf2] hover:bg-[#039be5] text-white font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Add Language
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

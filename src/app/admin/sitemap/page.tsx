"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Network, RefreshCw, CheckCircle2, ExternalLink, Globe } from "lucide-react";

export default function SitemapPage() {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastCreated, setLastCreated] = useState("2026-09-21 14:20:00");
  const [msg, setMsg] = useState("");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setProgress(15);
    setMsg("");

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setGenerating(false);
          const now = new Date().toISOString().replace("T", " ").substring(0, 19);
          setLastCreated(now);
          setMsg("New sitemap XML files generated successfully!");
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold" style={{ color: "var(--admin-text-main)" }}>Create Sitemap</h3>
        <div className="flex items-center gap-2 text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Sitemap</span>
          <span>/</span>
          <span className="text-[#04abf2]">Create Sitemap</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Card */}
      <div
        className="rounded-xl p-6 shadow-sm border space-y-6 max-w-3xl"
        style={{
          backgroundColor: "var(--admin-card-bg)",
          borderColor: "var(--admin-card-border)"
        }}
      >
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--admin-card-border)" }}>
          <div className="p-3 bg-[#04abf2]/10 rounded-xl text-[#04abf2]">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold" style={{ color: "var(--admin-text-main)" }}>Generate New Sitemap</h4>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              Generates indexable XML sitemaps for Google, Bing, and search engines.
            </p>
          </div>
        </div>

        <div
          className="space-y-3 text-xs p-4 rounded-lg border"
          style={{
            backgroundColor: "var(--admin-bg)",
            borderColor: "var(--admin-card-border)",
            color: "var(--admin-text-main)"
          }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: "var(--admin-text-muted)" }} />
            <span className="font-semibold" style={{ color: "var(--admin-text-main)" }}>Sitemap URL:</span>
            <a
              href="/sitemap.xml"
              target="_blank"
              className="text-[#04abf2] hover:underline flex items-center gap-1 font-mono"
            >
              <span>http://localhost:3000/sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: "var(--admin-text-main)" }}>Last created sitemap:</span>
            <span className="font-mono" style={{ color: "var(--admin-text-muted)" }}>{lastCreated}</span>
          </div>
        </div>

        {generating && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: "var(--admin-text-muted)" }}>
              <span>Generating entries (videos, categories, articles)...</span>
              <span>{progress}%</span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden border"
              style={{
                backgroundColor: "var(--admin-bg)",
                borderColor: "var(--admin-card-border)"
              }}
            >
              <div
                className="bg-[#04abf2] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <button
            type="submit"
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#04abf2] hover:bg-[#039be5] disabled:opacity-50 text-white font-bold text-xs rounded-md shadow transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            <span>{generating ? "Generating..." : "Generate New Sitemap"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

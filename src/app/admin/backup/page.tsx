"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, HardDrive, CheckCircle2, Clock, ShieldCheck, Database } from "lucide-react";

export default function BackupPage() {
  const [lastBackup, setLastBackup] = useState("2026-09-22 18:45:10");
  const [backingUp, setBackingUp] = useState(false);
  const [msg, setMsg] = useState("");

  const handleCreateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    setBackingUp(true);
    setMsg("");

    setTimeout(() => {
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      setLastBackup(now);
      setBackingUp(false);
      setMsg("Full database SQL & file backup created successfully!");
    }, 1500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold" style={{ color: "var(--admin-text-main)" }}>Backup & Restore</h3>
        <div className="flex items-center gap-2 text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-[#04abf2]">Backup & Restore</span>
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
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold" style={{ color: "var(--admin-text-main)" }}>Backup SQL & Files</h4>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              Create and manage complete system snapshots including database and user uploads.
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
            <Clock className="w-4 h-4" style={{ color: "var(--admin-text-muted)" }} />
            <span className="font-semibold" style={{ color: "var(--admin-text-main)" }}>Last Backup:</span>
            <span className="text-[#04abf2] font-mono">{lastBackup}</span>
          </div>

          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" style={{ color: "var(--admin-text-muted)" }} />
            <span className="font-semibold" style={{ color: "var(--admin-text-main)" }}>Backups directory:</span>
            <span className="font-mono" style={{ color: "var(--admin-text-muted)" }}>./script_backups/</span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--admin-text-muted)" }} />
            <span className="font-semibold" style={{ color: "var(--admin-text-main)" }}>Backup type:</span>
            <span style={{ color: "var(--admin-text-muted)" }}>
              PostgreSQL schema & data dump + public uploads directory.
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs rounded-lg">
          💡 <strong>Tip:</strong> You can download historical backups via SFTP/SSH from the script_backups folder, or stream to S3 object storage for multi-region redundancy.
        </div>

        <form onSubmit={handleCreateBackup}>
          <button
            type="submit"
            disabled={backingUp}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-md shadow transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${backingUp ? "animate-spin" : ""}`} />
            <span>{backingUp ? "Creating Backup..." : "Create New Full Backup"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

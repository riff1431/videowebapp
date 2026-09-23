"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Smartphone, Key, RefreshCw, Copy, Check, AlertTriangle } from "lucide-react";

export default function ApiSettingsPage() {
  const [serverKey, setServerKey] = useState(
    "a8f7b2c9d1e4056284f67c3b901a52de784fa0bc63d8"
  );
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(serverKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetKey = () => {
    if (
      confirm(
        "Are you sure you want to reset the API secret key? All mobile and external applications using this key will immediately stop working until updated."
      )
    ) {
      const chars = "abcdef0123456789";
      let res = "";
      for (let i = 0; i < 44; i++) {
        res += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setServerKey(res);
      setMsg("API Secret Key regenerated successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <h3 className="text-xl font-bold" style={{ color: "var(--admin-text-main)" }}>Manage API Access Keys</h3>
        <div className="flex items-center gap-2 text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
          <Link href="/admin" className="hover:underline">Admin Panel</Link>
          <span>/</span>
          <span>Mobile & API Settings</span>
          <span>/</span>
          <span className="text-[#04abf2]">Manage API Access Keys</span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 text-xs rounded-lg">
          {msg}
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
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold" style={{ color: "var(--admin-text-main)" }}>Manage API Access Keys</h4>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              Use these credentials to connect PlayTube iOS, Android, and Windows desktop apps.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs rounded-lg">
          Use this key to authenticate external clients with REST endpoints under <code>/api/v1/</code>.
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: "var(--admin-text-main)" }}>
              <Key className="w-3.5 h-3.5 text-[#04abf2]" />
              <span>Site Server Key</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={serverKey}
                className="flex-1 h-10 px-3 text-xs border rounded-md font-mono text-emerald-500 focus:outline-none select-all"
                style={{
                  backgroundColor: "var(--admin-input-bg)",
                  borderColor: "var(--admin-input-border)"
                }}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="h-10 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border"
                style={{
                  backgroundColor: "var(--admin-bg)",
                  borderColor: "var(--admin-card-border)",
                  color: "var(--admin-text-main)"
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-[11px] mt-1" style={{ color: "var(--admin-text-muted)" }}>
              Keep this key confidential. Do not expose it in public client repositories.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetKey}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET KEYS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

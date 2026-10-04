"use client";

import React from "react";
import { Keyboard } from "lucide-react";
import { useTranslation } from "@/providers/language-provider";

interface ShortsShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortsShortcutsHelp({ isOpen, onClose }: ShortsShortcutsHelpProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const shortcuts = [
    { key: "↓ / J", desc: t("next_short", "Next short") },
    { key: "↑ / K", desc: t("prev_short", "Previous short") },
    { key: "Space", desc: t("play_pause", "Play / Pause") },
    { key: "M", desc: t("mute_unmute", "Mute / Unmute") },
    { key: "L", desc: t("like", "Like short") },
    { key: "C", desc: t("toggle_comments", "Open / Close comments") },
    { key: "Esc", desc: t("close", "Close dialogs") },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-3xl bg-[var(--default-panel)] border border-[var(--border)] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/40">
          <h3 className="text-sm font-bold text-[var(--default-text)] flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[var(--default-brand-red)]" />
            <span>{t("keyboard_shortcuts", "Keyboard Shortcuts")}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--default-muted)] hover:text-[var(--default-text)] text-xs font-semibold px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between text-xs">
              <span className="text-[var(--default-muted)]">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 font-mono text-[11px] font-semibold text-[var(--default-text)] border border-[var(--border)]/60">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, Mail, Send } from "lucide-react";
import { Button } from "@/app/themes/default/components/ui/button";
import { useTranslation } from "@/providers/language-provider";

interface ShortShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
}

export function ShortShareDialog({
  isOpen,
  onClose,
  videoId,
  title,
}: ShortShareDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/shorts?v=${videoId}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const socialTargets = [
    {
      name: "Facebook",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter / X",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share short"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-[var(--default-panel)] border border-[var(--border)] p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/40">
          <h3 className="text-sm font-bold text-[var(--default-text)] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[var(--default-brand-red)]" />
            <span>{t("share", "Share")}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--default-muted)] hover:text-[var(--default-text)] text-xs font-semibold px-2 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center justify-around py-2">
          {socialTargets.map((target) => (
            <a
              key={target.name}
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-[var(--default-text)] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <target.icon className="w-5 h-5 text-[var(--default-brand-red)]" />
              </div>
              <span className="text-[10px] font-medium">{target.name}</span>
            </a>
          ))}
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[var(--default-search-bg)] border border-[var(--default-search-border)]">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 px-3 bg-transparent text-xs text-[var(--default-text)] outline-none"
          />
          <Button
            size="sm"
            variant="pill-active"
            onClick={handleCopy}
            className="gap-1.5 rounded-full shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t("copied", "Copied") : t("copy", "Copy")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

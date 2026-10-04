import React from "react";
import "./theme.css";
import { SiteShell } from "@/components/layout/SiteShell";

export default function TestThemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="testtheme-root font-sans" data-theme-marker="testtheme-shell">
      <SiteShell themeId="testtheme">{children}</SiteShell>
    </div>
  );
}

import React from "react";
import "./theme.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export default function DefaultThemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${outfit.variable} font-sans`}>
      <SiteShell themeId="default">{children}</SiteShell>
    </div>
  );
}

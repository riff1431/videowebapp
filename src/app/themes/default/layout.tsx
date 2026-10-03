import React from "react";
import "./theme.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { Roboto, Lato } from "next/font/google";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-heading",
  display: "swap",
});

export default function defaultThemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${lato.variable} ${roboto.variable} font-sans`}>
      <SiteShell themeId="default">{children}</SiteShell>
    </div>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CustomDesignInjector } from "@/components/theme/CustomDesignInjector";
import { LanguageProvider } from "@/providers/language-provider";
import { getServerTranslations } from "@/lib/translations/server";

import { getSiteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "PlayTube - Video Sharing Platform",
  description: "PlayTube is the premier video sharing platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentLang, currentMeta, languages, dict } = await getServerTranslations();
  const isRtl = currentMeta?.direction === "rtl";
  const siteThemeConfig = await getSiteConfig(["theme"]);
  const activeTheme = siteThemeConfig["theme"] || "youplay";

  return (
    <html
      lang={currentMeta?.iso || "en"}
      dir={isRtl ? "rtl" : "ltr"}
      data-theme={activeTheme}
      suppressHydrationWarning
    >
      <head>
        <CustomDesignInjector />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
        <LanguageProvider
          initialLang={currentLang}
          initialTranslations={dict}
          initialLanguages={languages}
        >
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

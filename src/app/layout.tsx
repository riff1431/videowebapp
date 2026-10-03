import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { CustomDesignInjector } from "@/components/theme/CustomDesignInjector";
import { LanguageProvider } from "@/providers/language-provider";
import { getServerTranslations } from "@/lib/translations/server";
import { getSiteConfig } from "@/lib/config";
import { getSeoMetadata } from "@/lib/config/seo";
import { getActiveThemeId } from "@/lib/themes";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata({ pageKey: "home" });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentLang, currentMeta, languages, dict } = await getServerTranslations();
  const isRtl = currentMeta?.direction === "rtl";
  const activeTheme = await getActiveThemeId();

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
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen">
        <LanguageProvider
          initialLang={currentLang}
          initialTranslations={dict}
          initialLanguages={languages}
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

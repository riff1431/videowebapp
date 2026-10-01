"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export interface LanguageMeta {
  id?: number;
  name: string; // e.g. "english", "arabic"
  displayName: string | null; // e.g. "English", "العربية"
  iso: string; // "en", "ar"
  direction: string; // "ltr" | "rtl"
  isDefault?: boolean | null;
}

interface LanguageContextType {
  currentLang: string;
  langMeta: LanguageMeta;
  languages: LanguageMeta[];
  isRtl: boolean;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const defaultMeta: LanguageMeta = {
  name: "english",
  displayName: "English",
  iso: "en",
  direction: "ltr",
  isDefault: true,
};

const LanguageContext = createContext<LanguageContextType>({
  currentLang: "english",
  langMeta: defaultMeta,
  languages: [defaultMeta],
  isRtl: false,
  setLanguage: async () => {},
  t: (k, fb) => fb || k,
  isLoading: false,
});

export function LanguageProvider({
  children,
  initialLang = "english",
  initialTranslations = {},
  initialLanguages = [],
}: {
  children: React.ReactNode;
  initialLang?: string;
  initialTranslations?: Record<string, string>;
  initialLanguages?: LanguageMeta[];
}) {
  const [currentLang, setCurrentLangState] = useState<string>(initialLang);
  const [translations, setTranslations] = useState<Record<string, string>>(initialTranslations);
  const [languages, setLanguages] = useState<LanguageMeta[]>(
    initialLanguages.length > 0 ? initialLanguages : [defaultMeta]
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load language preference from cookie on mount
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|; )playtube_lang=([^;]*)/);
      if (match && match[1]) {
        const savedLang = decodeURIComponent(match[1]).toLowerCase();
        if (savedLang && savedLang !== currentLang) {
          switchLang(savedLang);
        }
      }
    } catch (e) {}
  }, []);

  const switchLang = async (newLang: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/translations?lang=${encodeURIComponent(newLang)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentLangState(data.lang);
        setTranslations(data.translations || {});
        if (data.languages) setLanguages(data.languages);

        // Save cookie for 365 days
        const maxAge = 365 * 24 * 60 * 60;
        document.cookie = `playtube_lang=${encodeURIComponent(data.lang)}; path=/; max-age=${maxAge}; SameSite=Lax`;

        // Update HTML dir and lang attribute
        const isRtlLang = data.meta?.direction === "rtl";
        document.documentElement.setAttribute("dir", isRtlLang ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", data.meta?.iso || "en");
      }
    } catch (err) {
      console.error("Failed to switch language:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMeta = useMemo(() => {
    return languages.find((l) => l.name === currentLang) || defaultMeta;
  }, [languages, currentLang]);

  const isRtl = currentMeta.direction === "rtl";

  // Translation lookup helper with parameter interpolation
  const t = (
    key: string,
    fallback?: string,
    params?: Record<string, string | number>
  ): string => {
    let result = translations[key] ?? fallback ?? key;
    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`{{${pKey}}}|{${pKey}}`, "g"), String(pVal));
      }
    }
    return result;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        langMeta: currentMeta,
        languages,
        isRtl,
        setLanguage: switchLang,
        t,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

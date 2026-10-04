"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getPublicDesignSettingsAction } from "@/modules/videos/design-public.actions";
import { getPublicImageUrl } from "@/lib/storage/image-url";

type Theme = "light" | "dark";

export interface DesignSettings {
  favicon: string;
  logo: string;
  lightLogo: string;
  nightMode: string; // "both" | "night_default" | "night" | "light"
  theme?: string; // "youplay" | "default"
}

interface ThemeContextType {
  theme: Theme;
  activeSiteTheme: string;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  designSettings: DesignSettings;
  canToggle: boolean;
}

const defaultDesignSettings: DesignSettings = {
  favicon: "/favicon.ico",
  logo: "/logo.png",
  lightLogo: "/logo-light.png",
  nightMode: "night_default",
  theme: "youplay",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: DesignSettings;
}) {
  const [designSettings, setDesignSettings] = useState<DesignSettings>(
    initialSettings || defaultDesignSettings
  );
  const [theme, setThemeState] = useState<Theme>("light");

  // Fetch updated design settings from DB on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getPublicDesignSettingsAction();
        if (res.success && res.data) {
          setDesignSettings(res.data);
        }
      } catch (e) {
        console.error("Failed to load design settings in ThemeProvider:", e);
      }
    }
    loadSettings();
  }, []);


  // Set data-theme on html element whenever theme setting changes
  useEffect(() => {
    const currentSiteTheme = designSettings.theme || "youplay";
    document.documentElement.setAttribute("data-theme", currentSiteTheme);
    document.body.classList.remove("theme-youplay", "theme-default");
    document.body.classList.add(`theme-${currentSiteTheme}`);
  }, [designSettings.theme]);

  // Compute allowed mode behavior based on nightMode
  // "both" -> toggleable, default light
  // "night_default" -> toggleable, default dark
  // "night" -> forced dark
  // "light" -> forced light
  const mode = designSettings.nightMode;
  const canToggle = mode === "both" || mode === "night_default";

  useEffect(() => {
    let resolvedTheme: Theme = "light";

    if (mode === "night") {
      resolvedTheme = "dark";
    } else if (mode === "light") {
      resolvedTheme = "light";
    } else {
      // Toggleable modes ("both" or "night_default")
      const saved = localStorage.getItem("playtube_theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        resolvedTheme = saved;
      } else {
        resolvedTheme = mode === "night_default" ? "dark" : "light";
      }
    }

    setThemeState(resolvedTheme);
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Dynamic favicon update
    if (designSettings.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      link.href = getPublicImageUrl(designSettings.favicon, "/favicon.ico") || "/favicon.ico";
    }
  }, [mode, designSettings.favicon]);


  const setTheme = (newTheme: Theme) => {
    if (!canToggle) return; // Ignore toggle if forced light or dark
    setThemeState(newTheme);
    localStorage.setItem("playtube_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    if (!canToggle) return;
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        activeSiteTheme: designSettings.theme || "youplay",
        toggleTheme,
        setTheme,
        designSettings,
        canToggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}


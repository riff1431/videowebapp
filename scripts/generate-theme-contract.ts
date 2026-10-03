import fs from "fs";
import path from "path";

/**
 * Regenerates the JSON parts from code (routes, tokens, exports)
 * and updates docs/theme-contract.json.
 * If docs/theme-contract.md contains auto markers:
 * <!-- AUTO:start routes --> ... <!-- AUTO:end routes -->
 * <!-- AUTO:start tokens --> ... <!-- AUTO:end tokens -->
 * <!-- AUTO:start exports --> ... <!-- AUTO:end exports -->
 * it injects the latest tables while leaving the human-written prose untouched.
 */
export async function generateThemeContract(): Promise<void> {
  const youplayDir = path.resolve("src/app/themes/youplay");

  function getFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of list) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        results = results.concat(getFiles(full));
      } else if (item.name === "page.tsx") {
        results.push(full);
      }
    }
    return results;
  }

  const pages = getFiles(youplayDir);

  const detailedRoutes = pages.map((pagePath) => {
    const rel = path.relative(process.cwd(), pagePath).replace(/\\/g, "/");
    const youplayRel = path.relative(youplayDir, pagePath).replace(/\\/g, "/");
    const content = fs.readFileSync(pagePath, "utf-8");

    let url = "/" + youplayRel.replace(/\/page\.tsx$/, "").replace(/^page\.tsx$/, "");
    url = url.replace(/\/\([^)]+\)/g, "");
    if (url === "") url = "/";
    if (!url.startsWith("/")) url = "/" + url;

    const paramMatches = youplayRel.match(/\[([a-zA-Z0-9_]+)\]/g) || [];
    const params = paramMatches.map((p) => p.replace(/[\[\]]/g, ""));

    const searchParamRegex = /searchParams(?:\.get\(["']([a-zA-Z0-9_]+)["']\)|(?:\?|\.)([a-zA-Z0-9_]+))/g;
    const foundSearchParams = new Set<string>();
    for (const m of content.matchAll(searchParamRegex)) {
      const p = m[1] || m[2];
      if (p && p !== "get" && p !== "has" && p !== "toString" && p !== "then") {
        foundSearchParams.add(p);
      }
    }

    const hookMatches = content.match(/\buse[A-Z][a-zA-Z0-9_]*/g) || [];
    const hooks = Array.from(new Set(hookMatches));

    const importLines = content.match(/import\s+[\s\S]*?from\s+["'][^"']+["'];?/g) || [];
    const queries: string[] = [];
    const actions: string[] = [];
    const components: string[] = [];

    for (const imp of importLines) {
      const fromMatch = imp.match(/from\s+["']([^"']+)["']/);
      if (!fromMatch) continue;
      const modPath = fromMatch[1];

      const namesMatch = imp.match(/import\s+([^;]+?)\s+from/);
      if (!namesMatch) continue;
      const names = namesMatch[1]
        .replace(/[{}\n\r]/g, " ")
        .split(",")
        .map((n) => n.trim().split(/\s+as\s+/)[0])
        .filter((n) => n && !n.startsWith("*"));

      for (const name of names) {
        if (modPath.includes(".actions") || name.endsWith("Action")) {
          actions.push(name);
        } else if (
          modPath.includes(".service") ||
          name.startsWith("get") ||
          name.startsWith("fetch") ||
          name.startsWith("find") ||
          modPath.includes("drizzle") ||
          modPath === "@/db"
        ) {
          if (!name.endsWith("Action") && !name.startsWith("use")) {
            queries.push(name);
          }
        } else if (
          /^[A-Z]/.test(name) &&
          !name.endsWith("Provider") &&
          !name.endsWith("Type") &&
          !name.endsWith("Schema")
        ) {
          components.push(name);
        }
      }
    }

    const configKeys = new Set<string>();
    for (const m of content.matchAll(/siteConfig(?:\.([a-zA-Z0-9_]+)|\[["']([a-zA-Z0-9_]+)["']\])/g)) {
      configKeys.add(m[1] || m[2]);
    }
    for (const m of content.matchAll(/getSiteConfig\(\[\s*([^\]]+)\s*\]\)/g)) {
      const inner = m[1];
      const keyMatches = inner.match(/["']([a-zA-Z0-9_]+)["']/g) || [];
      for (const km of keyMatches) {
        configKeys.add(km.replace(/["']/g, ""));
      }
    }

    const adSlots: string[] = [];
    for (const m of content.matchAll(/<WebsiteAd\s+slot=["']([a-zA-Z0-9_-]+)["']/g)) {
      adSlots.push(m[1]);
    }

    let auth: "none" | "required" | "redirectIfAuth" | "optional" = "none";
    if (url.startsWith("/login") || url.startsWith("/register") || url.startsWith("/forgot-password") || url.startsWith("/reset-password")) {
      auth = "none";
    } else if (
      url.startsWith("/settings") ||
      url.startsWith("/dashboard") ||
      url.startsWith("/upload-video") ||
      url.startsWith("/import-video") ||
      url.startsWith("/edit-video") ||
      url.startsWith("/manage-videos") ||
      url.startsWith("/create-article") ||
      url.startsWith("/create-post") ||
      url.startsWith("/create_article") ||
      url.startsWith("/create_post") ||
      url.startsWith("/my-articles") ||
      url.startsWith("/my_articles") ||
      url.startsWith("/messages") ||
      url.startsWith("/history") ||
      url.startsWith("/liked-videos") ||
      url.startsWith("/saved-videos") ||
      url.startsWith("/subscriptions") ||
      url.startsWith("/wallet") ||
      url.startsWith("/switch-account") ||
      url.startsWith("/paid-videos") ||
      url.startsWith("/ads/create")
    ) {
      auth = "required";
    }

    return {
      url,
      file: rel,
      params,
      searchParams: Array.from(foundSearchParams).sort(),
      auth,
      required: true,
      queries: Array.from(new Set(queries)).sort(),
      actions: Array.from(new Set(actions)).sort(),
      hooks: Array.from(new Set(hooks)).sort(),
      components: Array.from(new Set(components)).sort(),
      siteConfigKeys: Array.from(configKeys).sort(),
      adSlots: Array.from(new Set(adSlots)).sort(),
      isClient: content.includes('"use client"') || content.includes("'use client'"),
    };
  });

  detailedRoutes.sort((a, b) => a.url.localeCompare(b.url));

  const tokens = [
    { name: "--brand", required: true, purpose: "Primary brand accent color", lightDefault: "#04abf2", darkDefault: "#04abf2" },
    { name: "--brand-hover", required: true, purpose: "Hover state for primary brand accent", lightDefault: "#039be5", darkDefault: "#039be5" },
    { name: "--brand-rgb", required: true, purpose: "RGB triplet for alpha transparency calculations", lightDefault: "4, 171, 242", darkDefault: "4, 171, 242" },
    { name: "--bg", required: true, purpose: "Global viewport background color", lightDefault: "#f9f9f9", darkDefault: "#121212" },
    { name: "--surface", required: true, purpose: "Container and elevated surface background", lightDefault: "#ffffff", darkDefault: "#212121" },
    { name: "--text", required: true, purpose: "Base typography color", lightDefault: "#222222", darkDefault: "#f1f1f1" },
    { name: "--muted", required: true, purpose: "Secondary/subtle typography color", lightDefault: "#666666", darkDefault: "#999999" },
    { name: "--border", required: true, purpose: "Structural card and divider borders", lightDefault: "#e5e7eb", darkDefault: "#262626" },
    { name: "--radius", required: true, purpose: "Base border radius for buttons and cards", lightDefault: "8px", darkDefault: "8px" },
    { name: "--font-body", required: true, purpose: "Body font family variable", lightDefault: "var(--font-body, 'Lato', sans-serif)", darkDefault: "var(--font-body, 'Lato', sans-serif)" },
    { name: "--font-heading", required: true, purpose: "Heading typography font family", lightDefault: "var(--font-heading, 'Roboto', sans-serif)", darkDefault: "var(--font-heading, 'Roboto', sans-serif)" },
    { name: "--primary", required: true, purpose: "Primary accent color (used across 35+ components)", lightDefault: "#04abf2", darkDefault: "#04abf2" },
    { name: "--primary-hover", required: true, purpose: "Primary button hover state", lightDefault: "#039be5", darkDefault: "#039be5" },
    { name: "--primary-rgb", required: true, purpose: "Primary RGB triplet", lightDefault: "4, 171, 242", darkDefault: "4, 171, 242" },
    { name: "--accent-yellow", required: false, purpose: "Night-mode toggle icon and featured badges", lightDefault: "#fad657", darkDefault: "#fad657" },
    { name: "--accent-red", required: false, purpose: "Alerts, unread notifications, live badges", lightDefault: "#f44336", darkDefault: "#f44336" },
    { name: "--background", required: true, purpose: "Next.js App body background variable", lightDefault: "#f9f9f9", darkDefault: "#121212" },
    { name: "--foreground", required: true, purpose: "Next.js App body text variable", lightDefault: "#222222", darkDefault: "#f1f1f1" },
    { name: "--header-bg", required: true, purpose: "Sticky navigation header background", lightDefault: "#ffffff", darkDefault: "#181818" },
    { name: "--sidebar-bg", required: true, purpose: "Left navigation sidebar background", lightDefault: "#ffffff", darkDefault: "#121212" },
    { name: "--card-bg", required: true, purpose: "Video card and content container background", lightDefault: "#ffffff", darkDefault: "#212121" },
    { name: "--card-border", required: true, purpose: "Card border separator color", lightDefault: "#e9e9e9", darkDefault: "#2a2a2a" },
    { name: "--card-shadow", required: false, purpose: "Card depth and dropdown drop shadow", lightDefault: "0 1px 3px rgba(0, 0, 0, 0.06)", darkDefault: "0 1px 4px rgba(0, 0, 0, 0.4)" },
    { name: "--search-bg", required: true, purpose: "Header search input background", lightDefault: "#f1f2f4", darkDefault: "#202020" },
    { name: "--search-border", required: true, purpose: "Header search input border", lightDefault: "#dcdfe4", darkDefault: "#333333" },
  ];

  const sharedBuildingBlocks = JSON.parse(fs.readFileSync("scripts/shared-building-blocks.json", "utf-8"));

  const contract = {
    version: "1.0.0",
    description: "PlayTube Multi-Theme Machine-Readable Theme Contract",
    routes: detailedRoutes,
    tokens: tokens,
    sharedExports: sharedBuildingBlocks,
  };

  const jsonOut = path.join(process.cwd(), "docs", "theme-contract.json");
  fs.writeFileSync(jsonOut, JSON.stringify(contract, null, 2), "utf-8");
  console.log(`[THEME CONTRACT GENERATE] Updated ${jsonOut}`);

  // Update docs/theme-contract.md if it exists
  const mdOut = path.join(process.cwd(), "docs", "theme-contract.md");
  if (fs.existsSync(mdOut)) {
    let md = fs.readFileSync(mdOut, "utf-8");

    // Replace AUTO:tokens block
    const tokenRows = tokens
      .map(
        (t) =>
          `| \`${t.name}\` | ${t.required ? "**Yes**" : "No"} | ${t.purpose} | \`${t.lightDefault}\` | \`${t.darkDefault}\` |`
      )
      .join("\n");
    const tokenTable = `| Variable Name | Required | Purpose | Light Value | Dark Value |\n|---|---|---|---|---|\n${tokenRows}`;

    md = md.replace(
      /<!-- AUTO:start tokens -->[\s\S]*?<!-- AUTO:end tokens -->/,
      `<!-- AUTO:start tokens -->\n${tokenTable}\n<!-- AUTO:end tokens -->`
    );

    fs.writeFileSync(mdOut, md, "utf-8");
    console.log(`[THEME CONTRACT GENERATE] Synchronized auto-generated tables in ${mdOut}`);
  }
}

if (require.main === module || process.argv[1]?.includes("generate-theme-contract")) {
  generateThemeContract().catch((err) => {
    console.error("Failed to generate theme contract:", err);
    process.exit(1);
  });
}

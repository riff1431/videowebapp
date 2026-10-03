import fs from "fs";
import path from "path";

interface CheckFailure {
  category: string;
  message: string;
  item?: any;
}

export function checkThemeContract(): { success: boolean; failures: CheckFailure[] } {
  const failures: CheckFailure[] = [];

  const contractPath = path.join(process.cwd(), "docs", "theme-contract.json");
  if (!fs.existsSync(contractPath)) {
    failures.push({
      category: "Contract File",
      message: "docs/theme-contract.json is missing.",
    });
    return { success: false, failures };
  }

  const contract = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
  const contractRoutes: string[] = (contract.routes || []).map((r: any) => r.url);
  const contractTokens: string[] = (contract.tokens || []).map((t: any) => t.name);
  const contractExports: Array<{ path: string; name: string }> = contract.sharedExports || [];

  // 1. Route Check: Every route in any theme folder must exist in theme-contract.json
  const themesDir = path.join(process.cwd(), "src", "app", "themes");
  if (fs.existsSync(themesDir)) {
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true });
    for (const tf of themeFolders) {
      if (!tf.isDirectory()) continue;
      const themeId = tf.name;
      const themeRoot = path.join(themesDir, themeId);

      function scanPages(dir: string, base = ""): string[] {
        let pages: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) {
            if (e.name.startsWith("(") && e.name.endsWith(")")) {
              pages.push(...scanPages(full, base));
            } else {
              pages.push(...scanPages(full, `${base}/${e.name}`));
            }
          } else if (e.name === "page.tsx" || e.name === "page.jsx") {
            pages.push(base === "" ? "/" : base);
          }
        }
        return pages;
      }

      const pages = scanPages(themeRoot);
      for (const p of pages) {
        if (!contractRoutes.includes(p)) {
          failures.push({
            category: "Route Missing",
            message: `Theme '${themeId}' implements route '${p}', but it is missing from docs/theme-contract.json routes[].`,
            item: { themeId, route: p },
          });
        }
      }
    }
  }

  // 2. Shared Export Check: Every shared export listed in the contract must exist in its file
  for (const exp of contractExports) {
    const modRel = exp.path.replace(/^@\//, "src/");
    let resolved = path.join(process.cwd(), modRel + ".ts");
    if (!fs.existsSync(resolved)) resolved = path.join(process.cwd(), modRel + ".tsx");
    if (!fs.existsSync(resolved)) resolved = path.join(process.cwd(), modRel, "index.ts");
    if (!fs.existsSync(resolved)) resolved = path.join(process.cwd(), modRel, "index.tsx");

    if (!fs.existsSync(resolved)) {
      failures.push({
        category: "Shared Export Missing File",
        message: `Shared module '${exp.path}' referenced in contract cannot be found on disk.`,
        item: exp,
      });
      continue;
    }

    const content = fs.readFileSync(resolved, "utf-8");
    // Check if the symbol is exported
    const hasExport =
      new RegExp(`export\\s+(?:async\\s+)?(?:function|const|class|type|interface)\\s+${exp.name}\\b`).test(content) ||
      new RegExp(`export\\s*\\{[^}]*\\b${exp.name}\\b[^}]*\\}`).test(content) ||
      content.includes(`export *`);

    if (!hasExport) {
      failures.push({
        category: "Shared Export Missing Symbol",
        message: `Export '${exp.name}' is listed in contract for module '${exp.path}', but symbol is not exported by '${modRel}'.`,
        item: exp,
      });
    }
  }

  // 3. Token Check: Every CSS variable used via var(--x) in shared code or youplay must be in tokens[]
  function getCssFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        results.push(...getCssFiles(full));
      } else if (/\.(css|tsx|ts)$/.test(e.name)) {
        results.push(full);
      }
    }
    return results;
  }

  const sharedToCheck = [
    path.join(process.cwd(), "src", "app", "globals.css"),
    path.join(process.cwd(), "src", "components", "layout"),
    path.join(process.cwd(), "src", "app", "themes", "youplay", "theme.css"),
  ];

  const usedVars = new Set<string>();
  for (const p of sharedToCheck) {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      const files = stat.isDirectory() ? getCssFiles(p) : [p];
      for (const f of files) {
        const text = fs.readFileSync(f, "utf-8");
        for (const m of text.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) {
          // ignore internal admin tokens (--admin-*)
          if (!m[1].startsWith("--admin-")) {
            usedVars.add(m[1]);
          }
        }
      }
    }
  }

  for (const v of usedVars) {
    if (!contractTokens.includes(v)) {
      failures.push({
        category: "Token Missing",
        message: `CSS variable '${v}' is used in shared UI / theme css, but is not listed in docs/theme-contract.json tokens[].`,
        item: v,
      });
    }
  }

  // 4. SiteConfig Check: Every key read by themes or shared UI must be documented
  const docMdPath = path.join(process.cwd(), "docs", "theme-contract.md");
  if (fs.existsSync(docMdPath)) {
    const mdContent = fs.readFileSync(docMdPath, "utf-8");
    // Extract Section 7 keys or table
    const sec7Match = mdContent.match(/## 7\. Configuration and feature toggles([\s\S]*?)## 8\./);
    const sec7Text = sec7Match ? sec7Match[1] : "";

    const keysInSec7 = new Set<string>();
    for (const km of sec7Text.matchAll(/`([a-zA-Z0-9_]+)`/g)) {
      keysInSec7.add(km[1]);
    }

    const youplayDir = path.join(process.cwd(), "src", "app", "themes", "youplay");
    const sharedUiDir = path.join(process.cwd(), "src", "components");
    const filesToScan = [...getCssFiles(youplayDir), ...getCssFiles(sharedUiDir)];

    for (const f of filesToScan) {
      const content = fs.readFileSync(f, "utf-8");
      for (const m of content.matchAll(/getSiteConfig\(\[\s*([^\]]+)\s*\]\)/g)) {
        const inner = m[1].match(/["']([a-zA-Z0-9_]+)["']/g) || [];
        for (const k of inner) {
          const raw = k.replace(/["']/g, "");
          if (!keysInSec7.has(raw)) {
            failures.push({
              category: "SiteConfig Key Undocumented",
              message: `siteConfig key '${raw}' is queried in theme / shared UI, but missing in Section 7 table of docs/theme-contract.md.`,
              item: raw,
            });
          }
        }
      }
    }
  }

  return {
    success: failures.length === 0,
    failures,
  };
}

if (require.main === module || process.argv[1]?.includes("check-theme-contract")) {
  const result = checkThemeContract();
  if (result.success) {
    console.log("✅ [THEME CONTRACT CHECK] All theme contract assertions passed! Zero drift detected.");
    process.exit(0);
  } else {
    console.error("❌ [THEME CONTRACT CHECK] Theme contract validation failed with", result.failures.length, "errors:\n");
    for (const f of result.failures) {
      console.error(`  - [${f.category}]: ${f.message}`);
    }
    process.exit(1);
  }
}

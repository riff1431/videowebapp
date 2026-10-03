import fs from "fs";
import path from "path";

function walkRoutes(dir: string, baseRoute = ""): string[] {
  const routes: string[] = [];
  if (!fs.existsSync(dir)) return routes;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        // Route group, does not add to URL segment
        routes.push(...walkRoutes(path.join(dir, entry.name), baseRoute));
      } else {
        const nextBase = `${baseRoute}/${entry.name}`;
        routes.push(...walkRoutes(path.join(dir, entry.name), nextBase));
      }
    } else if (entry.name === "page.tsx" || entry.name === "page.jsx") {
      routes.push(baseRoute === "" ? "/" : baseRoute);
    }
  }

  return Array.from(new Set(routes));
}

export function generateThemeManifest(): Record<string, string[]> {
  const themesDir = path.join(process.cwd(), "src", "app", "themes");
  const manifest: Record<string, string[]> = {};

  if (fs.existsSync(themesDir)) {
    const themeFolders = fs.readdirSync(themesDir, { withFileTypes: true });
    for (const folder of themeFolders) {
      if (folder.isDirectory()) {
        const themeId = folder.name;
        const themePath = path.join(themesDir, themeId);
        manifest[themeId] = walkRoutes(themePath).sort();
      }
    }
  }

  // Also check tests/fixtures/themes if it exists
  const fixturesDir = path.join(process.cwd(), "tests", "fixtures", "themes");
  if (fs.existsSync(fixturesDir)) {
    const fixtureFolders = fs.readdirSync(fixturesDir, { withFileTypes: true });
    for (const folder of fixtureFolders) {
      if (folder.isDirectory()) {
        const themeId = folder.name;
        const themePath = path.join(fixturesDir, themeId);
        manifest[themeId] = walkRoutes(themePath).sort();
      }
    }
  }

  const outDir = path.join(process.cwd(), "src", "config");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, "theme-manifest.json");
  fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`[THEME MANIFEST] Generated route manifest for themes: ${Object.keys(manifest).join(", ")}`);
  return manifest;
}

if (require.main === module || process.argv[1]?.includes("generate-theme-manifest")) {
  generateThemeManifest();
}

import fs from "fs";
import path from "path";
import { generateThemeManifest } from "./generate-theme-manifest";

/**
 * CLI Theme Generator Script
 * Usage: npm run theme:new -- <id> "<Name>"
 *
 * Validates the ID (lowercase letters, digits, hyphen only).
 * Copies themes/youplay including (auth) to themes/<id>.
 * Rewrites [data-theme="youplay"] to [data-theme="<id>"] in theme.css and layout.
 * Adds a registry entry to src/lib/themes.ts (inactive, version 1.0).
 * Regenerates the route manifest.
 * Prints a coverage report and next steps.
 */

async function main() {
  const args = process.argv.slice(2);
  const themeId = args[0]?.trim();
  const themeName = args[1]?.trim() || themeId;

  if (!themeId) {
    console.error("❌ Error: Missing theme ID.");
    console.log('Usage: npm run theme:new -- <id> "<Theme Name>"');
    console.log('Example: npm run theme:new -- darktube "Dark Tube"');
    process.exit(1);
  }

  // 1. Validate ID (lowercase letters, digits, hyphen only)
  if (!/^[a-z0-9-]+$/.test(themeId)) {
    console.error("❌ Error: Theme ID must only contain lowercase letters, numbers, and hyphens (e.g. 'my-new-theme').");
    process.exit(1);
  }

  if (themeId === "youplay" || themeId === "admin" || themeId === "api") {
    console.error(`❌ Error: Theme ID '${themeId}' is reserved.`);
    process.exit(1);
  }

  const themesDir = path.join(process.cwd(), "src", "app", "themes");
  const sourceDir = path.join(themesDir, "youplay");
  const targetDir = path.join(themesDir, themeId);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Theme folder 'src/app/themes/${themeId}' already exists.`);
    process.exit(1);
  }

  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Error: Source theme 'src/app/themes/youplay' not found.`);
    process.exit(1);
  }

  console.log(`🚀 Creating theme '${themeName}' (${themeId})...`);

  // 2. Recursive copy themes/youplay to themes/<id>
  function copyFolderRecursive(src: string, dest: string) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyFolderRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyFolderRecursive(sourceDir, targetDir);
  console.log(`✅ Copied YouPlay template to src/app/themes/${themeId}`);

  // 3. Update theme.css scoping: replace [data-theme="youplay"] with [data-theme="<themeId>"]
  const themeCssPath = path.join(targetDir, "theme.css");
  if (fs.existsSync(themeCssPath)) {
    let css = fs.readFileSync(themeCssPath, "utf-8");
    css = css.replace(/\[data-theme="youplay"\]/g, `[data-theme="${themeId}"]`);
    fs.writeFileSync(themeCssPath, css, "utf-8");
    console.log(`✅ Scoped theme.css to [data-theme="${themeId}"]`);
  }

  // 4. Update layout.tsx shell marker
  const layoutPath = path.join(targetDir, "layout.tsx");
  if (fs.existsSync(layoutPath)) {
    let layout = fs.readFileSync(layoutPath, "utf-8");
    layout = layout.replace(/themeId="youplay"/g, `themeId="${themeId}"`);
    layout = layout.replace(/YouPlayThemeLayout/g, `${themeId.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())}ThemeLayout`);
    fs.writeFileSync(layoutPath, layout, "utf-8");
    console.log(`✅ Configured theme layout for '${themeId}'`);
  }

  // 5. Update src/lib/themes.ts registry
  const themesLibPath = path.join(process.cwd(), "src", "lib", "themes.ts");
  if (fs.existsSync(themesLibPath)) {
    let themesLib = fs.readFileSync(themesLibPath, "utf-8");
    const entry = `  {
    id: "${themeId}",
    name: "${themeName}",
    version: "1.0",
    author: "Custom Author",
    description: "Custom theme based on YouPlay.",
    preview: "/themes/${themeId}.png",
  },
`;
    // Insert before `];` of THEME_REGISTRY
    if (themesLib.includes("export const THEME_REGISTRY: ThemeMeta[] = [") && !themesLib.includes(`id: "${themeId}"`)) {
      themesLib = themesLib.replace(
        "export const THEME_REGISTRY: ThemeMeta[] = [\n",
        `export const THEME_REGISTRY: ThemeMeta[] = [\n${entry}`
      );
      fs.writeFileSync(themesLibPath, themesLib, "utf-8");
      console.log(`✅ Registered theme '${themeId}' in src/lib/themes.ts`);
    }
  }

  // 6. Regenerate Route Manifest
  const manifest = generateThemeManifest();
  const implementedRoutes = manifest[themeId] || [];

  console.log("\n==========================================");
  console.log(`🎉 Theme '${themeName}' (${themeId}) successfully generated!`);
  console.log("==========================================");
  console.log(`📁 Directory: src/app/themes/${themeId}`);
  console.log(`📊 Route Coverage: ${implementedRoutes.length} routes registered.`);
  console.log("\nNext Steps:");
  console.log(`1. Customize styles in: src/app/themes/${themeId}/theme.css`);
  console.log(`2. Override or create pages under: src/app/themes/${themeId}/`);
  console.log(`3. Go to /admin/manage-themes to preview or activate '${themeName}'.`);
  console.log("==========================================\n");
}

main().catch((err) => {
  console.error("Theme generation failed:", err);
  process.exit(1);
});

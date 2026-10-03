import fs from "fs";
import path from "path";
import ts from "typescript";

// Directories to scan
const SCAN_DIRS = ["src/app", "src/components", "src/lib", "src/modules"];

// Output file
const OUTPUT_CSV = "docs/hardcoded-text-report.csv";

interface Finding {
  file: string;
  line: number;
  text: string;
  category: "A" | "B" | "C";
  suggestedSource: string;
}

const findings: Finding[] = [];

// Keywords that indicate Category A (Must be dynamic / admin-editable)
const BRAND_TERMS = [
  "playtube",
  "copyright",
  "all rights reserved",
  "contact us",
  "privacy policy",
  "terms of use",
  "about us",
  "refund terms",
  "admin@playtube",
  "support@playtube",
  "youplay",
];

// Typical generic UI action words (Category B: Should use i18n keys)
const GENERIC_UI_WORDS = [
  "save", "cancel", "upload", "delete", "edit", "submit", "confirm",
  "back", "next", "loading", "search", "filter", "sort", "view all",
  "read more", "sign in", "sign up", "log in", "log out", "subscribe",
  "subscribed", "share", "report", "download", "play", "pause", "trending",
  "popular", "latest", "top", "articles", "shorts", "movies", "dashboard",
  "history", "settings", "password", "email", "username", "category",
  "overview", "views", "comments", "replies", "wallet", "balance",
];

function isAcceptable(text: string, propName?: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return true;
  if (/^[\d\s.,\-+/:()_#%&*=<>?@!]+$/.test(trimmed)) return true; // Only numbers/symbols/punctuation
  if (/^(var\(|http:\/\/|https:\/\/|\/|#|data:)/.test(trimmed)) return true; // CSS vars, URLs, routes
  if (propName === "className" || propName === "style" || propName === "id" || propName === "key" || propName === "type") return true;
  if (propName === "data-testid" || propName?.startsWith("aria-hidden")) return true;
  return false;
}

function classifyText(text: string, propName?: string): { category: "A" | "B" | "C"; suggestedSource: string } {
  const lower = text.toLowerCase().trim();

  // Category C: Developer-facing, console logs, test IDs, SVG paths, tailwind classes
  if (
    lower.startsWith("error:") ||
    lower.startsWith("[") ||
    lower.includes("failed to fetch") ||
    lower.includes("invalid uuid") ||
    lower.includes("console.")
  ) {
    return { category: "C", suggestedSource: "Developer / Internal Debugging" };
  }

  // Category A: Brand names, copyright, SEO, static page names, config limits
  for (const brand of BRAND_TERMS) {
    if (lower.includes(brand)) {
      return { category: "A", suggestedSource: "siteConfig (site_name / seo / footer / terms_pages)" };
    }
  }

  if (
    lower.includes("playtube is the premier") ||
    lower.includes("upload size limit") ||
    lower.includes("upgrade to playtube pro") ||
    lower.includes("standard pro membership")
  ) {
    return { category: "A", suggestedSource: "siteConfig / manage_pro (Admin Dynamic Setting)" };
  }

  // Category B: User-facing UI labels, buttons, form placeholders, empty states
  return { category: "B", suggestedSource: "i18n translation dictionary (language_translations table)" };
}

function processSourceFile(sourceFile: ts.SourceFile, relativePath: string) {
  function visit(node: ts.Node) {
    // 1. JSX Text Nodes
    if (ts.isJsxText(node)) {
      const rawText = node.getText(sourceFile).replace(/\s+/g, " ").trim();
      if (rawText && !isAcceptable(rawText)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const { category, suggestedSource } = classifyText(rawText);
        findings.push({
          file: relativePath,
          line: line + 1,
          text: rawText,
          category,
          suggestedSource,
        });
      }
    }

    // 2. JSX Attributes: placeholder, title, alt, aria-label, label, value
    if (ts.isJsxAttribute(node)) {
      const attrName = ("text" in node.name ? (node.name as any).text : "");
      const targetAttrs = ["placeholder", "title", "alt", "aria-label", "label", "value"];
      if (targetAttrs.includes(attrName) && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) {
          const val = node.initializer.text.trim();
          if (val && !isAcceptable(val, attrName)) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.initializer.getStart());
            const { category, suggestedSource } = classifyText(val, attrName);
            findings.push({
              file: relativePath,
              line: line + 1,
              text: `[${attrName}="${val}"]`,
              category,
              suggestedSource,
            });
          }
        }
      }
    }

    // 3. Metadata export (title, description)
    if (ts.isVariableDeclaration(node) && node.name.getText(sourceFile) === "metadata") {
      if (node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
        for (const prop of node.initializer.properties) {
          if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)) {
            const keyName = prop.name.getText(sourceFile);
            const val = prop.initializer.text.trim();
            const { line } = sourceFile.getLineAndCharacterOfPosition(prop.initializer.getStart());
            findings.push({
              file: relativePath,
              line: line + 1,
              text: `[metadata.${keyName}="${val}"]`,
              category: "A",
              suggestedSource: "siteConfig.seo / siteConfig.site_title",
            });
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== "node_modules" && item.name !== ".next" && item.name !== "dist") {
        getAllFiles(fullPath, fileList);
      }
    } else if (
      item.name.endsWith(".tsx") ||
      item.name.endsWith(".ts") ||
      item.name.endsWith(".jsx") ||
      item.name.endsWith(".js")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function runAudit() {
  console.log("=== Starting AST Hardcoded Text Scan ===");

  let allFiles: string[] = [];
  for (const dir of SCAN_DIRS) {
    allFiles = allFiles.concat(getAllFiles(dir));
  }

  console.log(`Scanning ${allFiles.length} files...`);

  for (const filePath of allFiles) {
    const code = fs.readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(
      filePath,
      code,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
    processSourceFile(sourceFile, relativePath);
  }

  // Generate CSV
  const csvRows = [
    "File,Line,Text,Category,Suggested Source",
    ...findings.map((f) => {
      const cleanText = f.text.replace(/"/g, '""');
      const cleanSource = f.suggestedSource.replace(/"/g, '""');
      return `"${f.file}",${f.line},"${cleanText}","${f.category}","${cleanSource}"`;
    }),
  ];

  fs.mkdirSync(path.dirname(OUTPUT_CSV), { recursive: true });
  fs.writeFileSync(OUTPUT_CSV, csvRows.join("\n"), "utf-8");

  const catA = findings.filter((f) => f.category === "A").length;
  const catB = findings.filter((f) => f.category === "B").length;
  const catC = findings.filter((f) => f.category === "C").length;

  console.log("\n=== Scan Results ===");
  console.log(`Total Findings: ${findings.length}`);
  console.log(`Category A (MUST be dynamic / admin-editable): ${catA}`);
  console.log(`Category B (SHOULD use i18n keys): ${catB}`);
  console.log(`Category C (ACCEPTABLE / Developer-facing): ${catC}`);
  console.log(`\nReport written to: ${OUTPUT_CSV}`);
}

runAudit();

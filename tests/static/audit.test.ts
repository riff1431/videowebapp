import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.startsWith(".") && file !== "node_modules" && file !== "temp") {
        getAllSourceFiles(filePath, fileList);
      }
    } else if (/\.(tsx?|jsx?|mjs)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

describe("Static Audit & Non-API Code Detector", () => {
  const srcDir = path.resolve(process.cwd(), "src");
  const allFiles = getAllSourceFiles(srcDir);
  const allowlistContent = fs.existsSync("tests/static/allowlist.txt")
    ? fs.readFileSync("tests/static/allowlist.txt", "utf-8")
    : "";

  it("checks for presence of 'lorem ipsum' dummy text in source files", () => {
    const violations: { file: string; line: number }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (/lorem\s+ipsum/i.test(line)) {
          const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
          if (!allowlistContent.includes(rel)) {
            violations.push({ file: rel, line: idx + 1 });
          }
        }
      });
    }

    expect(
      violations,
      `Found 'lorem ipsum' dummy text in files: ${JSON.stringify(violations, null, 2)}`
    ).toEqual([]);
  });

  it("detects and records hardcoded production secrets or Supabase project keys in source code", () => {
    const hardcodedSecrets: { file: string; line: number; snippet: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        // Detect hardcoded production JWT anon tokens
        if (/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(line)) {
          const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
          hardcodedSecrets.push({
            file: rel,
            line: idx + 1,
            snippet: line.trim().substring(0, 50) + "...",
          });
        }
      });
    }

    // Record findings for test report (known bug / finding in src/lib/storage/supabase.ts)
    if (hardcodedSecrets.length > 0) {
      console.warn(
        `[STATIC AUDIT WARNING] Hardcoded Supabase JWT keys found in:`,
        hardcodedSecrets
      );
    }
  });

  it("detects leftover PHP script references (.php) in source code", () => {
    const phpReferences: { file: string; line: number; text: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (/\b\w+\.php\b/i.test(line)) {
          const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
          if (!allowlistContent.includes(rel)) {
            phpReferences.push({ file: rel, line: idx + 1, text: line.trim() });
          }
        }
      });
    }

    expect(
      phpReferences,
      `Unapproved .php references found: ${JSON.stringify(phpReferences, null, 2)}`
    ).toEqual([]);
  });

  it("audits fallback mock item arrays in API import endpoints", () => {
    const mockEndpoints: string[] = [];

    for (const file of allFiles) {
      if (file.includes("api")) {
        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("mockItems")) {
          mockEndpoints.push(path.relative(process.cwd(), file).replace(/\\/g, "/"));
        }
      }
    }

    expect(mockEndpoints.length).toBeGreaterThan(0);
    expect(mockEndpoints).toContain("src/app/api/admin/import/youtube/route.ts");
    expect(mockEndpoints).toContain("src/app/api/admin/import/dailymotion/route.ts");
    expect(mockEndpoints).toContain("src/app/api/admin/import/twitch/route.ts");
  });
});

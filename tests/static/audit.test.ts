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

  it("fails if repo contains a remote Supabase project URL other than localhost/127.0.0.1", () => {
    const remoteUrlViolations: { file: string; line: number; match: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        const match = line.match(/https?:\/\/[a-z0-9-]+\.supabase\.co/i);
        if (match) {
          const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
          remoteUrlViolations.push({
            file: rel,
            line: idx + 1,
            match: match[0],
          });
        }
      });
    }

    expect(
      remoteUrlViolations,
      `Hardcoded remote Supabase project URLs found in code: ${JSON.stringify(remoteUrlViolations, null, 2)}`
    ).toEqual([]);
  });

  it("fails if repo contains hardcoded JWT token patterns outside .env files", () => {
    const hardcodedSecrets: { file: string; line: number; snippet: string }[] = [];

    for (const file of allFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        // Detect hardcoded JWT tokens ("eyJ...")
        if (/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/.test(line)) {
          const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
          hardcodedSecrets.push({
            file: rel,
            line: idx + 1,
            snippet: line.trim().substring(0, 40) + "...",
          });
        }
      });
    }

    expect(
      hardcodedSecrets,
      `Hardcoded JWT token patterns found outside .env files: ${JSON.stringify(hardcodedSecrets, null, 2)}`
    ).toEqual([]);
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

  it("audits fallback mock item arrays in API import endpoints and ensures zero mock fallbacks remain", () => {
    const mockEndpoints: string[] = [];

    for (const file of allFiles) {
      if (file.includes("api") && file.includes("import")) {
        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("mockItems")) {
          mockEndpoints.push(path.relative(process.cwd(), file).replace(/\\/g, "/"));
        }
      }
    }

    expect(
      mockEndpoints,
      `Unapproved mock fallback items found in API import routes: ${JSON.stringify(mockEndpoints)}`
    ).toEqual([]);
  });

  it("enforces assertAdmin() as the first statement of every exported function in src/modules/admin/*.actions.ts and src/app/api/admin/**", () => {
    const ts = require("typescript");
    const violations: string[] = [];
    const EXEMPT_ACTIONS = new Set(["reportVideoAction", "reportCopyrightAction"]);

    const adminActionFiles = allFiles.filter((f) => f.includes(path.join("modules", "admin")) && f.endsWith(".actions.ts"));
    const adminRouteFiles = allFiles.filter((f) => f.includes(path.join("app", "api", "admin")) && f.endsWith("route.ts"));

    for (const filePath of [...adminActionFiles, ...adminRouteFiles]) {
      const code = fs.readFileSync(filePath, "utf-8");
      const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

      function inspectNode(node: any) {
        if (ts.isFunctionDeclaration(node) && node.name) {
          const isExported = node.modifiers?.some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword);
          if (isExported) {
            const fnName = node.name.text;
            if (EXEMPT_ACTIONS.has(fnName)) return;

            const body = node.body;
            if (!body || body.statements.length === 0) {
              violations.push(`${relativePath}: Function ${fnName} has empty body without assertAdmin()`);
              return;
            }

            const firstStmt = body.statements[0];
            const firstStmtText = firstStmt.getText(sourceFile);
            if (!firstStmtText.includes("assertAdmin")) {
              const { line } = sourceFile.getLineAndCharacterOfPosition(firstStmt.getStart());
              violations.push(`${relativePath}:${line + 1}: Exported function ${fnName} does NOT call assertAdmin() as first line`);
            }
          }
        }

        if (ts.isVariableStatement(node)) {
          const isExported = node.modifiers?.some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword);
          if (isExported) {
            for (const decl of node.declarationList.declarations) {
              if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) {
                const fnName = decl.name.getText(sourceFile);
                if (EXEMPT_ACTIONS.has(fnName)) continue;

                const body = decl.initializer.body;
                if (ts.isBlock(body)) {
                  if (body.statements.length === 0) {
                    violations.push(`${relativePath}: Function ${fnName} has empty body without assertAdmin()`);
                    continue;
                  }
                  const firstStmt = body.statements[0];
                  const firstStmtText = firstStmt.getText(sourceFile);
                  if (!firstStmtText.includes("assertAdmin")) {
                    const { line } = sourceFile.getLineAndCharacterOfPosition(firstStmt.getStart());
                    violations.push(`${relativePath}:${line + 1}: Exported function ${fnName} does NOT call assertAdmin() as first line`);
                  }
                }
              }
            }
          }
        }

        ts.forEachChild(node, inspectNode);
      }

      inspectNode(sourceFile);
    }

    expect(violations, `Admin authorization violations found:\n${violations.join("\n")}`).toEqual([]);
  });
});

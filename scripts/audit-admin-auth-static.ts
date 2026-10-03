import fs from "fs";
import path from "path";
import ts from "typescript";

const ADMIN_ACTIONS_DIR = path.resolve(process.cwd(), "src/modules/admin");
const ADMIN_API_DIR = path.resolve(process.cwd(), "src/app/api/admin");

// Exceptions: public action functions placed in reports.actions.ts
const EXEMPT_ACTIONS = new Set(["reportVideoAction", "reportCopyrightAction"]);

function checkFile(filePath: string): string[] {
  const code = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const violations: string[] = [];
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  function inspectNode(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        const fnName = node.name.text;
        if (EXEMPT_ACTIONS.has(fnName)) return;

        // Check if first statement in body calls assertAdmin
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
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        for (const decl of node.declarationList.declarations) {
          if (
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
          ) {
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
  return violations;
}

export function auditAdminAuthorization(): string[] {
  const allViolations: string[] = [];

  // 1. Audit src/modules/admin/*.actions.ts
  if (fs.existsSync(ADMIN_ACTIONS_DIR)) {
    const files = fs.readdirSync(ADMIN_ACTIONS_DIR).filter((f) => f.endsWith(".actions.ts"));
    for (const f of files) {
      const violations = checkFile(path.join(ADMIN_ACTIONS_DIR, f));
      allViolations.push(...violations);
    }
  }

  // 2. Audit src/app/api/admin/**/route.ts
  if (fs.existsSync(ADMIN_API_DIR)) {
    function walkDir(dir: string) {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          walkDir(fullPath);
        } else if (item.name === "route.ts") {
          allViolations.push(...checkFile(fullPath));
        }
      }
    }
    walkDir(ADMIN_API_DIR);
  }

  return allViolations;
}

if (require.main === module) {
  const violations = auditAdminAuthorization();
  console.log(`=== Admin Authorization AST Audit ===`);
  if (violations.length === 0) {
    console.log("PASS: All exported admin actions and routes call assertAdmin() as their first line.");
    process.exit(0);
  } else {
    console.error(`FAIL: Found ${violations.length} violations:`);
    violations.forEach((v) => console.error(" - " + v));
    process.exit(1);
  }
}

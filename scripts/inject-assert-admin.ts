import fs from "fs";
import path from "path";
import ts from "typescript";

const ADMIN_ACTIONS_DIR = path.resolve(process.cwd(), "src/modules/admin");
const ADMIN_API_DIR = path.resolve(process.cwd(), "src/app/api/admin");

const EXEMPT_ACTIONS = new Set(["reportVideoAction", "reportCopyrightAction"]);

function injectAssertAdminInActionFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");

  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const insertions: { pos: number; text: string }[] = [];

  function inspectNode(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (isExported) {
        const fnName = node.name.text;
        if (!EXEMPT_ACTIONS.has(fnName) && node.body) {
          // Check if assertAdmin is already the first statement
          const firstStmt = node.body.statements[0];
          if (!firstStmt || !firstStmt.getText(sourceFile).includes("assertAdmin")) {
            insertions.push({
              pos: node.body.getStart(sourceFile) + 1,
              text: "\n  await assertAdmin();",
            });
          }
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
            if (!EXEMPT_ACTIONS.has(fnName)) {
              const body = decl.initializer.body;
              if (ts.isBlock(body)) {
                const firstStmt = body.statements[0];
                if (!firstStmt || !firstStmt.getText(sourceFile).includes("assertAdmin")) {
                  insertions.push({
                    pos: body.getStart(sourceFile) + 1,
                    text: "\n  await assertAdmin();",
                  });
                }
              }
            }
          }
        }
      }
    }

    ts.forEachChild(node, inspectNode);
  }

  inspectNode(sourceFile);

  if (insertions.length > 0) {
    // Sort descending by position to preserve offsets during insertion
    insertions.sort((a, b) => b.pos - a.pos);
    for (const ins of insertions) {
      content = content.slice(0, ins.pos) + ins.text + content.slice(ins.pos);
    }

    // Ensure import is present
    if (!content.includes('import { assertAdmin }')) {
      if (content.startsWith('"use server";')) {
        content = content.replace(
          '"use server";',
          '"use server";\n\nimport { assertAdmin } from "@/lib/auth/assert-admin";'
        );
      } else {
        content = 'import { assertAdmin } from "@/lib/auth/assert-admin";\n' + content;
      }
    }

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`[AST] Injected assertAdmin into ${insertions.length} functions in: ${path.basename(filePath)}`);
  } else {
    // Check if import is present even if no new insertions
    if (!content.includes('import { assertAdmin }')) {
      if (content.startsWith('"use server";')) {
        content = content.replace(
          '"use server";',
          '"use server";\n\nimport { assertAdmin } from "@/lib/auth/assert-admin";'
        );
      } else {
        content = 'import { assertAdmin } from "@/lib/auth/assert-admin";\n' + content;
      }
      fs.writeFileSync(filePath, content, "utf-8");
    }
  }
}

function injectAssertAdminInApiRoute(filePath: string) {
  let content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  const insertions: { pos: number; text: string }[] = [];

  function inspectNode(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const isHttp = ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(node.name.text);
      if (isExported && isHttp && node.body) {
        const firstStmt = node.body.statements[0];
        if (!firstStmt || !firstStmt.getText(sourceFile).includes("assertAdmin")) {
          insertions.push({
            pos: node.body.getStart(sourceFile) + 1,
            text: "\n    await assertAdmin();",
          });
        }
      }
    }
    ts.forEachChild(node, inspectNode);
  }

  inspectNode(sourceFile);

  if (insertions.length > 0) {
    insertions.sort((a, b) => b.pos - a.pos);
    for (const ins of insertions) {
      content = content.slice(0, ins.pos) + ins.text + content.slice(ins.pos);
    }
    if (!content.includes("assertAdmin")) {
      content = 'import { assertAdmin } from "@/lib/auth/assert-admin";\n' + content;
    }
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`[AST] Injected assertAdmin into route: ${path.basename(filePath)}`);
  }
}

// 1. Process all action files in src/modules/admin
const actionFiles = fs.readdirSync(ADMIN_ACTIONS_DIR).filter((f) => f.endsWith(".actions.ts"));
for (const file of actionFiles) {
  injectAssertAdminInActionFile(path.join(ADMIN_ACTIONS_DIR, file));
}

// 2. Process all route files under src/app/api/admin
function walkDir(dir: string, callback: (file: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (entry.name === "route.ts") {
      callback(fullPath);
    }
  }
}

walkDir(ADMIN_API_DIR, (routeFile) => {
  injectAssertAdminInApiRoute(routeFile);
});

console.log("AST Injection complete!");

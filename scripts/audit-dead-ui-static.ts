import fs from "fs";
import path from "path";
import ts from "typescript";

// Directories to scan
const SCAN_DIRS = ["src/app", "src/components"];
const OUTPUT_MD = "docs/dead-ui-static-report.md";

interface DeadElementFinding {
  file: string;
  line: number;
  type: string;
  codeSnippet: string;
  issue: string;
}

const findings: DeadElementFinding[] = [];

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== "node_modules" && item.name !== ".next") {
        getAllFiles(fullPath, fileList);
      }
    } else if (item.name.endsWith(".tsx") || item.name.endsWith(".jsx")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function inspectFile(filePath: string) {
  const code = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  function visit(node: ts.Node) {
    // 1. Check JSX Opening / SelfClosing Elements (<button>, <a>, <form>, etc.)
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);

      // A) Check <button> elements
      if (tagName === "button") {
        let hasOnClick = false;
        let onClickText = "";
        let isInsideForm = false;
        let buttonType = "";

        for (const prop of node.attributes.properties) {
          if (ts.isJsxAttribute(prop)) {
            const attrName = ("text" in prop.name ? (prop.name as any).text : "");
            if (attrName === "onClick") {
              hasOnClick = true;
              onClickText = prop.initializer?.getText(sourceFile) || "";
            }
            if (attrName === "type" && prop.initializer) {
              buttonType = prop.initializer.getText(sourceFile).replace(/['"]/g, "");
            }
          }
        }

        // Empty handler checks: () => {}, () => null, console.log only, TODO only
        if (hasOnClick) {
          const cleanHandler = onClickText.replace(/\s+/g, "");
          if (
            cleanHandler === "{()=>{}}" ||
            cleanHandler === "{()=>null}" ||
            cleanHandler === "{()=>undefined}" ||
            cleanHandler.includes("console.log") ||
            cleanHandler.toLowerCase().includes("todo")
          ) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
            findings.push({
              file: relativePath,
              line: line + 1,
              type: "<button onClick>",
              codeSnippet: node.getText(sourceFile).slice(0, 100),
              issue: `Empty or mock click handler: ${onClickText.slice(0, 60)}`,
            });
          }
        } else if (buttonType !== "submit") {
          // Button without onClick and not explicitly type="submit"
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          // Check if parent has form
          let parent: ts.Node | undefined = node.parent;
          while (parent) {
            if (
              (ts.isJsxOpeningElement(parent) || ts.isJsxSelfClosingElement(parent)) &&
              parent.tagName.getText(sourceFile) === "form"
            ) {
              isInsideForm = true;
              break;
            }
            parent = parent.parent;
          }

          if (!isInsideForm) {
            findings.push({
              file: relativePath,
              line: line + 1,
              type: "<button>",
              codeSnippet: node.getText(sourceFile).slice(0, 100),
              issue: "Button has neither onClick handler nor is inside a form to submit",
            });
          }
        }
      }

      // B) Check <a> links (href="#", href="javascript:void(0)", dead routes)
      if (tagName === "a" || tagName === "Link") {
        for (const prop of node.attributes.properties) {
          if (ts.isJsxAttribute(prop)) {
            const attrName = ("text" in prop.name ? (prop.name as any).text : "");
            if (attrName === "href" && prop.initializer) {
              const hrefVal = prop.initializer.getText(sourceFile).replace(/['"{}]/g, "");
              if (
                hrefVal === "#" ||
                hrefVal === "javascript:void(0)" ||
                hrefVal === "javascript:;" ||
                hrefVal === ""
              ) {
                const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                findings.push({
                  file: relativePath,
                  line: line + 1,
                  type: `<${tagName} href>`,
                  codeSnippet: node.getText(sourceFile).slice(0, 100),
                  issue: `Dead anchor link with dummy href="${hrefVal}"`,
                });
              }
            }
          }
        }
      }

      // C) Check <form> elements
      if (tagName === "form") {
        let hasActionOrSubmit = false;
        for (const prop of node.attributes.properties) {
          if (ts.isJsxAttribute(prop)) {
            const attrName = ("text" in prop.name ? (prop.name as any).text : "");
            if (attrName === "onSubmit" || attrName === "action") {
              hasActionOrSubmit = true;
            }
          }
        }
        if (!hasActionOrSubmit) {
          const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          findings.push({
            file: relativePath,
            line: line + 1,
            type: "<form>",
            codeSnippet: node.getText(sourceFile).slice(0, 100),
            issue: "Form element has neither onSubmit handler nor action attribute",
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function runScan() {
  console.log("=== Running Static Dead UI Scan ===");
  let allFiles: string[] = [];
  for (const dir of SCAN_DIRS) {
    allFiles = allFiles.concat(getAllFiles(dir));
  }
  console.log(`Analyzing ${allFiles.length} TSX components...`);

  for (const f of allFiles) {
    inspectFile(f);
  }

  console.log(`Found ${findings.length} potential dead UI elements.`);

  const mdLines = [
    "# Static Dead UI Scan Findings",
    "",
    `> **Scan Date:** ${new Date().toISOString()}`,
    `> **Total Findings:** ${findings.length}`,
    "",
    "| File | Line | Element Type | Issue / Observed Dead Property | Code Snippet |",
    "|---|---|---|---|---|",
    ...findings.map((f) => {
      const cleanSnippet = f.codeSnippet.replace(/[\r\n]+/g, " ").replace(/\|/g, "\\|").trim();
      return `| [${f.file}](file:///${path.resolve(f.file).replace(/\\/g, "/")}) | ${f.line} | \`${f.type}\` | ${f.issue} | \`${cleanSnippet.slice(0, 60)}\` |`;
    }),
  ];

  fs.mkdirSync(path.dirname(OUTPUT_MD), { recursive: true });
  fs.writeFileSync(OUTPUT_MD, mdLines.join("\n"), "utf-8");
  console.log(`Saved report to ${OUTPUT_MD}`);
}

runScan();

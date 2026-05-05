import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

type ExportEntry = {
  source: string;
  destination: string;
  requiredCustomization: boolean;
  category: "instructions" | "rules" | "quality-gates";
};

const projectRoot = process.cwd();
const targetRoot = path.join(projectRoot, "ai-export");
const filesToExport: ExportEntry[] = [
  { source: "context/AGENTS_CONTEXT.md", destination: "template/context/AGENTS_CONTEXT.md", requiredCustomization: false, category: "instructions" },
  { source: "context/AGENT_REFERENCE.md", destination: "template/context/AGENT_REFERENCE.md", requiredCustomization: true, category: "instructions" },
  { source: "context/DESIGN_SYSTEM.md", destination: "template/context/DESIGN_SYSTEM.md", requiredCustomization: true, category: "instructions" },
  { source: ".cursor/rules/project.mdc", destination: "template/.cursor/rules/project.mdc", requiredCustomization: true, category: "rules" },
  { source: ".cursor/rules/react-patterns.mdc", destination: "template/.cursor/rules/react-patterns.mdc", requiredCustomization: false, category: "rules" },
  { source: ".cursor/rules/typescript.mdc", destination: "template/.cursor/rules/typescript.mdc", requiredCustomization: false, category: "rules" },
  { source: ".github/copilot-instructions.md", destination: "template/.github/copilot-instructions.md", requiredCustomization: true, category: "instructions" },
  { source: "AGENTS.md", destination: "template/AGENTS.md", requiredCustomization: false, category: "instructions" },
  { source: "CLAUDE.md", destination: "template/CLAUDE.md", requiredCustomization: false, category: "instructions" },
  { source: "GEMINI.md", destination: "template/GEMINI.md", requiredCustomization: false, category: "instructions" },
  { source: "package.json", destination: "quality-gates/source-reference/package.json", requiredCustomization: true, category: "quality-gates" },
  { source: "tsconfig.json", destination: "quality-gates/source-reference/tsconfig.json", requiredCustomization: false, category: "quality-gates" },
  { source: "tsconfig.app.json", destination: "quality-gates/source-reference/tsconfig.app.json", requiredCustomization: false, category: "quality-gates" },
  { source: "tsconfig.node.json", destination: "quality-gates/source-reference/tsconfig.node.json", requiredCustomization: false, category: "quality-gates" },
  { source: "eslint.config.js", destination: "quality-gates/source-reference/eslint.config.js", requiredCustomization: true, category: "quality-gates" },
  { source: "vitest.config.ts", destination: "quality-gates/source-reference/vitest.config.ts", requiredCustomization: true, category: "quality-gates" },
  { source: "playwright.config.ts", destination: "quality-gates/source-reference/playwright.config.ts", requiredCustomization: true, category: "quality-gates" },
];

const args = new Set(process.argv.slice(2));
const shouldCheck = args.has("--check");
const shouldClean = !args.has("--no-clean");

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureParentFolder(targetPath: string): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });
}

async function compareFiles(sourcePath: string, destinationPath: string): Promise<boolean> {
  if (!(await pathExists(destinationPath))) {
    return false;
  }
  const [sourceContent, destinationContent] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(destinationPath, "utf8"),
  ]);
  return sourceContent === destinationContent;
}

async function exportFiles(): Promise<void> {
  if (shouldClean) {
    await rm(path.join(targetRoot, "template"), { recursive: true, force: true });
    await rm(path.join(targetRoot, "quality-gates/source-reference"), { recursive: true, force: true });
  }

  for (const entry of filesToExport) {
    const sourcePath = path.join(projectRoot, entry.source);
    const destinationPath = path.join(targetRoot, entry.destination);
    await ensureParentFolder(destinationPath);
    await cp(sourcePath, destinationPath);
  }

  const manifestPath = path.join(targetRoot, "manifest.json");
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        sourceProject: path.basename(projectRoot),
        files: filesToExport,
        usage: {
          export: "npm run ai:export",
          check: "npm run ai:export:check",
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

async function checkFiles(): Promise<void> {
  const mismatches: string[] = [];
  for (const entry of filesToExport) {
    const sourcePath = path.join(projectRoot, entry.source);
    const destinationPath = path.join(targetRoot, entry.destination);
    if (!(await compareFiles(sourcePath, destinationPath))) {
      mismatches.push(`${entry.source} -> ${entry.destination}`);
    }
  }

  if (mismatches.length > 0) {
    console.error("ai-export is out of sync:");
    for (const mismatch of mismatches) {
      console.error(`- ${mismatch}`);
    }
    process.exit(1);
  }

  const manifestPath = path.join(targetRoot, "manifest.json");
  if (!(await pathExists(manifestPath))) {
    console.error("ai-export is missing manifest.json");
    process.exit(1);
  }

  const templateRoot = path.join(targetRoot, "template");
  if (!(await pathExists(templateRoot))) {
    console.error("ai-export/template is missing");
    process.exit(1);
  }
  const templateItems = await readdir(templateRoot);
  if (templateItems.length === 0) {
    console.error("ai-export/template is empty");
    process.exit(1);
  }

  console.log("ai-export is in sync.");
}

if (shouldCheck) {
  await checkFiles();
} else {
  await exportFiles();
  console.log(`Export complete: ${path.relative(projectRoot, targetRoot)}`);
}

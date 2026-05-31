import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANTTI_SKILL } from "./skill.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Agent detection
// ---------------------------------------------------------------------------

export interface DetectedAgent {
  id: string;
  name: string;
}

function commandExists(cmd: string): boolean {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function dirExists(p: string): boolean {
  try {
    return existsSync(p);
  } catch {
    return false;
  }
}

export function detectAgents(): DetectedAgent[] {
  const found: DetectedAgent[] = [];

  if (commandExists("claude")) {
    found.push({ id: "claude-code", name: "Claude Code" });
  }

  if (commandExists("codex")) {
    found.push({ id: "codex", name: "Codex" });
  }

  if (commandExists("code")) {
    found.push({ id: "vscode", name: "VS Code" });
  }

  if (commandExists("pi")) {
    found.push({ id: "pi", name: "Pi" });
  }

  return found;
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

function getClaudeConfigDir(): string {
  return process.env["CLAUDE_CONFIG_DIR"] ?? join(homedir(), ".claude");
}

// ---------------------------------------------------------------------------
// JSONC-tolerant settings merge
// ---------------------------------------------------------------------------

function stripJsonComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "");
}

function readJsonFile(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(stripJsonComments(readFileSync(path, "utf8"))) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeJsonFile(path: string, data: Record<string, unknown>): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ---------------------------------------------------------------------------
// MCP server entry (written into agent settings)
// ---------------------------------------------------------------------------

const MCP_ENTRY = {
  command: "antti-mcp",
  type: "stdio"
};

function writeMcpEntry(settingsPath: string, key: string): void {
  const settings = readJsonFile(settingsPath);
  const servers = (settings["mcpServers"] as Record<string, unknown> | undefined) ?? {};
  servers[key] = MCP_ENTRY;
  settings["mcpServers"] = servers;
  writeJsonFile(settingsPath, settings);
}

// ---------------------------------------------------------------------------
// Skill injection (CLAUDE.md / AGENTS.md / rule files)
// ---------------------------------------------------------------------------

const SKILL_MARKER = "<!-- antti-stack-skill -->";

function skillBlock(): string {
  return `\n${SKILL_MARKER}\n## Antti Stack\n\n${ANTTI_SKILL}\n${SKILL_MARKER}\n`;
}

function writeSkillToMd(mdPath: string, force: boolean): boolean {
  const existing = existsSync(mdPath) ? readFileSync(mdPath, "utf8") : "";
  if (existing.includes(SKILL_MARKER)) {
    if (!force) return false; // already installed
    const stripped = existing.replace(new RegExp(`${SKILL_MARKER}[\\s\\S]*?${SKILL_MARKER}\n?`, "g"), "");
    writeFileSync(mdPath, stripped + skillBlock(), "utf8");
  } else {
    mkdirSync(dirname(mdPath), { recursive: true });
    writeFileSync(mdPath, existing + skillBlock(), "utf8");
  }
  return true;
}

// ---------------------------------------------------------------------------
// Per-agent setup
// ---------------------------------------------------------------------------

function setupClaudeCode(force: boolean): string[] {
  const configDir = getClaudeConfigDir();
  const settingsPath = join(configDir, "settings.json");
  const mdPath = join(configDir, "CLAUDE.md");
  const hooksDir = join(configDir, "hooks");
  const steps: string[] = [];

  writeMcpEntry(settingsPath, "antti-stack");
  steps.push(`MCP configured → ${settingsPath}`);

  const written = writeSkillToMd(mdPath, force);
  steps.push(written ? `Skill written → ${mdPath}` : `Skill already present in ${mdPath} (use --force to overwrite)`);

  const hookSteps = installHooks(hooksDir, settingsPath, force);
  steps.push(...hookSteps);

  return steps;
}

function installHooks(hooksDir: string, settingsPath: string, force: boolean): string[] {
  const steps: string[] = [];
  const srcHooksDir = join(__dirname, "hooks");

  const hooks: Array<{ src: string; dest: string; event: string }> = [
    { src: join(srcHooksDir, "antti-activate.js"), dest: join(hooksDir, "antti-activate.js"), event: "SessionStart" },
    { src: join(srcHooksDir, "antti-mode-tracker.js"), dest: join(hooksDir, "antti-mode-tracker.js"), event: "UserPromptSubmit" }
  ];

  mkdirSync(hooksDir, { recursive: true });

  for (const { src, dest, event } of hooks) {
    if (!existsSync(src)) {
      steps.push(`Hook source not found: ${src}`);
      continue;
    }
    if (!existsSync(dest) || force) {
      copyFileSync(src, dest);
      steps.push(`Hook installed → ${dest}`);
    } else {
      steps.push(`Hook already present → ${dest} (use --force to overwrite)`);
    }
  }

  // Register hooks in settings.json
  const settings = readJsonFile(settingsPath);
  const hooksEntry = (settings["hooks"] as Record<string, unknown> | undefined) ?? {};
  let changed = false;

  for (const { dest, event } of hooks) {
    const existing = hooksEntry[event];
    if (!existing || force) {
      hooksEntry[event] = [{ type: "command", command: `node ${dest}` }];
      changed = true;
    }
  }

  if (changed) {
    settings["hooks"] = hooksEntry;
    writeJsonFile(settingsPath, settings);
    steps.push(`Hooks registered in ${settingsPath}`);
  }

  // Write compact skill as text file alongside hooks for the activate hook to find
  const compactSkillDest = join(hooksDir, "antti-skill-compact.txt");
  if (!existsSync(compactSkillDest) || force) {
    writeFileSync(compactSkillDest, ANTTI_SKILL, "utf8");
    steps.push(`Compact skill cached → ${compactSkillDest}`);
  }

  // Install and register the statusline script
  const isWin = process.platform === "win32";
  const statuslineSrc = join(srcHooksDir, isWin ? "antti-statusline.ps1" : "antti-statusline.sh");
  const statuslineDest = join(hooksDir, isWin ? "antti-statusline.ps1" : "antti-statusline.sh");

  if (existsSync(statuslineSrc)) {
    if (!existsSync(statuslineDest) || force) {
      copyFileSync(statuslineSrc, statuslineDest);
      steps.push(`Statusline script installed → ${statuslineDest}`);
    }

    const freshSettings = readJsonFile(settingsPath);
    const statuslineCmd = isWin
      ? `powershell -NonInteractive -File "${statuslineDest}"`
      : statuslineDest;

    if (!freshSettings["statusline"] || force) {
      freshSettings["statusline"] = statuslineCmd;
      writeJsonFile(settingsPath, freshSettings);
      steps.push(`Statusline registered → ${statuslineCmd}`);
    }
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Per-repo rule files (--init)
// ---------------------------------------------------------------------------

export function writePerRepoFiles(targetDir: string, force: boolean): string[] {
  const steps: string[] = [];

  const files: Array<{ path: string; label: string }> = [
    { path: join(targetDir, "AGENTS.md"), label: "AGENTS.md (Codex, Pi)" },
    { path: join(targetDir, "SYSTEM.md"), label: "SYSTEM.md (Pi)" },
    { path: join(targetDir, ".github", "copilot-instructions.md"), label: ".github/copilot-instructions.md (VS Code Copilot)" }
  ];

  for (const { path: filePath, label } of files) {
    const written = writeSkillToMd(filePath, force);
    steps.push(written ? `Written → ${label}` : `Already present → ${label} (use --force)`);
  }

  return steps;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export interface SetupOptions {
  init: boolean;
  force: boolean;
  targetDir?: string;
}

export function runSetup(options: SetupOptions): void {
  const { init, force, targetDir = process.cwd() } = options;

  console.log("Detecting agent CLIs...");
  const agents = detectAgents();

  if (agents.length === 0) {
    console.log("  No supported agent CLIs detected.");
    console.log("  Supported: Claude Code (claude), Cursor (cursor), Codex (codex), VS Code (code)");
  } else {
    for (const a of agents) console.log(`  ✓ ${a.name}`);
  }

  for (const agent of agents) {
    console.log(`\nSetting up ${agent.name}...`);
    let steps: string[] = [];

    if (agent.id === "claude-code") steps = setupClaudeCode(force);
    else steps = [`Use --init to write per-repo rule files for ${agent.name}`];

    for (const s of steps) console.log(`  ✓ ${s}`);
  }

  if (init) {
    console.log(`\nWriting per-repo rule files to ${targetDir}...`);
    const steps = writePerRepoFiles(targetDir, force);
    for (const s of steps) console.log(`  ✓ ${s}`);
  } else {
    console.log("\nRun with --init to also write per-repo rule files to the current directory.");
  }

  console.log("\nDone. Restart your agent session to activate.");
  console.log("The antti-stack MCP exposes: get_meme_templates, caption_meme, memory_search, memory_add");
  if (!existsSync(join(getClaudeConfigDir(), ".antti", "imgflip.json"))) {
    console.log("Tip: run 'antti meme --template <id> <text>' once to save your imgflip credentials.");
  }
}

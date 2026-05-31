#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Command } from "commander";
import {
  ANTTI_MODES,
  generate,
  isAnttiMode,
  runCodec,
  type AgentAnalysis,
  type AgentResponse,
  type AnttiMode
} from "./agent.js";
import type { SatireDirection } from "./codec.js";
import { compress } from "./compress.js";
import { convertCasing, formatCasingResult, CASING_STYLES } from "./casing.js";
import { analyzeDataPlatform, formatDataPlatformAnalysis } from "./data-platform.js";
import { addManualMemory, addMemory, listMemory, searchMemory, type MemoryCategory } from "./memory.js";
import { captionMeme, formatMemeResult, selectMemeTemplate } from "./meme.js";
import { fetchMemeTemplates } from "./meme-templates.js";
import { plan } from "./plan.js";
import { listConfiguredModels } from "./models.js";
import { runSetup } from "./setup.js";
import { compareSpecs, formatDeltaSpec, formatSpec, generateSpec, type OpenSpecDocument } from "./spec.js";

const AGENT_RESPONSE_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "AgentResponse",
  description: "Stable JSON contract for all Antti Stack generate() calls. Used by CLI, MCP, and website demos.",
  type: "object",
  required: ["mode", "output", "warnings", "analysis"],
  properties: {
    mode: { type: "string", enum: ANTTI_MODES },
    output: { type: "string" },
    warnings: { type: "array", items: { type: "string" } },
    analysis: {
      type: "object",
      required: ["fog", "erpFindings", "relations", "emotionalWeather", "enterpriseGravity", "governance", "architecture", "memeSuggestion"],
      properties: {
        fog: { type: "array", items: { type: "object", properties: { phrase: { type: "string" }, replacement: { type: "string" }, severity: { type: "string", enum: ["low", "medium", "high"] } } } },
        erpFindings: { type: "array", items: { type: "object", properties: { signal: { type: "string" }, reason: { type: "string" }, confidence: { type: "string" } } } },
        relations: { type: "array", items: { type: "object", properties: { left: { type: "string" }, right: { type: "string" }, hypothesis: { type: "string" }, confidence: { type: "string" } } } },
        emotionalWeather: { type: "array", items: { type: "object", properties: { signal: { type: "string" }, hypothesis: { type: "string" }, confidence: { type: "string" }, evidence: { type: "array", items: { type: "string" } }, operationalImpact: { type: "string" } } } },
        enterpriseGravity: { type: "array", items: { type: "object", properties: { signal: { type: "string" }, observation: { type: "string" }, confidence: { type: "string" }, partnerSafeJoke: { type: "string" }, operationalImpact: { type: "string" }, evidence: { type: "array", items: { type: "string" } } } } },
        governance: { type: "object", properties: { decision: { type: "string" }, risks: { type: "array", items: { type: "string" } }, actionPoints: { type: "array", items: { type: "string" } } } },
        architecture: { type: "object", properties: { title: { type: "string" }, diagram: { type: "string" }, realityCheck: { type: "string" } } },
        memeSuggestion: { type: "object", properties: { memeId: { type: "string" }, memeName: { type: "string" }, text0: { type: "string" }, text1: { type: "string" } } }
      }
    }
  }
} as const;

const program = new Command();

program
  .name("antti")
  .description("Antti Stack: enterprise absurdity, compressed into usable output.")
  .version("0.1.0");

const defaultMemoryPath = ".antti/memory.jsonl";

program
  .command("memory")
  .description("inspect local Antti memory")
  .argument("[query...]", "optional search query")
  .option("--path <path>", "memory JSONL path", defaultMemoryPath)
  .option("--json", "emit memory records as JSON")
  .option("--format <format>", "memory output format: text | json", "text")
  .option("--category <category>", "filter by category: corporate_fog | enterprise_gravity | emotional_weather | erp_archaeology | decision_fossils | satire_fixtures | reviewer_notes | general")
  .action((queryParts: string[], options: MemoryOptions) => {
    const query = queryParts.join(" ").trim();
    const category = options.category as MemoryCategory | undefined;
    const records = query ? searchMemory(options.path, query, category) : listMemory(options.path, category);
    if (Boolean(options.json) || options.format === "json") {
      console.log(JSON.stringify(records, null, 2));
      return;
    }
    if (records.length === 0) {
      console.log("No memory found. The organization has achieved temporary innocence.");
      return;
    }
    console.log(records.map(formatMemoryRecord).join("\n\n"));
  });

program
  .command("memory-add")
  .description("add a manual note to local Antti memory (decisions, observations, gravity patterns)")
  .argument("<text...>", "note text to store")
  .option("--path <path>", "memory JSONL path", defaultMemoryPath)
  .option("--category <category>", "memory category", "general")
  .option("--tag <tags...>", "additional tags")
  .option("--json", "emit the stored record as JSON")
  .action((textParts: string[], options: { path: string; category: string; tag?: string[]; json?: boolean }) => {
    const text = textParts.join(" ").trim();
    if (!text) {
      console.error("No text provided. Nothing was stored.");
      process.exitCode = 1;
      return;
    }
    const record = addManualMemory({
      path: options.path,
      text,
      category: options.category as MemoryCategory,
      tags: options.tag
    });
    if (options.json) {
      console.log(JSON.stringify(record, null, 2));
      return;
    }
    console.log(`Stored in ${options.category}: ${record.outputSummary.slice(0, 80)}${record.outputSummary.length > 80 ? "..." : ""}`);
  });

program
  .command("meme")
  .description("generate an imgflip meme — use --list to browse templates, then pass the ID and caption boxes")
  .argument("[boxes...]", "caption text for each box in order (e.g. \"top text\" \"bottom text\")")
  .option("--list", "fetch and print the top 100 templates from imgflip.com/popular-meme-ids")
  .option("--template <id>", "imgflip template ID to caption (required unless --list)")
  .option("--json", "emit result as JSON")
  .option("--no-url", "skip the imgflip API call and print captions only")
  .option("--no-save-env", "prompt for missing imgflip credentials but do not save them to the user environment")
  .action(async function (this: Command, boxes: string[]) {
    const options = this.opts<{ list?: boolean; template?: string; json?: boolean; url?: boolean; saveEnv?: boolean }>();
    const wantsJson = options.json === true || process.argv.includes("--json");

    if (options.list) {
      let templates: Awaited<ReturnType<typeof fetchMemeTemplates>>;
      try {
        templates = await fetchMemeTemplates();
      } catch (err) {
        console.error(`Could not fetch templates: ${err instanceof Error ? err.message : err}`);
        process.exitCode = 1;
        return;
      }
      if (wantsJson) {
        console.log(JSON.stringify(templates, null, 2));
      } else {
        console.log(templates.map((t, i) => `${String(i + 1).padStart(3)}  ${t.id}  ${t.name}${t.altName ? `  (${t.altName})` : ""}`).join("\n"));
      }
      return;
    }

    if (!options.template) {
      console.error("--template <id> is required. Use --list to browse available templates.");
      process.exitCode = 1;
      return;
    }

    if (boxes.length === 0) {
      console.error("Provide at least one caption box as an argument.");
      process.exitCode = 1;
      return;
    }

    let templateName = options.template;
    try {
      const found = (await fetchMemeTemplates()).find((t) => t.id === options.template);
      if (found) templateName = found.name;
    } catch { /* use ID as name */ }

    const wantsUrl = options.url !== false && !process.argv.includes("--no-url");
    const saveEnv = options.saveEnv !== false && !process.argv.includes("--no-save-env");

    if (!wantsUrl) {
      const preview = { templateId: options.template, templateName, boxes };
      if (wantsJson) {
        console.log(JSON.stringify(preview, null, 2));
      } else {
        console.log([`Meme: ${templateName}`, ...boxes.map((b, i) => `text${i}: ${b}`)].join("\n"));
      }
      return;
    }

    loadImgflipCredentials();
    if (!process.env["IMGFLIP_USERNAME"] || !process.env["IMGFLIP_PASSWORD"]) {
      if (!wantsJson && process.stdin.isTTY && process.stderr.isTTY) {
        await promptForImgflipCredentials(saveEnv);
      }
    }

    const memeResult = await captionMeme(options.template, templateName, boxes);
    if (wantsJson) {
      console.log(JSON.stringify(memeResult, null, 2));
    } else {
      const lines = [`Meme: ${memeResult.memeName}`, ...boxes.map((b, i) => `text${i}: ${b}`)];
      if (memeResult.memeUrl) lines.push(`URL: ${memeResult.memeUrl}`);
      else if (memeResult.fallbackReason) lines.push(`URL: (unavailable — ${memeResult.fallbackReason})`);
      console.log(lines.join("\n"));
    }
  });

program
  .command("spec")
  .description("run the full Antti pipeline and produce an OpenSpec document — satire is the source of truth, requirements are derived from it")
  .argument("[input...]", "workplace problem or goal to specify")
  .option("--json", "emit the full SpecDocument as JSON instead of Markdown")
  .option("--compare <file>", "compare against a previous spec JSON file and emit a delta")
  .action((inputParts: string[], options: { json?: boolean; compare?: string }) => {
    const input = inputParts.join(" ").trim() || "enterprise alignment";
    const result = generate({ mode: "diagnose", input, intensity: "default" });
    const planResult = plan(input);
    const doc = generateSpec(input, result.analysis, planResult.tasks, planResult.acceptanceCriteria);

    if (options.compare) {
      const previous = JSON.parse(readFileSync(options.compare, "utf8")) as OpenSpecDocument;
      const delta = compareSpecs(previous, doc);
      if (options.json) {
        console.log(JSON.stringify(delta, null, 2));
      } else {
        console.log(formatDeltaSpec(delta));
      }
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(doc, null, 2));
      return;
    }
    console.log(formatSpec(doc));
  });

program
  .command("depress")
  .description("compress agent context by stripping ceremony before passing or storing it")
  .argument("[input...]", "agent context, prompt, note, or tool output to depress")
  .option("--json", "emit result as JSON")
  .action((inputParts: string[], options: { json?: boolean }) => {
    const input = inputParts.join(" ").trim() || "enterprise alignment going forward";
    const result = compress(input);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(result.compressed);
    console.log("");
    console.log(result.report);
    if (result.memeSuggestion) {
      console.log(`\nMeme suggestion: ${result.memeSuggestion.memeName} — "${result.memeSuggestion.text0}" / "${result.memeSuggestion.text1}"`);
    }
  });

program
  .command("plan")
  .description("convert a vague enterprise ask into tasks with acceptance criteria (proof-not-press)")
  .argument("[goal...]", "goal or spec to plan")
  .option("--json", "emit result as JSON")
  .action((goalParts: string[], options: { json?: boolean }) => {
    const goal = goalParts.join(" ").trim() || "define the actual work";
    const result = plan(goal);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(result.report);
  });

program
  .command("casing")
  .description("convert an identifier to a desired casing style with mockery for wrong technology choices")
  .argument("<name>", "identifier to convert")
  .requiredOption("--style <style>", `casing style: ${CASING_STYLES.join(" | ")}`)
  .option("--context <context>", "technology context: sql, python, react, css, kubernetes, environment_variable, powerbi, sap, rest_api, javascript — or plain text description")
  .option("--json", "emit full CasingResult as JSON")
  .action((name: string, options: { style: string; context?: string; json?: boolean }) => {
    if (!CASING_STYLES.includes(options.style as never)) {
      console.error(`Unknown style "${options.style}". Valid styles: ${CASING_STYLES.join(", ")}`);
      process.exitCode = 1;
      return;
    }
    const result = convertCasing(name, options.style as Parameters<typeof convertCasing>[1], options.context);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(formatCasingResult(result));
  });

program
  .command("dataplatform")
  .description("detect data platform signals and return satirically accurate commentary on decision drivers, vendor promises, and billing surprises")
  .argument("[input...]", "describe your data platform situation or stack")
  .option("--json", "emit full DataPlatformAnalysis as JSON")
  .action((inputParts: string[], options: { json?: boolean }) => {
    const input = inputParts.join(" ").trim() || "we need a modern data platform";
    const result = analyzeDataPlatform(input);
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(formatDataPlatformAnalysis(result));
  });

program
  .command("schema")
  .description("emit the AgentResponse JSON schema for integrations")
  .action(() => {
    console.log(JSON.stringify(AGENT_RESPONSE_SCHEMA, null, 2));
  });

program
  .argument("[input...]", "workplace material to process")
  .option("-m, --mode <mode>", ANTTI_MODES.join(" | "), "diagnose")
  .option("--safe", "reduce sarcasm for professional contexts")
  .option("--more-edge", "increase sarcasm without attacking people")
  .option("--json", "emit the full agent response as JSON")
  .option("--analyze", "print the agentic tool analysis before the generated output")
  .option("--direction <direction>", "codec direction: reduce | induce", "reduce")
  .option("--remember", "store the generated response in local memory")
  .option("--memory-path <path>", "memory JSONL path", defaultMemoryPath)
  .action((inputParts: string[], options: CliOptions) => {
    if (inputParts.length === 0) {
      program.help();
      return;
    }

    const mode = parseMode(options.mode);
    const input = inputParts.join(" ");
    const intensity = options.safe ? "safe" : options.moreEdge ? "more-edge" : "default";

    if (mode === "codec") {
      const direction = parseCodecDirection(options.direction);
      const result = runCodec(direction, input, intensity);
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }
      console.log(formatCodecResult(result));
      return;
    }

    const result = generate({ mode, input, intensity });

    if (options.remember) {
      addMemory({ path: options.memoryPath, input, response: result });
    }

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    printWarnings(result);

    if (options.analyze) {
      console.log(formatAnalysis(result.analysis));
      console.log("\n---\n");
    }

    console.log(result.output);
  });

program
  .command("setup")
  .description("detect installed agent CLIs and configure the Antti Stack MCP + skill for each")
  .option("--init", "write per-repo rule files: AGENTS.md (Codex/Pi), SYSTEM.md (Pi), .github/copilot-instructions.md (VS Code Copilot)")
  .option("--force", "overwrite existing skill blocks and MCP entries")
  .action((options: { init?: boolean; force?: boolean }) => {
    runSetup({ init: options.init ?? false, force: options.force ?? false });
  });

program
  .command("models")
  .description("show model configuration — setup runs automatically at the start of an agent session")
  .action(() => {
    listConfiguredModels();
  });

program.parse();

interface CliOptions {
  mode: string;
  safe?: boolean;
  moreEdge?: boolean;
  json?: boolean;
  analyze?: boolean;
  direction: string;
  remember?: boolean;
  memoryPath: string;
}

interface MemoryOptions {
  path: string;
  json?: boolean;
  format: "text" | "json";
  category?: string;
}

function parseMode(mode: string): AnttiMode {
  if (isAnttiMode(mode)) {
    return mode;
  }

  console.error(`Unknown mode "${mode}". Valid modes: ${ANTTI_MODES.join(", ")}`);
  process.exitCode = 1;
  throw new Error(`Unknown mode: ${mode}`);
}

function printWarnings(result: AgentResponse): void {
  if (result.warnings.length === 0) {
    return;
  }

  console.error(result.warnings.map((warning) => `[warning] ${warning}`).join("\n"));
  console.error("");
}

function parseCodecDirection(direction: string): SatireDirection {
  if (direction === "reduce" || direction === "induce") {
    return direction;
  }

  console.error(`Unknown codec direction "${direction}". Valid directions: reduce, induce`);
  process.exitCode = 1;
  throw new Error(`Unknown codec direction: ${direction}`);
}

function formatCodecResult(result: ReturnType<typeof runCodec>): string {
  return [
    `normalizedText: ${result.normalizedText}`,
    `styledText: ${result.styledText}`,
    `extractedFacts: ${result.extractedFacts.join(" | ")}`,
    `removedStyleMarkers: ${result.removedStyleMarkers.join(" | ")}`,
    `warnings: ${result.warnings.join(" | ")}`,
    `riskLabels: ${result.riskLabels.join(" | ")}`
  ].join("\n");
}

function formatMemoryRecord(record: ReturnType<typeof listMemory>[number]): string {
  const tagSignals: Record<string, string> = {
    enterprise_gravity: "excel_as_production",
    corporate_fog: "trust_gap",
    emotional_weather: "status_anxiety",
    erp_archaeology: "excel_as_production",
    decision_fossils: "ownership_avoidance"
  };
  const gravityTag = record.tags.find((t) => t in tagSignals);
  const memeLine = gravityTag
    ? (() => {
        const m = selectMemeTemplate(
          { gravitySignals: [tagSignals[gravityTag] ?? ""], emotionSignals: [] },
          record.mode
        );
        return `meme: ${m.memeName} — "${m.text0}"`;
      })()
    : undefined;

  return [
    `${record.timestamp} | ${record.mode} | ${record.category ?? "general"} | ${record.tags.join(", ")}`,
    `input: ${record.input}`,
    `summary: ${record.outputSummary}`,
    record.warnings.length > 0 ? `warnings: ${record.warnings.join(" | ")}` : undefined,
    memeLine
  ].filter(Boolean).join("\n");
}

function formatAnalysis(analysis: AgentAnalysis): string {
  return [
    formatSection(
      "Banalizer",
      analysis.fog.map((finding) => `${finding.phrase} -> ${finding.replacement} (${finding.severity})`)
    ),
    formatSection(
      "ERP Archaeologist",
      analysis.erpFindings.map((finding) => `${finding.signal}: ${finding.reason}`)
    ),
    formatSection(
      "Datapoint Relator",
      analysis.relations.map((relation) => `${relation.left} <-> ${relation.right}: ${relation.hypothesis}`)
    ),
    formatSection("Governance Theatre", [
      analysis.governance.decision,
      ...analysis.governance.actionPoints.map((point) => `action: ${point}`)
    ]),
    `Architecture Box Renderer:\n${analysis.architecture.diagram}`
  ].join("\n\n");
}

function formatSection(title: string, rows: string[]): string {
  if (rows.length === 0) {
    return `${title}:\n- Nothing obvious. This is either fine or merely undocumented.`;
  }

  return `${title}:\n${rows.map((row) => `- ${row}`).join("\n")}`;
}

function getImgflipConfigPath(): string {
  return join(homedir(), ".antti", "imgflip.json");
}

function loadImgflipCredentials(): void {
  const configPath = getImgflipConfigPath();
  if (!existsSync(configPath)) return;
  try {
    const data = JSON.parse(readFileSync(configPath, "utf8")) as { username?: string; password?: string };
    if (data.username && !process.env["IMGFLIP_USERNAME"]) process.env["IMGFLIP_USERNAME"] = data.username;
    if (data.password && !process.env["IMGFLIP_PASSWORD"]) process.env["IMGFLIP_PASSWORD"] = data.password;
  } catch {
    // corrupted config — ignore
  }
}

function saveImgflipCredentials(username: string, password: string): void {
  const configPath = getImgflipConfigPath();
  try {
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, JSON.stringify({ username, password }, null, 2), "utf8");
  } catch {
    // ignore write failure
  }
}

async function promptForImgflipCredentials(saveEnv: boolean): Promise<void> {
  console.error("Imgflip credentials are needed to generate a real meme URL.");
  console.error("They will be used for this request. By default they are also saved to your user environment for future terminals.");

  const rl = createInterface({ input: process.stdin, output: process.stderr });
  try {
    const username = (await rl.question("IMGFLIP_USERNAME: ")).trim();
    const password = await questionHidden("IMGFLIP_PASSWORD: ");

    if (!username || !password) {
      console.error("Imgflip credentials were not provided. Printing the meme template without a URL.");
      return;
    }

    process.env["IMGFLIP_USERNAME"] = username;
    process.env["IMGFLIP_PASSWORD"] = password;

    if (saveEnv) {
      saveImgflipCredentials(username, password);
      persistUserEnv("IMGFLIP_USERNAME", username);
      persistUserEnv("IMGFLIP_PASSWORD", password);
      console.error(`Saved credentials to ${getImgflipConfigPath()} and user environment.`);
      console.error("Credentials will be available immediately in this and all future terminals.");
    }
  } finally {
    rl.close();
  }
}

async function questionHidden(prompt: string): Promise<string> {
  const input = process.stdin;
  const output = process.stderr;

  if (!input.isTTY || !output.isTTY) {
    const rl = createInterface({ input, output });
    try {
      return await rl.question(prompt);
    } finally {
      rl.close();
    }
  }

  return new Promise((resolve) => {
    let value = "";
    output.write(prompt);
    input.setRawMode(true);
    input.resume();

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
    };

    const onData = (chunk: Buffer) => {
      const char = chunk.toString("utf8");
      if (char === "\u0003") {
        cleanup();
        process.exit(130);
      }
      if (char === "\r" || char === "\n") {
        output.write("\n");
        cleanup();
        resolve(value);
        return;
      }
      if (char === "\b" || char === "\u007f") {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };

    input.on("data", onData);
  });
}

function persistUserEnv(name: string, value: string): void {
  if (process.platform === "win32") {
    execFileSync("setx", [name, value], { stdio: "ignore" });
    return;
  }

  console.error(`To persist ${name}, add it to your shell profile. This platform was not modified automatically.`);
}

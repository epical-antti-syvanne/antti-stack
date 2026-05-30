import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { banalize, generate, runCodec, type AnttiIntensity, type AnttiMode } from "./agent.js";
import type { SatireDirection } from "./codec.js";
import { compress } from "./compress.js";
import { analyzeEmotionalWeather } from "./emotion.js";
import { analyzeEnterpriseGravity } from "./enterprise-gravity.js";
import { addContextMemory, searchMemory } from "./memory.js";
import { generateMemeUrl } from "./meme.js";
import { plan } from "./plan.js";
import { compareSpecs, formatDeltaSpec, formatSpec, generateSpec, type OpenSpecDocument } from "./spec.js";

const intensitySchema = z.enum(["safe", "default", "more-edge"]).default("default");
const modeSchema = z.enum([
  "post",
  "comment",
  "banalizer",
  "romcom",
  "archaeology",
  "governance",
  "architecture",
  "diagnose",
  "ideas",
  "desatirize",
  "satirize",
  "codec",
  "compress",
  "plan"
]);

export function createAnttiMcpServer(): McpServer {
  const server = new McpServer({
    name: "antti-stack",
    version: "0.1.0"
  });

  server.registerTool(
    "generate",
    {
      title: "Generate Antti output",
      description: "Generate Antti Stack output for a mode and input.",
      inputSchema: {
        mode: modeSchema.default("post"),
        input: z.string().min(1),
        intensity: intensitySchema
      }
    },
    ({ mode, input, intensity }) => jsonTool(generate({ mode: mode as AnttiMode, input, intensity: intensity as AnttiIntensity }))
  );

  server.registerTool(
    "diagnose",
    {
      title: "Diagnose workplace input",
      description: "Run the full diagnostic stack: fog, ERP, relations, emotional weather, enterprise gravity, governance, architecture.",
      inputSchema: {
        input: z.string().min(1),
        intensity: intensitySchema
      }
    },
    ({ input, intensity }) => jsonTool(generate({ mode: "diagnose", input, intensity: intensity as AnttiIntensity }))
  );

  server.registerTool(
    "satirize",
    {
      title: "Induce Antti-style tone",
      description: "Apply controlled Antti-style satire to plain operational meaning without inventing facts.",
      inputSchema: {
        input: z.string().min(1),
        intensity: intensitySchema
      }
    },
    ({ input, intensity }) => jsonTool(generate({ mode: "satirize", input, intensity: intensity as AnttiIntensity }))
  );

  server.registerTool(
    "desatirize",
    {
      title: "Reduce styled text",
      description: "Normalize corporate or satirical formatting into plain operational meaning.",
      inputSchema: {
        input: z.string().min(1),
        intensity: intensitySchema
      }
    },
    ({ input, intensity }) => jsonTool(generate({ mode: "desatirize", input, intensity: intensity as AnttiIntensity }))
  );

  server.registerTool(
    "codec",
    {
      title: "Run Satire Codec",
      description: "Run the bidirectional codec directly and return structured transformation metadata.",
      inputSchema: {
        direction: z.enum(["reduce", "induce"]),
        input: z.string().min(1),
        intensity: intensitySchema
      }
    },
    ({ direction, input, intensity }) => jsonTool(runCodec(direction as SatireDirection, input, intensity as AnttiIntensity))
  );

  server.registerTool(
    "banalize",
    {
      title: "Banalize corporate language",
      description: "Reduce corporate fog into plainer operational meaning.",
      inputSchema: {
        input: z.string().min(1),
        intensity: intensitySchema
      }
    },
    ({ input, intensity }) => jsonTool({ output: banalize(input, intensity as AnttiIntensity) })
  );

  server.registerTool(
    "emotional_weather",
    {
      title: "Analyze emotional weather",
      description: "Return business-emotion hypotheses with evidence and operational impact. Does not claim to read minds.",
      inputSchema: {
        input: z.string().min(1)
      }
    },
    ({ input }) => jsonTool({ emotionalWeather: analyzeEmotionalWeather(input) })
  );

  server.registerTool(
    "enterprise_gravity",
    {
      title: "Analyze enterprise gravity",
      description: "Return partner-safe platform/process gravity findings.",
      inputSchema: {
        input: z.string().min(1)
      }
    },
    ({ input }) => jsonTool({ enterpriseGravity: analyzeEnterpriseGravity(input) })
  );

  server.registerTool(
    "compress",
    {
      title: "Compress corporate text",
      description: "Strip ceremony from text and report word count reduction. Fewer tokens, same meaning. Use before storing prompts, context, or memory entries. Returns Token Austerity Office report.",
      inputSchema: {
        input: z.string().min(1)
      }
    },
    ({ input }) => jsonTool(compress(input))
  );

  server.registerTool(
    "plan",
    {
      title: "Generate a proof-not-press plan",
      description: "Convert a vague enterprise ask into tasks with acceptance criteria and testable checks.",
      inputSchema: {
        goal: z.string().min(1)
      }
    },
    ({ goal }) => jsonTool(plan(goal))
  );

  server.registerTool(
    "generate_meme",
    {
      title: "Generate a workplace absurdity meme",
      description: "Select an imgflip meme template matching enterprise signals in the input. Optionally captions it via the imgflip API (requires IMGFLIP_USERNAME and IMGFLIP_PASSWORD env vars).",
      inputSchema: {
        input: z.string().min(1),
        generate_url: z.boolean().default(true)
      }
    },
    async ({ input, generate_url }) => {
      const result = generate({ mode: "diagnose", input, intensity: "default" });
      const template = result.analysis.memeSuggestion;
      if (!generate_url) {
        return jsonTool({ ...template, memeUrl: null, fallbackReason: "skipped via generate_url:false" });
      }
      const memeResult = await generateMemeUrl(template);
      return jsonTool(memeResult);
    }
  );

  server.registerTool(
    "generate_spec",
    {
      title: "Generate an OpenSpec document",
      description: "Runs the full Antti Stack pipeline on input — satire analysis, compression, plan — and produces an OpenSpec-format Markdown document. Satire is the source of truth; requirements are derived from satirical signal detection. Pass previous_spec (a prior OpenSpecDocument JSON) to get a delta showing ADDED/MODIFIED/REMOVED requirements.",
      inputSchema: {
        input: z.string().min(1),
        format: z.enum(["markdown", "json"]).default("markdown"),
        previous_spec: z.string().optional().describe("JSON string of a prior OpenSpecDocument for delta comparison")
      }
    },
    ({ input, format, previous_spec }) => {
      const result = generate({ mode: "diagnose", input, intensity: "default" });
      const planResult = plan(input);
      const doc = generateSpec(input, result.analysis, planResult.tasks, planResult.acceptanceCriteria);

      if (previous_spec) {
        const previous = JSON.parse(previous_spec) as OpenSpecDocument;
        const delta = compareSpecs(previous, doc);
        return jsonTool(format === "json" ? delta : { markdown: formatDeltaSpec(delta) });
      }

      return jsonTool(format === "json" ? doc : { markdown: formatSpec(doc) });
    }
  );

  server.registerTool(
    "memory_search",
    {
      title: "Search local Antti memory",
      description: "Search local JSONL memory. Defaults to .antti/memory.jsonl.",
      inputSchema: {
        query: z.string().min(1),
        path: z.string().default(".antti/memory.jsonl")
      }
    },
    ({ query, path }) => jsonTool({ records: searchMemory(path, query) })
  );

  server.registerTool(
    "memory_add",
    {
      title: "Compress and store context",
      description: "Agent-agnostic context compression. Any agent can push verbose corporate text here: ceremony is stripped, signals are indexed, and the lean version is stored. Keeps agent context windows clean. Returns what was stored plus compression stats.",
      inputSchema: {
        text: z.string().min(1),
        source: z.string().optional(),
        category: z.enum(["corporate_fog", "enterprise_gravity", "emotional_weather", "erp_archaeology", "decision_fossils", "satire_fixtures", "reviewer_notes", "general"]).optional(),
        path: z.string().default(".antti/memory.jsonl")
      }
    },
    ({ text, source, category, path }) => jsonTool(
      addContextMemory({ path, text, source, category: category as Parameters<typeof addContextMemory>[0]["category"] })
    )
  );

  return server;
}

function jsonTool(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

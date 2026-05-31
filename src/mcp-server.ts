import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { addContextMemory, searchMemory } from "./memory.js";
import { captionMeme } from "./meme.js";
import { fetchMemeTemplates } from "./meme-templates.js";

export function createAnttiMcpServer(): McpServer {
  const server = new McpServer({
    name: "antti-stack",
    version: "0.1.0"
  });

  server.registerTool(
    "get_meme_templates",
    {
      title: "get_meme_templates — list imgflip popular meme templates",
      description:
        "Fetches the top 100 popular meme templates from imgflip.com/popular-meme-ids. Returns id, name, and alternate names for each. Use this to browse available templates before calling caption_meme. Results are cached for the session.",
      inputSchema: {}
    },
    async () => {
      const templates = await fetchMemeTemplates();
      return jsonTool({ templates });
    }
  );

  server.registerTool(
    "caption_meme",
    {
      title: "caption_meme — generate captioned meme via imgflip API",
      description:
        "Captions a meme template with the provided text boxes and returns the URL and inline image. Requires IMGFLIP_USERNAME and IMGFLIP_PASSWORD env vars. Call get_meme_templates first to find the right template_id. boxes is an array of caption strings — match the count to the template (most templates use 2 boxes, some use 3–5).",
      inputSchema: {
        template_id: z.string().min(1).describe("imgflip template ID from get_meme_templates"),
        template_name: z.string().min(1).describe("template name for labelling the result"),
        boxes: z.array(z.string().min(1)).min(1).max(20).describe("caption text for each box in order")
      }
    },
    async ({ template_id, template_name, boxes }) => {
      const result = await captionMeme(template_id, template_name, boxes);

      const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [
        { type: "text", text: JSON.stringify(result, null, 2) }
      ];

      if (result.memeUrl) {
        try {
          const imgResponse = await fetch(result.memeUrl);
          const buffer = await imgResponse.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          content.push({ type: "image", data: base64, mimeType: "image/jpeg" });
        } catch {
          // image fetch failed — URL is still in the JSON above
        }
      }

      return { content };
    }
  );

  server.registerTool(
    "memory_search",
    {
      title: "memory_search — retrieve stored context",
      description: "Search local JSONL memory by keyword. Defaults to .antti/memory.jsonl.",
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
      title: "memory_add — store context",
      description:
        "Store a note, observation, or finding in local JSONL memory. Text is compressed before storage to keep the file lean. Returns what was stored and compression stats.",
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

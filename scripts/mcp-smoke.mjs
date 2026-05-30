import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/mcp.js"],
  cwd: process.cwd(),
  stderr: "pipe"
});

const client = new Client({ name: "antti-stack-smoke", version: "0.1.0" });
await client.connect(transport);

const tools = await client.listTools();
const names = tools.tools.map((tool) => tool.name).sort();
const required = ["generate", "diagnose", "codec", "emotional_weather", "enterprise_gravity", "memory_search"];

for (const name of required) {
  if (!names.includes(name)) {
    throw new Error(`Missing MCP tool: ${name}`);
  }
}

const result = await client.callTool({
  name: "diagnose",
  arguments: {
    input: "Power BI definitions live in Excel before go-live.",
    intensity: "safe"
  }
});

const text = result.content?.[0]?.type === "text" ? result.content[0].text : "";
if (!text.includes("enterpriseGravity") || !text.includes("emotionalWeather")) {
  throw new Error("MCP diagnose result did not include expected analysis fields.");
}

await client.close();
console.log(`MCP smoke passed with ${names.length} tools.`);
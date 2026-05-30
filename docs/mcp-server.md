# MCP Server

Antti Stack exposes a stdio MCP server for local agent clients.

Run from source:

```bash
npm run dev:mcp
```

Run after build:

```bash
npm run build
node dist/mcp.js
```

Package binary after install/link:

```bash
antti-mcp
```

## Tools

- `generate`: generate any Antti mode.
- `diagnose`: run the full diagnostic stack.
- `banalize`: reduce corporate fog into plainer operational meaning.
- `emotional_weather`: return business-emotion hypotheses with evidence and impact.
- `enterprise_gravity`: return partner-safe platform/process gravity findings.
- `satirize`: induce controlled Antti-style tone.
- `desatirize`: reduce styled/corporate text to plain operational meaning.
- `codec`: run the Satire Codec directly with `direction: reduce | induce`.
- `memory_search`: search local `.antti/memory.jsonl` or a provided JSONL path.

## Smoke Test

```bash
npm run test:mcp
```

This builds the TypeScript package, starts the stdio MCP server through the SDK client transport, lists tools, and calls `diagnose`.

## Client Config Shape

Example MCP client entry:

```json
{
  "mcpServers": {
    "antti-stack": {
      "command": "node",
      "args": ["C:/repo/antti-stack/dist/mcp.js"]
    }
  }
}
```

The server is intentionally local-first. It does not call model providers.

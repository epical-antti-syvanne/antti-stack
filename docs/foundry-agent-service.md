# Microsoft Foundry Agent Service Adapter Plan

Antti Stack should support Microsoft Foundry Agent Service after the MCP and schema layers are stable.

Current Microsoft docs describe Foundry Agent Service as a managed platform for building, deploying, and scaling agents. Agent shapes include prompt agents, workflow agents, and hosted agents. Foundry supports built-in and custom tools, including MCP integrations.

Sources:

- https://learn.microsoft.com/en-us/azure/ai-foundry/agents/overview
- https://learn.microsoft.com/en-us/azure/foundry/agents/overview
- https://learn.microsoft.com/en-us/azure/ai-services/agents/how-to/tools/overview
- https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/vs-code-agents-mcp

## Target Shapes

### Prompt Agent

Use for partner-safe writing and diagnosis where deterministic tools are enough.

Inputs:

- user workplace text
- requested mode
- safety/tone preference

Tools:

- Antti MCP `diagnose`
- Antti MCP `codec`
- Antti MCP `satirize`
- Antti MCP `desatirize`

### Workflow Agent

Use for repeatable review pipelines:

```text
input -> desatirize -> diagnose -> enterprise_gravity -> emotional_weather -> human_review_queue
```

### Hosted Agent

Use only when Antti needs custom runtime behavior that cannot be represented as prompt + tools.

## Tooling Strategy

- Prefer MCP server first.
- Add HTTP/OpenAPI wrapper only when a target host requires it.
- Keep all adapters using `docs/agent-response-contract.md`.

## Security And Identity

- Treat memory as local-first until explicitly deployed.
- Do not persist secrets.
- Keep customer data out of examples and fixtures.
- Use Foundry identity/security controls when cloud-hosted.

## Evaluation

Foundry-facing evaluations should include:

- no invented facts
- no emotional certainty claims
- partner-safe Microsoft satire
- no personal attacks
- meaning preserved after codec transforms

## Acceptance

- Foundry adapter can call the same MCP tools as local agents.
- Prompt/workflow/hosted options are documented before implementation.
- Deployment requires explicit environment and identity configuration.
# Microsoft 365 Copilot Agent Adapter Plan

Antti Stack should package into Microsoft 365 Copilot as a declarative/custom agent once the CLI/MCP contracts are stable.

Current Microsoft docs describe declarative agents as Copilot customizations built from instructions, knowledge, and actions. The declarative agent manifest is the machine-readable contract for specializing the agent, and current guidance recommends using the latest manifest schema version. As of this planning pass, schema 1.6 docs point to schema 1.7 as the latest version for new agents.

Sources:

- https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agents-overview
- https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-declarative-agent
- https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-instructions
- https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.6

## Target Package Shape

```text
m365-copilot/
  appPackage/
    manifest.json
    declarativeAgent.json
  instructions/
    antti-agent.md
  knowledge/
    README.snapshot.md
    agent-response-contract.md
  actions/
    openapi.yaml
```

## Agent Instructions

The Copilot-facing agent must be partner-safe:

- Generate useful enterprise writing and diagnosis.
- Use satire as controlled style, not factual claim.
- Treat emotional weather as hypothesis only.
- Mock systems and rituals, not people or Microsoft employees.
- Prefer concise operational language.

## Knowledge Sources

Initial grounding candidates:

- `README.md`
- `TODO.md` excerpts
- `docs/agent-response-contract.md`
- `examples/codec/satire-codec.review.md`

## Actions

Preferred action route:

1. Antti MCP server for local/agent clients.
2. Later HTTP/OpenAPI wrapper for Copilot actions where required.

Candidate actions:

- `diagnose`
- `satirize`
- `desatirize`
- `codec`
- `emotional_weather`
- `enterprise_gravity`

## Acceptance

- Agent package remains partner-safe by default.
- Manifest/instructions are generated from tracked source files.
- Actions use the same schema as CLI/MCP.
- No provider-backed calls are required for deterministic local behaviors.

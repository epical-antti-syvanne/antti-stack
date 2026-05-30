# Antti Stack Microsoft 365 Copilot Adapter

This is a scaffold for packaging Antti Stack as a Microsoft 365 Copilot declarative/custom agent.

Status: planning scaffold, not yet deployable.

## Source Guidance

Current Microsoft docs describe declarative agents as packages with instructions, knowledge, and actions. Manifest schema docs currently point new agents toward the latest schema version. Validate before publishing because Microsoft naming and schema versions move with the confidence of a renamed workstream.

## Intended Flow

```text
Copilot user -> declarative agent instructions -> Antti action/API/MCP bridge -> AgentResponse JSON -> partner-safe response
```

## Files

- `appPackage/manifest.json`: placeholder Microsoft 365 app manifest.
- `appPackage/declarativeAgent.json`: placeholder declarative agent manifest.
- `instructions/antti-agent.instructions.md`: partner-safe agent behavior.
- `knowledge/README.md`: grounding source notes.
- `actions/openapi.yaml`: future HTTP action contract placeholder.

## Not Yet Done

- Replace placeholder IDs/domains.
- Validate manifest schema against the currently latest Microsoft schema.
- Add HTTP/OpenAPI bridge if Copilot action packaging requires it.
- Package and test in an actual Microsoft 365 tenant.
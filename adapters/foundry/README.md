# Antti Stack Foundry Adapter

This scaffold maps Antti Stack into Microsoft Foundry Agent Service shapes.

Status: planning scaffold, not yet deployable.

## Shapes

- Prompt agent: safe writing and diagnosis using Antti MCP tools.
- Workflow agent: repeatable text pipeline with review gates.
- Hosted agent: deferred until custom runtime hosting is actually needed.

## Files

- `agents/prompt-agent.json`: prompt-agent style configuration.
- `workflows/review-workflow.json`: deterministic review workflow shape.
- `evals/evaluation-plan.json`: evaluation gates for partner-safe satire and fact preservation.

## Principle

Use MCP first. Add HTTP/OpenAPI only when the target runtime requires it.
# Changelog

All notable changes to Antti Stack will be documented here.

This project follows the spirit of Keep a Changelog and Semantic Versioning, without pretending pre-1.0 software has achieved adulthood.

## [Unreleased]

Nothing is unreleased. Everything is in-progress. This is the enterprise condition.

---

## [0.1.0] - 2026-05-30

First real release. The satire is operational.

### Added

**Core agent**
- `antti` CLI with 10+ modes: `post`, `comment`, `banalizer`, `romcom`, `archaeology`, `governance`, `architecture`, `diagnose`, `ideas`, `satirize`, `desatirize`, `codec`
- Structured `AgentResponse` JSON schema with stable output contract
- `--json`, `--analyze`, `--safe`, `--more-edge`, `--remember` flags

**Satire Codec**
- Bidirectional text transformation: `reduce` (corporate fog → plain meaning) and `induce` (plain meaning → controlled Antti tone)
- `antti satirize`, `antti desatirize`, `antti codec --direction reduce|induce`
- Codec fixtures: source → normalized meaning → styled output → risk labels

**Token Austerity Office**
- `antti compress`: strips ceremony phrases, reports word-count reduction, flags meaning survival
- Meme suggestion when reduction is 20%+
- 40+ ceremony phrase patterns

**Emotional Weather**
- Hypothesis-only detection of business emotions: fear, status anxiety, trust gaps, ownership avoidance, deadline theatre, budget panic
- Never claims emotional certainty

**Enterprise Gravity**
- Partner-safe Microsoft/ERP platform friction detection
- Excel-as-production, Teams governance, SharePoint sprawl, Power BI disputes, Azure landing-zone theatre, Entra identity fog, licensing weather

**OpenSpec**
- `antti spec`: satire signals → SHALL/MUST/SHOULD/MAY requirements → Given/When/Then scenarios → Markdown
- 10 signal-to-requirement mappings derived from satirical analysis
- Satire is the source of truth; requirements are derived from it

**Planner**
- `antti plan`: vague enterprise ask → tasks with testable acceptance criteria
- Proof-not-press gate: blocks impressive claims without runnable evidence

**Meme engine**
- `antti meme`: 13 enterprise signal → imgflip template mappings
- Optional URL generation via imgflip API (requires env vars, never logged)
- Meme suggestions surface in `diagnose` and `compress` output

**Memory**
- `antti memory`, `antti memory-add`: local JSONL memory at `.antti/memory.jsonl`
- Agent-agnostic: any agent (Claude, ChatGPT, Copilot) pushes verbose text; ceremony is stripped before storage
- 8 categories: `corporate_fog`, `enterprise_gravity`, `emotional_weather`, `erp_archaeology`, `decision_fossils`, `satire_fixtures`, `reviewer_notes`, `general`
- Secret scrubbing before write

**MCP server**
- `antti-mcp`: 14 tools over stdio — Claude Desktop, Claude Code, GitHub Copilot
- `antti-mcp-http`: same 14 tools over Streamable HTTP (MCP 2025-03-26) — ChatGPT, remote agents
- Shared tool factory `createAnttiMcpServer()`
- Tools: `generate`, `diagnose`, `banalize`, `satirize`, `desatirize`, `codec`, `compress`, `plan`, `generate_spec`, `generate_meme`, `emotional_weather`, `enterprise_gravity`, `memory_search`, `memory_add`

**Platform adapters**
- M365 Copilot declarative agent scaffold and validation script
- Foundry Agent Service scaffold and validation script

**Evaluation corpus**
- `examples/golden/forbidden-phrases.json`: LinkedIn soup, vendor attack, emotional overclaiming, fact invention, personal attacks
- 48 tests covering all layers

**Open source**
- MIT license, copyright Antti Syvänne
- NOTICE file with BSD/ISC dependency attributions
- CONTRIBUTING.md with proof-not-press requirement and Partner-Safe Satire Policy
- CI workflow (push/PR to main), release workflow (v* tags → npm publish + GitHub release)
- Finnish trivia human-check gate for external issues/PRs

### Philosophy

My personality is mine but it can be used to improve the world.

Satire is the primary conveyor of truth. The code makes it usable. The memory keeps it lean. The meme keeps it honest.

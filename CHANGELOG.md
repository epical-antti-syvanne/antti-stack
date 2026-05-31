# Changelog

All notable changes to Antti Stack will be documented here.

This project follows the spirit of Keep a Changelog and Semantic Versioning, without pretending pre-1.0 software has achieved adulthood.

## [Unreleased]

### Added

- Published to npm as `@syvnne/antti-stack`. Install: `npm install -g @syvnne/antti-stack`

### Changed — MCP architecture (I/O only)

- **MCP stripped from 11 tools to 4.** Removed: `depress`, `plan`, `generate_spec`, `emotional_weather`, `enterprise_gravity`, `data_platform`, `archaeology`, `casing`. These were hardcoded rule-based analysis — the agent does this better from its own knowledge via skills. Kept: `get_meme_templates`, `caption_meme`, `memory_search`, `memory_add`. These require I/O the agent cannot do itself.
- MCP `generate_meme` replaced by two tools: `get_meme_templates` (live fetch from imgflip.com/popular-meme-ids) and `caption_meme` (agent provides template + captions, MCP executes imgflip API, returns URL + inline image).

### Added — Skills

- `prompts/skills/` with 14 skill files: `diagnose`, `roast`, `depress`, `plan`, `spec`, `casing`, `dataplatform`, `archaeology`, `reduce`, `induce`, `commit`, `review`, `standup`, `jira`. Each is a standalone system prompt replacing the equivalent hardcoded MCP tool.

### Added — Agents

- `prompts/agents/` with 4 subagent definitions: `antti-archaeologist` (read-only code investigation), `antti-builder` (surgical edits, 1–2 files), `antti-auditor` (diff review, no praise), `antti-junior` (executes exactly the ticket, nothing more).

### Added — Hooks and Statusline

- `src/hooks/antti-activate.js` (SessionStart): injects Antti skill, detects enterprise gravity signals in repo, triggers model setup if `~/.antti/models.json` missing or >30 days old.
- `src/hooks/antti-mode-tracker.js` (UserPromptSubmit): per-turn skill reinforcement, turn counter with context discipline warnings at turns 8/12/15, topic drift detection.
- `src/hooks/antti-statusline.sh` / `antti-statusline.ps1`: reads `.antti-active` flag and outputs mode badge (`⚡ Antti`, `🔥 Antti:roast`, `🛡 Antti:safe`) for Claude Code status bar. Registered automatically by `antti setup`.

### Added — Setup

- `antti setup`: auto-detects Claude Code, Codex, VS Code, Pi. Writes MCP config, injects skill, installs hooks.
- `antti setup --init`: writes per-repo rule files (`AGENTS.md`, `.github/copilot-instructions.md`).
- `antti models`: shows current model configuration (`~/.antti/models.json`).
- Model setup is agent-driven: hook injects setup instructions at session start if config is missing or stale.

### Changed — CLI meme command

- `antti meme` now requires `--template <id>` and caption boxes as positional args. No signal-based selection.
- `antti meme --list` fetches live templates from imgflip.com/popular-meme-ids.
- imgflip credentials saved to `~/.antti/imgflip.json` (persists across terminals without `setx`).

### Removed

- Removed the former Microsoft 365 Copilot and Microsoft Foundry adapter scaffolds, validation scripts, and planning docs.
- Removed `npm install claude` placeholder package (was a redirect stub, not the Anthropic CLI).

---

## [0.1.0] - 2026-05-30

First real release. The satire is operational.

Note: this section records the v0.1.0 release state. Current post-release MCP changes are listed under Unreleased.

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
- `antti depress`: strips ceremony phrases, reports word-count reduction, flags meaning survival
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
- Meme suggestions surface in `diagnose` and `depress` output

**Memory**
- `antti memory`, `antti memory-add`: local JSONL memory at `.antti/memory.jsonl`
- Agent-agnostic: any agent (Claude, ChatGPT, Copilot) pushes verbose text; ceremony is stripped before storage
- 8 categories: `corporate_fog`, `enterprise_gravity`, `emotional_weather`, `erp_archaeology`, `decision_fossils`, `satire_fixtures`, `reviewer_notes`, `general`
- Secret scrubbing before write

**MCP server**
- `antti-mcp`: release-time 14-tool surface over stdio — Claude Desktop, Claude Code, GitHub Copilot
- `antti-mcp-http`: release-time 14-tool surface over Streamable HTTP (MCP 2025-03-26) — ChatGPT, remote agents
- Shared tool factory `createAnttiMcpServer()`
- Tools: `generate`, `diagnose`, `banalize`, `satirize`, `desatirize`, `codec`, `depress`, `plan`, `generate_spec`, `generate_meme`, `emotional_weather`, `enterprise_gravity`, `memory_search`, `memory_add`

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

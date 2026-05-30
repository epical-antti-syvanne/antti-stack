# Antti Stack TODO

## Architecture Decision (standing)

**MCP is the primary interface. CLI is local support.**

Claude, ChatGPT, GitHub Copilot, and local models call the MCP tools directly. The CLI exists so a human can run the same tools locally — to test, debug, or operate without an agent in the loop. Same underlying functions. Different surface.

New features go into the MCP tools first. CLI commands follow from the same functions. No feature is CLI-only unless it only makes sense for human interaction (interactive prompts, formatted terminal output).

## Product Direction

Antti Stack is a set of tools for agents and the humans who work with them. The agent is the primary caller. The human is the operator.

The point of view:

- AI can create useful output.
- AI can structure work, compress language, remember patterns, and produce surprisingly good drafts.
- AI cannot reliably read human emotions.
- Business runs on emotions: fear, trust, status, pride, fatigue, risk avoidance, budget anxiety, political safety, and the need to look aligned in front of adults with titles.
- Therefore the agent must never claim emotional certainty.
- The agent should produce emotional hypotheses, not emotional facts.
- The real value is helping humans name what the organization is doing without pretending the machine understands the room.

## Voice Direction

Keep the README layout and core Antti voice.

Increase the Microsoft satire, but keep it partner-safe:

- Criticize enterprise rituals, product gravity, licensing fog, admin portals, Teams archaeology, SharePoint folder cosmology, Excel-as-production, and certification Pokemon logic.
- Avoid direct claims that Microsoft is bad, malicious, incompetent, or harmful.
- Frame the joke as "we all live inside the game and occasionally the game invoices us."
- Keep the useful relationship intact: Microsoft platforms are still where much of the enterprise work happens.
- Target the machinery, not named people or partner relationships.

Working stance:

```text
Sometimes you hate the player.
Sometimes you love the game.
Sometimes the game is Microsoft 365 licensing and everyone has decided this is civilization.
```

## Architecture Direction

Mermaid diagrams in README. Done.

The architecture diagram shows agent→MCP→tools, with CLI as a side branch. No arrows between tools — each tool is independent. No pipeline implied.

Remaining diagram work:
- [ ] Emotion gap diagram: AI output capability vs human business reality (the emotional weather rationale made visual)

## Platform Support Requirements

Add first-class support requirements for both Microsoft 365 Copilot agent packaging and Microsoft Foundry Agent Service deployment shapes.

Microsoft 365 Copilot declarative/custom agent assumptions:

- Agent package includes clear instructions, bounded knowledge sources, and explicit actions.
- Agent manifest is versioned and validated before distribution.
- Distribution path supports Teams and broader Microsoft 365 surfaces.
- Packaging stays partner-safe and operationally reviewable.

Microsoft Foundry Agent Service assumptions:

- Support prompt agents, workflow agents, and hosted agents as explicit implementation targets.
- Support tools via native tools, MCP, and custom functions.
- Support identity and security controls as first-class deployment requirements.
- Support tracing, evaluation, and publishing lifecycle requirements.

## Caveman-Inspired Ideas To Adapt

Caveman's useful architecture ideas:

- Treat tokens as a resource, not a free mist.
- Compress prompts, outputs, context files, and tool payloads separately.
- Use a spec-driven workflow: spec -> plan -> execute -> verify.
- Add persistent cross-agent memory using local-first storage.
- Expose memory through MCP so different agents can reuse the same observations.
- Make each layer useful alone and stronger when stacked.
- Prefer "proof, not press": tests, examples, schemas, and repeatable checks.

Satirical reading:

- Caveman is token austerity with better branding: fewer words, same work, less billable mist.
- Compression is not only cost reduction; it is anti-ceremony. If a prompt cannot survive compression, it may have been a transformation program.
- Cavekit is what happens when "spec > vibes" escapes the slide deck and starts demanding acceptance criteria.
- Cavemem is the institutional memory organizations pretend SharePoint already provides.
- Caveman Code's reduced tool-call grammar is a useful warning: most agent platforms are chatty because enterprise systems believe verbosity is governance.
- "Proof, not press" should become an Antti rule: no architecture claim survives without an example, a test, or a small shameful artifact.
- The stack should parody modern agentic tooling while still being useful enough that the parody becomes infrastructure.

Antti Stack adaptations:

- `Ceremony Compressor`: reduces corporate language into concrete work.
- `Spec Theatre Detector`: checks whether a plan has acceptance criteria or only vibes.
- `Emotional Weather Layer`: flags possible business emotions behind the words without pretending certainty.
- `Enterprise Gravity Layer`: detects Microsoft/ERP/platform lock-in patterns in a partner-safe way.
- `Memory of Corporate Trauma`: stores recurring patterns, phrases, decisions, and known absurdities locally.
- `Reduced Ritual Kernel`: compact internal grammar for common agent tool calls and output sections.
- `Token Austerity Office`: reports how much language was removed and whether meaning survived the downsizing.
- `Satire Codec`: a bidirectional transformation layer that normalizes styled corporate text into plain operational meaning and re-applies controlled Antti-style tone when requested.
- `SharePoint Memory Simulator`: demonstrates what proper local memory does by being more findable than the official document repository.
- `Proof-Not-Press Harness`: blocks impressive claims unless they have tests, examples, fixtures, or an embarrassing reproduction case.
- `Spec-To-Despair Loop`: turns a vague enterprise ask into spec, plan, execution checks, and one dry note about what reality will probably do next.
- `Context Composting`: compresses README, TODO, prompts, examples, and prior decisions into reusable agent context without making every agent reread the entire municipal archive.

### Caveman Stack Alignment

- [x] Implement an Antti-flavored compression report for CLI outputs: original length, compressed summary, retained meaning, removed ceremony.
- [x] Add `antti compress` as a local primitive for prompts, README sections, TODO slices, and generated outputs.
- [x] Add `antti desatirize` to normalize corporate/satirical formatting into plain operational meaning.
- [x] Add `antti satirize` to apply controlled Antti-style tone to plain operational meaning.
- [x] Add `antti codec --direction reduce|induce --format text|json` for automation.
- [x] Add a codec fixture set: source text -> normalized meaning -> styled output -> risk labels.
- [x] Add `antti spec` or `antti plan` as the Cavekit-like workflow: goal, scope, tasks, acceptance criteria, verification.
- [x] Add memory commands that behave like Cavemem but store corporate absurdity, decisions, reviewer notes, and known enterprise gravity patterns.
- [x] Add a Reduced Ritual Kernel for common operations: diagnose, compress, plan, remember, recall, verify, package.
- [x] Add proof artifacts for every public claim: test, fixture, example, schema, or reproducible CLI command.
- [x] Keep each layer independently useful: compression without memory, memory without MCP, MCP without dashboard, dashboard only if reality becomes unavoidable.
- [x] Make the README explicitly mirror the stack story: agent → MCP → tools, CLI as local support surface.

Acceptance:

- Caveman inspiration is visible as structure, not copy-paste branding.
- The satire lands on token waste, context bloat, workflow theatre, and agent forgetfulness.
- Satire transformation can move both directions: reduce style to meaning, then induce style from meaning.
- The tooling remains useful even if the joke is removed by procurement.
- Every "agentic" feature has a small proof artifact before it receives a grand name.

## Implementation Phases

### Phase 1: README Reframe

- [x] Preserve existing README structure.
- [x] Replace broken mojibake characters with clean UTF-8 text.
- [x] Replace ASCII architecture with Mermaid diagrams.
- [x] Add the agentic thesis: AI creates good work but cannot read emotions; emotions run the business.
- [x] Add partner-safe Microsoft satire throughout examples and anti-patterns.
- [x] Add a "Vendor Gravity" or "Enterprise Gravity" section instead of an explicit anti-Microsoft section.
- [x] Add examples involving Teams, SharePoint, Excel, Power BI, Azure, Entra, licensing, and certification renewal.
- [x] Add a Caveman-inspired ecosystem narrative: compression primitive, spec workflow, memory, CLI, platform adapters.
- [x] Add "fewer ceremonies, same work" positioning as the Antti sibling to "fewer words, same work."
- [x] Keep the tone dry, technically credible, and not legally exciting.

Acceptance:

- README still feels like Antti Stack.
- Microsoft jokes are obvious to humans but defensible as system/process satire.
- Mermaid renders on GitHub.
- No direct vendor attack phrasing.
- Caveman influence is acknowledged as an architectural pattern and satirized as enterprise token austerity.

### Phase 2: Tool Schema

- [x] Formalize `AgentResponse` JSON schema.
- [x] Add schema docs for findings, relations, governance artifacts, architecture artifacts, and emotional hypotheses.
- [x] Add `--schema` CLI command or docs output.
- [x] Add tests that lock the JSON response shape.

Acceptance:

- Future MCP/API/VS Code layers can depend on stable contracts.

### Phase 3: Emotional Weather Layer

- [x] Add `emotion.ts`.
- [x] Detect emotional business signals such as fear, status anxiety, trust gaps, ownership avoidance, deadline theatre, and budget panic.
- [x] Return hypotheses with confidence and evidence phrases.
- [x] Add `--mode weather` or include emotional weather in `diagnose`.
- [x] Add tests proving it does not claim emotional certainty.

Acceptance:

- Output says "possible signal" or "hypothesis", never "the business feels".
- The layer explains why the emotion matters operationally.

### Phase 4: Enterprise Gravity Layer

- [x] Add Microsoft-adjacent detection without naming it as hate.
- [x] Detect Excel-as-production, SharePoint folder sprawl, Teams-channel governance, Power BI semantic model disputes, Azure landing-zone theatre, Entra naming fog, and licensing confusion.
- [x] Add partner-safe replacements and jokes.
- [x] Add examples and tests.

Acceptance:

- Output can mock the platform gravity while preserving plausible partner dignity.

### Phase 4B: Satire Codec

Goal: build a real text-transformation subsystem with humor as a controlled style layer, not an uncontrolled generator.

- [x] Add typed codec API: `transformText({ direction, input, tone, safety, format })`.
- [x] Add `reduce` direction: remove corporate fog, Antti formatting, mock-bureaucratic ceremony, and joke scaffolding while preserving operational meaning.
- [x] Add `induce` direction: apply Antti-style dry corporate satire around plain operational meaning without inventing facts.
- [x] Add CLI commands: `desatirize`, `satirize`, and `codec`.
- [x] Add JSON output for integrations: normalized text, styled text, extracted facts, removed style markers, warnings, risk labels.
- [x] Add fixtures for round-trip behavior: corporate fog -> plain meaning -> partner-safe satire.
- [x] Add evaluation labels: `safe`, `sharp`, `too mean`, `too vendor-specific`, `too LinkedIn`, `meaning drift`, `fact invented`, `needs human review`.
- [x] Add integration hooks so M365 Copilot, Foundry agents, MCP tools, and future VS Code commands can use the same codec contract.
- [x] Add deterministic fallback transforms for common phrases so the feature remains useful without provider-backed LLM calls.

Acceptance:

- Reducing satire produces useful plain-language work statements.
- Inducing satire preserves facts and does not create fake personal experience.
- Round-trip tests allow style drift but block meaning drift.
- Human review cases are collected for borderline humor.
- The same codec API works from CLI, future MCP/API, and future Microsoft agent adapters.
- The feature can be demonstrated with local deterministic fixtures before any model provider is involved.

### Phase 5: Memory

Memory is an agent-agnostic context compression layer. Any agent — Antti Stack, Claude, Copilot, a custom pipeline — can push verbose corporate text in. Corporate syntax is stripped before storage. What gets stored is the compressed, signal-indexed, ceremony-free version. Agent context windows stay small. Users stay happy.

The memory layer does not store what the agent said. It stores what the agent meant, after removing the ceremony it arrived in.

- [x] Local JSONL memory in `.antti/memory.jsonl`. Each record: timestamp, mode/source, compressed input, ceremony-free summary, warnings, signal tags, category.
- [x] `antti memory search/list/memory-add` CLI commands.
- [x] `memory_add` MCP tool: agent-agnostic entry point. Any agent pushes text, ceremony is stripped, lean context stored. Returns compression stats.
- [x] `memory_search` MCP tool: retrieve compressed context by query.
- [x] Ceremony stripped before storage via `compress()` pipeline.
- [x] Signal detection from raw text: maps corporate keywords to memory categories without requiring a full Antti analysis.
- [x] Memory categories: `corporate_fog`, `enterprise_gravity`, `emotional_weather`, `erp_archaeology`, `decision_fossils`, `satire_fixtures`, `reviewer_notes`, `general`.
- [x] Methodology summary: when Antti analysis is available, stores `[signal] LEVEL: derived requirement` instead of compressed output text.
- [x] Secret scrubbing before write. Emails, tokens, keys, card numbers.
- JSONL is the permanent format. Human-readable, zero dependency, portable, append-only. If search becomes slow, the compression is not aggressive enough.

Acceptance:

- Any agent can call `memory_add` via MCP and get back a compressed, tagged record — no knowledge of Antti Stack required.
- Memory search returns lean context that fits in an agent prompt without bloating the context window.
- Corporate ceremony is removed before storage, not after retrieval.

### Phase 6: Spec -> Plan -> Verify Workflow

- [x] Add `antti plan <spec>`.
- [x] Generate tasks with acceptance criteria.
- [x] Add verification commands/checks for docs, CLI, tests, and examples.
- [x] Add a plan status format inspired by Cavekit but Antti-flavored.
- [x] Add plan progress markers: `done`, `doing`, `blocked by reality`, and `waiting for governance oxygen`.
- [x] Add `proof-not-press` checks so impressive agentic claims require runnable evidence.

Acceptance:

- Every proposed change has a check.
- The plan is useful for humans, not just agent ceremony.
- The workflow reduces ambiguity instead of manufacturing a smaller operating model.

### Phase 7: MCP — Primary Interface

MCP is the primary interface. Agents call it. CLI is local support.

Two transports. Same 14 tools. Same core logic via `createAnttiMcpServer()`.

- **stdio** (`antti-mcp`): Claude Desktop, Claude Code, GitHub Copilot. No port, no hosting.
- **HTTP Streamable** (`antti-mcp-http`): ChatGPT, remote agents, any HTTP MCP client. Default `127.0.0.1:3000`.

- [x] `src/mcp-server.ts`: shared tool factory.
- [x] `src/mcp.ts`: stdio entry point.
- [x] `src/mcp-http.ts`: HTTP Streamable entry point.
- [x] 14 tools: `generate`, `diagnose`, `banalize`, `satirize`, `desatirize`, `codec`, `compress`, `plan`, `generate_spec`, `generate_meme`, `emotional_weather`, `enterprise_gravity`, `memory_search`, `memory_add`.
- [x] CLI runs the same functions locally — support surface, not primary.
- [ ] MCP `generate_spec` integration test with M365/Foundry adapters (requires deployed environment).

Acceptance:

- Any agent with an MCP client calls the tools without knowing about the CLI.
- stdio for local agents. HTTP for remote or team use.
- No hosting required for single-user local use.

### Phase 8: Evaluation Corpus

- [x] Add `examples/golden/`.
- [x] Store good outputs for each mode.
- [x] Add tests for forbidden phrases, excessive influencer tone, direct vendor attacks, and emotional overclaiming.
- [x] Add regression tests for Microsoft satire being partner-safe.

Acceptance:

- Style does not drift into LinkedIn soup or vendor lawsuit cosplay.

### Phase 9: Open-Source GitHub Layer

- [x] Add a GitHub issue/PR human-check gate based on random obscure Finnish trivia.
- [x] Require a designated human check answer for creator attribution; wrong creator answer closes or cancels the issue/PR.
- [x] Allow scheduled sweeps to close items that remain unanswered past SLA.
- [x] Allow maintainers to bypass the trivia gate explicitly for urgent or operational cases.
- [x] Document the policy and automation behavior in repo docs/workflows.

Acceptance:

- Gate is deterministic in behavior and auditable in logs.
- Wrong creator answer reliably closes/cancels the item.
- Unanswered items can be closed by scheduled sweep without manual cleanup.
- Maintainer bypass is explicit, traceable, and limited to maintainers.

## Multi-Agent Implementation Policy

This is the standing policy for all implementation work in this project. It is not a checklist.

**Model tier assignment**

- Bounded, low-risk work (source reading, summarization, fixture drafting, docs triage, mechanical edits): use cheaper/smaller models proactively. Do not reach for frontier models when a bounded task does not require deep reasoning.
- Coding implementation for scoped, well-specified tasks: use `gpt-5.3-codex` or equivalent mid-tier when practical.
- Testing, critique, final review, tricky integration verification, and high-risk judgment calls: reserve frontier models (`gpt-5.5` or equivalent).

**Scope management**

- Assign disjoint write scopes per subagent. Overlapping write targets require explicit approval.
- Keep one integration owner agent for the final compose/verify/test pass.
- Record subagent scope boundaries in plan artifacts before edits start.
- Coding agents do not repeat source-ingestion work already captured in summaries.
- Summarization agents do not receive full coding context by default.

**Token discipline**

- Treat token usage as a constrained resource: keep coding and summarization scopes disjoint.
- Avoid duplicated context payloads across agents working on the same task.
- Expensive model usage is intentional. It happens at verification boundaries, not routine implementation steps.

## Partner-Safe Satire Policy

This is the standing policy for all satire content in this project. It is not a checklist.

- Public documentation and default user-visible outputs must remain readable, professional, and partner-safe.
- Satire should be affectionate enough that people inside Microsoft can laugh because they recognize the enterprise machinery too.
- Target: platform gravity, licensing rituals, admin-console archaeology, naming churn, and Excel-as-production habits. Do not target Microsoft employees, partner teams, customers, or product groups as people.
- Any sharper internal satire corpus or fixtures must be stored behind an explicit, reversible, local-only encoding or encryption layer for maintainers only.
- Encoded satire fixtures are excluded from default customer output paths and treated as test material, not public messaging.
- Satire must never misrepresent platform behavior, deceive customers, or hide factual claims.
- Default outputs are partner-safe without manual filtering and can plausibly be appreciated by Microsoft-aligned readers.
- Customer-facing behavior is factually honest. Internal critique coverage stays testable.

## Immediate Next Sprint

Recommended next sprint:

- [x] Rewrite README sections only, preserving layout.
- [x] Convert architecture to Mermaid.
- [x] Add Caveman Stack Alignment section to README: primitive, workflow, memory, CLI, adapters.
- [x] Add first `antti compress` design stub and fixtures.
- [x] Add first `antti plan` design stub with proof-not-press checks.
- [x] Draft M365 Copilot agent packaging requirements (instructions, knowledge, actions, manifest, Teams/M365 distribution).
- [x] Add M365 Copilot adapter scaffold and validation script.
- [x] Draft Foundry Agent Service mapping (prompt/workflow/hosted agents; tools/MCP/custom functions; identity/security; tracing/evaluation/publishing).
- [x] Add Foundry Agent Service adapter scaffold and validation script.
- [x] Add emotional-weather types and first detector.
- [x] Add enterprise-gravity detector.
- [x] Add satire codec design and first fixtures for reduce/induce transformations.
- [x] Extend `diagnose` output to include emotional weather and enterprise gravity.
- [x] Add tests for those two layers.
- [x] Add acceptance tests proving customer-facing outputs remain politely aligned for Microsoft while internal enterprise-gravity critique remains testable.

## Feature: OpenSpec Integration

### What
`antti spec` runs the full Antti pipeline on any enterprise input and produces an OpenSpec-format Markdown document. Satire (emotional weather, enterprise gravity) is the source of truth. Requirements in SHALL/MUST/SHOULD/MAY language are derived directly from the satirical signal detection. The meme anchor stays in the output.

### Status
- [x] `src/spec.ts`: `generateSpec()`, `formatSpec()`, `specMemorySummary()`, signal→requirement map, signal→scenario map
- [x] `antti spec <input> [--json]` CLI subcommand
- [x] `generate_spec` MCP tool (13 tools total)
- [x] `"spec"` mode in `ANTTI_MODES` / `generate()`
- [x] Memory compaction uses `buildMethodologySummary()` — stores signal summary + first derived requirement, not plain compressed text
- [x] 4 tests covering requirements derivation, satire anchor presence, spec mode output, memory methodology summary
- [x] README: "One way to use multiple tools together" section — no pipeline arrows, each step independent, none required

### Signal-to-requirement map (implemented)
| Signal | Level | Requirement |
|--------|-------|-------------|
| excel_as_production | SHALL | System SHALL NOT use spreadsheets as production data sources |
| ownership_avoidance | MUST | Each item MUST have a named owner documented before go-live |
| deadline_pressure | SHALL | Go-live plan SHALL include verification gates with pass/fail criteria |
| power_bi_semantic_dispute | MUST | Key metrics MUST have one agreed definition approved by all teams |
| sharepoint_sprawl | SHOULD | Documents SHOULD have a canonical, linked location |
| teams_governance | MUST | Decisions MUST be documented in a traceable location, not only Teams |
| trust_gap | SHALL | Data definitions SHALL be version-controlled in a single authoritative source |
| budget_anxiety | SHOULD | Budget decisions SHOULD have approval records with named approvers |
| azure_landing_zone_theatre | SHOULD | Cloud deployments SHOULD use minimum governance layer required |
| entra_identity_fog | MUST | Identity policies MUST be documented with tenant scope and named reviewer |

### Remaining
- [x] Delta spec support: mark requirements as ADDED/MODIFIED/REMOVED relative to a prior spec — `antti spec <input> --compare prev.json`, MCP `generate_spec` with `previous_spec` param
- [x] Export to `.md` file via `antti spec <input> > spec.md` (works via shell redirection)
- MCP `generate_spec` integration test with M365/Foundry adapters — tracked in Phase 7.

## Feature: imgflip Meme Mode

### What
`antti meme` maps enterprise absurdity signals to imgflip meme templates and optionally generates a captioned image URL via the imgflip API. Meme suggestions also surface in `diagnose` output and `compress` output when ceremony is high.

### Status
- [x] `src/meme.ts`: signal-to-template map, `selectMemeTemplate`, `generateMemeUrl`, `formatMemeResult`, `extractMemeContext`, `selectMemeFromCeremonyLabels`
- [x] `antti meme <input> [--no-url] [--json]` CLI subcommand
- [x] `generate_meme` MCP tool (12 tools total)
- [x] `memeSuggestion` field on `AgentAnalysis` — always present, selected by gravity/emotion signals
- [x] Diagnose output includes `Meme suggestion:` section
- [x] Compress output includes meme suggestion when reduction ≥ 20%
- [x] `generateMemeUrl` returns `{ memeUrl: null, fallbackReason }` when `IMGFLIP_USERNAME`/`IMGFLIP_PASSWORD` env vars absent — no exception thrown
- [x] Fallback template: One Does Not Simply (memeId 61579) when no signal matches
- [x] 6 tests covering template selection, fallback, credential-absent behavior, diagnose/compress integration

### Signal-to-template map (implemented)

| Signal | memeId | Template |
|--------|--------|----------|
| excel_as_production | 55311130 | This Is Fine |
| power_bi_semantic_dispute | 87743020 | Two Buttons |
| sharepoint_sprawl | 188390779 | Woman Yelling At Cat |
| azure_landing_zone_theatre | 93895088 | Expanding Brain |
| teams_governance | 102156234 | Mocking Spongebob |
| entra_identity_fog | 101470 | Ancient Aliens |
| licensing_weather | 217743513 | UNO Draw 25 Cards |
| ownership_avoidance | 112126428 | Distracted Boyfriend |
| deadline_pressure | 131940431 | Gru's Plan |
| budget_anxiety | 217743513 | UNO Draw 25 Cards |
| status_anxiety | 129242436 | Change My Mind |
| change_fatigue | 4087833 | Waiting Skeleton |
| trust_gap | 91538330 | X, X Everywhere |
| (fallback) | 61579 | One Does Not Simply |

### Remaining
- [x] Add `IMGFLIP_USERNAME` / `IMGFLIP_PASSWORD` to `.env.example` with instructions.
- [x] Add meme suggestion to `plan` output when a high-ceremony goal is detected.
- [x] Add meme suggestion to `antti memory list` output for records with known gravity signals.
- imgflip integration test with real credentials — manual only, not in CI. Tracked in Deferred.

### Acceptance criteria (done)
- `antti meme "we track supplier data in Excel" --no-url` prints template name, text0, text1.
- `antti meme "anything" --no-url` never makes a network call.
- `antti --mode diagnose "our Excel is production"` output includes `Meme suggestion:` section.
- `antti compress` includes meme suggestion when reduction ≥ 20%.
- MCP `generate_meme` returns valid JSON with `memeId` and captions.
- When `IMGFLIP_USERNAME` is absent, `memeUrl` is `null` and `fallbackReason` is non-empty.
- `selectMemeTemplate` returns One Does Not Simply fallback for unknown signals.
- No credentials appear in any log, JSON result, or memory record.

## Deferred

- [ ] VS Code extension — CLI command palette wiring. Deferred: MCP covers the agent surface; VS Code extension is human convenience only.
- [ ] Browser dashboard — deferred until local model proven. Same reason.
- [ ] Provider-backed LLM generation — all current tools are deterministic. LLM generation deferred until a specific tool requires it and cannot be deterministic.
- [ ] Multi-agent reviewer/builder/investigator loop — deferred. Current architecture: one agent calls MCP tools. Multi-agent orchestration is the agent's job, not Antti Stack's.
- [ ] npm publish — package exists on GitHub. Name `antti-stack` not yet claimed on npm. Add `NPM_TOKEN` secret to GitHub repo to trigger the release workflow on the existing `v0.1.0` tag.
- [ ] imgflip integration test with real credentials — manual only, not in CI. Set `IMGFLIP_USERNAME` and `IMGFLIP_PASSWORD` and run `antti meme "any input"` to verify URL generation.
- [ ] Final website deployment — `website/` project targets Domainhotelli.fi. Deferred until tooling is stable enough to deserve a public front door.
- JSONL memory is permanent. Not SQLite.
- MCP is done: stdio + HTTP Streamable. Both use the same 14 tools.

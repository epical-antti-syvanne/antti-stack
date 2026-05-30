import type { AgentAnalysis } from "./agent.js";
import { compress } from "./compress.js";
import type { MemeTemplate } from "./meme.js";
import type { PlanTask } from "./plan.js";

export type RequirementLevel = "SHALL" | "MUST" | "SHOULD" | "MAY";

export interface OpenSpecRequirement {
  id: string;
  level: RequirementLevel;
  statement: string;
  derivedFrom: string;
}

export interface OpenSpecScenario {
  id: string;
  given: string;
  when: string;
  then: string;
}

export interface OpenSpecDocument {
  title: string;
  proposal: {
    satiricalDiagnosis: string;
    plainMeaning: string;
    compressionReport: string;
    memeAnchor: MemeTemplate;
  };
  requirements: OpenSpecRequirement[];
  scenarios: OpenSpecScenario[];
  tasks: PlanTask[];
  acceptanceCriteria: string[];
  proofNotPressStatus: string;
  derivedSignals: string[];
}

// Satire signal → OpenSpec requirement. The satirical finding IS the source of truth.
const SIGNAL_TO_REQUIREMENT: Record<string, { level: RequirementLevel; statement: string }> = {
  excel_as_production: {
    level: "SHALL",
    statement: "The system SHALL NOT use manually maintained spreadsheets as production data sources."
  },
  ownership_avoidance: {
    level: "MUST",
    statement: "Each data item and decision MUST have a named, accountable owner documented before go-live."
  },
  deadline_pressure: {
    level: "SHALL",
    statement: "The go-live plan SHALL include explicit verification gates with documented pass/fail criteria."
  },
  power_bi_semantic_dispute: {
    level: "MUST",
    statement: "All key metrics MUST have one agreed definition approved by all consuming teams before report publication."
  },
  sharepoint_sprawl: {
    level: "SHOULD",
    statement: "All project documents SHOULD have a canonical, linked location communicated to all stakeholders."
  },
  teams_governance: {
    level: "MUST",
    statement: "Decisions MUST be documented in a traceable, searchable location — not only in Teams channels."
  },
  trust_gap: {
    level: "SHALL",
    statement: "All data definitions SHALL be version-controlled and referenced from a single authoritative source."
  },
  budget_anxiety: {
    level: "SHOULD",
    statement: "Budget decisions SHOULD have explicit approval records with named approvers and dates."
  },
  status_anxiety: {
    level: "MAY",
    statement: "Steering group reviews MAY be replaced by documented asynchronous sign-off where velocity outweighs visibility ceremony."
  },
  change_fatigue: {
    level: "SHOULD",
    statement: "Change communications SHOULD include explicit rationale connecting the change to prior initiatives."
  },
  azure_landing_zone_theatre: {
    level: "SHOULD",
    statement: "Cloud deployment decisions SHOULD be scoped to the minimum governance layer required — not the maximum available."
  },
  entra_identity_fog: {
    level: "MUST",
    statement: "Identity and access policies MUST be documented with tenant scope, enforcement date, and named reviewer."
  },
  licensing_weather: {
    level: "SHOULD",
    statement: "License entitlements SHOULD be reviewed and documented at least once per renewal cycle with named accountable party."
  }
};

const SIGNAL_TO_SCENARIO: Record<string, { given: string; when: string; then: string }> = {
  excel_as_production: {
    given: "a manually maintained spreadsheet is the current source of record",
    when: "the governed system is available and validated",
    then: "the spreadsheet SHALL be deprecated and removed from the production path"
  },
  ownership_avoidance: {
    given: "a data item or decision has no documented owner",
    when: "a change or incident occurs",
    then: "resolution MUST NOT be blocked by ownership ambiguity — the owner MUST already be named"
  },
  deadline_pressure: {
    given: "a go-live date has been set",
    when: "readiness is assessed",
    then: "each acceptance criterion MUST have a documented pass/fail result before the date"
  },
  power_bi_semantic_dispute: {
    given: "two teams report different values for the same metric",
    when: "the authoritative definition is applied",
    then: "both reports MUST converge to the same figure or the discrepancy MUST be documented"
  },
  teams_governance: {
    given: "a decision is made in a Teams channel",
    when: "the decision needs to be referenced later",
    then: "a permanent, searchable record MUST exist outside the channel"
  }
};

export function generateSpec(input: string, analysis: AgentAnalysis, planTasks: PlanTask[], acceptanceCriteria: string[]): OpenSpecDocument {
  const compressResult = compress(scrubCeremony(input));
  const allSignals = [
    ...analysis.enterpriseGravity.map((g) => g.signal),
    ...analysis.emotionalWeather.map((e) => e.signal)
  ];

  const requirements = buildRequirements(allSignals, analysis);
  const scenarios = buildScenarios(allSignals);
  const satiricalDiagnosis = buildDiagnosis(analysis);
  const derivedSignals = [...new Set(allSignals)];

  const proofNotPressStatus = planTasks.every((t) => t.check.length > 0)
    ? `READY — ${planTasks.length} tasks, all have testable checks`
    : `NEEDS PROOF — some tasks lack verifiable checks`;

  return {
    title: extractTitle(input),
    proposal: {
      satiricalDiagnosis,
      plainMeaning: compressResult.compressed,
      compressionReport: `${compressResult.reductionPercent}% ceremony removed. ${compressResult.removedCeremony.length} patterns stripped.`,
      memeAnchor: analysis.memeSuggestion
    },
    requirements,
    scenarios,
    tasks: planTasks,
    acceptanceCriteria,
    proofNotPressStatus,
    derivedSignals
  };
}

export function formatSpec(doc: OpenSpecDocument): string {
  const lines: string[] = [
    `# ${doc.title}`,
    "",
    "## What the Satire Sees",
    "",
    doc.proposal.satiricalDiagnosis,
    "",
    "## What It Means",
    "",
    `> ${doc.proposal.plainMeaning}`,
    "",
    `_Ceremony reduction: ${doc.proposal.compressionReport}_`,
    "",
    "## Requirements",
    "",
    "_Derived directly from satirical signal detection. Satire is the source of truth._",
    "",
    ...doc.requirements.map((r) =>
      `**REQ-${r.id}** \`${r.level}\` ${r.statement}  \n_Derived from: ${r.derivedFrom}_`
    ),
    "",
    ...(doc.scenarios.length > 0 ? [
      "## Scenarios",
      "",
      ...doc.scenarios.map((s) => [
        `**SCN-${s.id}**`,
        `- Given: ${s.given}`,
        `- When: ${s.when}`,
        `- Then: ${s.then}`
      ].join("\n")),
      ""
    ] : []),
    "## Tasks",
    "",
    ...doc.tasks.map((t) =>
      `${t.id}. [ ] ${t.description}  \n   _check: ${t.check}_`
    ),
    "",
    "## Acceptance Criteria",
    "",
    ...doc.acceptanceCriteria.map((c) => `- ${c}`),
    "",
    `**${doc.proofNotPressStatus}**`,
    "",
    "## Satire Anchor",
    "",
    `_The satire is not decoration. It is the diagnosis._`,
    "",
    `**${doc.proposal.memeAnchor.memeName}**  `,
    `"${doc.proposal.memeAnchor.text0}" / "${doc.proposal.memeAnchor.text1}"`
  ];

  return lines.join("\n");
}

export function specMemorySummary(doc: OpenSpecDocument): string {
  const topReq = doc.requirements[0];
  const signals = doc.derivedSignals.slice(0, 3).join(", ");
  const reqLine = topReq ? `${topReq.level}: ${topReq.statement.slice(0, 100)}` : "no requirements derived";
  return `[${signals || "no signals"}] ${reqLine}`.slice(0, 280);
}

function buildRequirements(signals: string[], analysis: AgentAnalysis): OpenSpecRequirement[] {
  const reqs: OpenSpecRequirement[] = [];
  let idx = 1;

  for (const signal of [...new Set(signals)]) {
    const rule = SIGNAL_TO_REQUIREMENT[signal];
    if (rule) {
      reqs.push({ id: String(idx++).padStart(3, "0"), level: rule.level, statement: rule.statement, derivedFrom: signal });
    }
  }

  if (analysis.erpFindings.length > 0) {
    reqs.push({
      id: String(idx++).padStart(3, "0"),
      level: "SHALL",
      statement: "ERP field mappings SHALL be documented at column level with their source system and transformation logic before go-live.",
      derivedFrom: "erp_archaeology"
    });
  }

  if (analysis.fog.length > 0) {
    reqs.push({
      id: String(idx++).padStart(3, "0"),
      level: "SHOULD",
      statement: "All project communications SHOULD use plain, operational language. Ceremonial language SHOULD be reduced before distribution.",
      derivedFrom: "corporate_fog"
    });
  }

  return reqs;
}

function buildScenarios(signals: string[]): OpenSpecScenario[] {
  const scenarios: OpenSpecScenario[] = [];
  let idx = 1;

  for (const signal of [...new Set(signals)]) {
    const s = SIGNAL_TO_SCENARIO[signal];
    if (s) {
      scenarios.push({ id: String(idx++).padStart(3, "0"), given: s.given, when: s.when, then: s.then });
    }
  }

  return scenarios;
}

function buildDiagnosis(analysis: AgentAnalysis): string {
  const lines: string[] = [];

  if (analysis.emotionalWeather.length > 0) {
    lines.push("**Emotional weather (hypotheses, not facts):**");
    lines.push(...analysis.emotionalWeather.map((e) => `- ${e.hypothesis} _(${e.signal}, ${e.confidence})_`));
  }
  if (analysis.enterpriseGravity.length > 0) {
    lines.push("**Enterprise gravity signals:**");
    lines.push(...analysis.enterpriseGravity.map((g) => `- ${g.observation} ${g.partnerSafeJoke}`));
  }
  if (analysis.fog.length > 0) {
    lines.push("**Corporate fog detected:**");
    lines.push(...analysis.fog.map((f) => `- "${f.phrase}" → ${f.replacement}`));
  }
  if (analysis.erpFindings.length > 0) {
    lines.push("**ERP archaeology signals:**");
    lines.push(...analysis.erpFindings.slice(0, 3).map((e) => `- ${e.signal}: ${e.reason.slice(0, 80)}`));
  }

  return lines.length > 0 ? lines.join("\n") : "No strong signals detected. This is either fine or merely undocumented.";
}

function extractTitle(input: string): string {
  const clean = input.trim().replace(/[.!?]+$/, "");
  return clean.length <= 60 ? clean : clean.slice(0, 57).trim() + "...";
}

function scrubCeremony(input: string): string {
  return input.trim();
}

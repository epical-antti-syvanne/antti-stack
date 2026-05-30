# Agent Response Contract

This document describes the stable public shape of `AgentResponse` for CLI JSON, future MCP tools, Microsoft 365 Copilot agent adapters, Foundry agent adapters, and website demos.

The contract is intentionally plain JSON. No ceremony is allowed unless it has a field name.

## Top-Level Shape

```ts
interface AgentResponse {
  mode: AnttiMode;
  output: string;
  warnings: string[];
  analysis: AgentAnalysis;
}
```

## Modes

Current modes:

- `post`
- `comment`
- `banalizer`
- `romcom`
- `archaeology`
- `governance`
- `architecture`
- `diagnose`
- `ideas`
- `desatirize`
- `satirize`
- `codec`

## Analysis Shape

```ts
interface AgentAnalysis {
  fog: CorporateFogFinding[];
  erpFindings: ErpFinding[];
  relations: DatapointRelation[];
  emotionalWeather: EmotionalWeatherHypothesis[];
  enterpriseGravity: EnterpriseGravityFinding[];
  governance: GovernanceArtifact;
  architecture: ArchitectureArtifact;
}
```

## Emotional Weather Rule

Emotional Weather never claims to read minds.

Valid wording uses hypotheses such as:

```text
Possible budget anxiety...
Possible ownership avoidance...
```

Invalid wording:

```text
The business feels...
Everyone is afraid...
```

## Enterprise Gravity Rule

Enterprise Gravity is partner-safe. It may joke about platform gravity, licensing weather, Teams decision archaeology, SharePoint document discovery, Excel-as-production, and Power BI semantic disputes.

It must not attack Microsoft employees, customers, partner teams, or product groups as people.

## Codec Shape

`runCodec()` and CLI `--mode codec --json` return:

```ts
interface TransformTextResult {
  normalizedText: string;
  styledText: string;
  extractedFacts: string[];
  removedStyleMarkers: string[];
  warnings: string[];
  riskLabels: string[];
}
```

Risk labels are review/evaluation signals, not final moral judgments from the machine.

## Proof Commands

```bash
npm test
npm run build
node dist/cli.js --mode diagnose --json "Power BI semantic model definitions are still in Excel before go-live."
node dist/cli.js --mode codec --direction reduce --json "Obviously SAP invoice 2024 mapping is heroic, as one does!"
```
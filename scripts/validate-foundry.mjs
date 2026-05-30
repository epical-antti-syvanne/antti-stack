import { readFileSync } from "node:fs";

const files = [
  "adapters/foundry/agents/prompt-agent.json",
  "adapters/foundry/workflows/review-workflow.json",
  "adapters/foundry/evals/evaluation-plan.json"
];

for (const file of files) {
  const raw = readFileSync(file);
  if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
    throw new Error(`${file} contains a UTF-8 BOM.`);
  }

  const parsed = JSON.parse(raw.toString("utf8"));
  if (!parsed.name) {
    throw new Error(`${file} is missing name.`);
  }
}

console.log("Foundry adapter scaffold is valid JSON.");